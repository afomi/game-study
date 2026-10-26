---
title: The pitch
game: baseball-stars
episode: 1
status: draft
subsystem: pitching
scene: pitching
image: strike-out-93
summary: Every pitch in Baseball Stars comes with a radar reading. We go looking for that number, find out where it comes from, and model it as a small class with a test that replays 24 real pitches.
---

{% include screenshot.html game="baseball-stars" name="pitch-view" caption="The pitch, as the game first shows it: from behind the plate, the pitcher up top, a mini diamond, and both lineup cards." %}

## A radar gun in 1989

Here's something you might not notice the first time you play.
Throw a pitch in Baseball Stars, and the umpire's call comes with a speed.

{% include screenshot.html game="baseball-stars" name="strike-out-93" caption="Strike three, at 93 miles an hour." %}

STRIKE, 89.
STRIKE, 89.
STRIKE OUT, 93.
BALL, 81.

So the game is measuring its own pitches.
That's a gift.
If we want to understand how this game pitches, this number is the place to start.

This sketch asks two questions.
Where does the game keep that number?
And where does it come from?

## Where does a number live?

A game's numbers have to live somewhere, and on the NES there aren't many places to look.
The console has 2 kilobytes of working memory — 2,048 little boxes, each holding a number from 0 to 255.
The speed has to be in one of them.

So we paused the game on each call and searched every box for the speed.
We looked for 89 as a plain number.
We looked for an 8 and a 9 side by side.
We looked for the picture tiles that draw an 8 and a 9.

Nothing.
Not one box said 89.

## Two boxes that moved together

What we did find were boxes that rose and fell *with* the speed.
One climbed as pitches got faster: 1, 4, 6 for 81, 89, 93.
Another, {% ram baseball-stars pitch_travel_frames %}, fell, the way the time to reach the plate would.

Tempting!
But a number that moves *with* the speed isn't the speed.
Neither one turned out to be it.
(The first one turned out to be something much more interesting — the computer pitcher's plan for which buttons to hold.
That story is in [the whole pitch]({{ '/baseball-stars/04-the-whole-pitch/' | relative_url }}).)

## Catch it being drawn

So we flipped the question around.
Instead of hunting for the number, we watched for the moment it's drawn.

The NES can only safely change the picture during a short pause between frames.
Baseball Stars handles that with a to-do list: during the frame, the game writes "put these tiles here" into a {% ram baseball-stars screen_queue %}, and when the pause comes, the interrupt we meet in [the frame loop]({{ '/baseball-stars/02-the-frame-loop/' | relative_url }}) copies it all to the screen.

We set a trap on that to-do list for the frame the call box appears.
And there it was, going in: a screen address, a space, an 8, a 9, then three tiles that spell M/H.
Every entry came from one routine.

## A little long division

Here's that routine, lightly annotated.
You don't need to read 6502 to follow along — the comments tell the story.

```
D750  STA $02        ; the speed arrives
D752  JSR $C2D2      ; scale it (more on this below)
D755  LDA #$64       ; 100
D757  JSR $C311      ; divide: the hundreds digit
D75A  STA $15
D75C  LDA #$0A       ; 10
D75E  JSR $C311      ; divide: the tens digit; what's left is the ones
D761  STA $14
```

It's long division, the way you learned it in school: how many hundreds, how many tens, what's left over.
The game keeps the speed as an ordinary number and only turns it into digits at the last moment, to show you.
That's why our search for "8, 9" came up empty.

## Sixteenths of a mile an hour

Only one place in the game calls that routine.
Just before the call, it loads two boxes — {% ram baseball-stars pitch_speed %} — and the number 16.

On the four pitches, those two boxes held 1417, 1424, 1494, and 1298.
Divide by 16 and round: 89, 89, 93, 81.
Exactly the four speeds on screen.

So the game keeps a pitch's speed in *sixteenths* of a mile per hour.
Why such a funny unit?
The NES has no decimal point.
It only knows whole numbers: 0 to 255 in one box, or 0 to 65,535 in two boxes used together.
Counting in sixteenths lets a speed carry a fraction — 1417 sixteenths is 88.56 miles an hour — while every sum stays in whole numbers.
Programmers call this *fixed point*, and you'll find it under the hood of nearly every game of the era.

That answers the first question.
Now for the fun one.

## Where does the speed come from?

We started with a list of suspects: the pitcher's SPEED rating, the kind of pitch, a roll of the dice.
Spoiler: it's all three.

We set a new trap, this time on the two speed boxes themselves: tell us whenever anything writes here.
One instruction did, once per pitch.
And it wasn't working the speed out.
It was *copying* it from {% ram baseball-stars ball_velocity %} — the number the game adds to the ball's position every frame to move it toward the plate.

Read that again, because it's lovely.
The radar gun isn't a pretend number made up for the call box.
It reads the ball.
Whatever speed the game uses to fly the pitch is the speed you see.

So the real question is: who sets the ball's velocity?

## Think of the pitcher as an object

Here's a way of thinking that will help, and it's the same one our model of the pitch uses.

In a lot of modern code, you describe things as *objects*.
An object bundles up two kinds of stuff:

- **properties**, what it knows about itself, and
- **methods**, the things it can do.

A pitcher is a nice example.
Their properties are right there on their card: six ratings.

{% include screenshot.html game="baseball-stars" name="player-card-sandie" caption="Sandie, the American Dreams' ace: STAMINA 15, SPEED 15, L CURVE 12, R CURVE 8, DROP 12, PRESTIGE 14." %}

And their most important method is *throw*.

The original game was written long before anyone talked about objects on the NES, but it's organized the same way at heart.
Each player has a little record in memory.
When a pitcher takes the mound, the game reads their record and sets out what it needs for {% ram baseball-stars pitcher_base_speed %}.

Peeking at Sandie's record turned up a neat trick.
Every rating fits in *half* a box.
A box holds 0 to 255, but a rating only needs 0 to 15, so the game packs two ratings into each box, side by side.
Sandie's SPEED and STAMINA share one box, which reads `FF`: 15 and 15.
That's why no rating can ever go past 15.

## The recipe

The routine that sets the ball moving does three things.

**First, a base speed from the SPEED rating.**
The game looks it up in a small table with sixteen entries, one per rating.
It starts at 528 sixteenths for SPEED 0 and climbs about 9.6 per point, up to 672 for SPEED 15.

**Second, a wind-up.**
What happens next depends on the button the pitcher is holding as they let go — Up, Down, or nothing.
With nothing held, the wind-up is just the base speed again.

**Third, a roll of the dice.**
The game picks a random number from 0 to 15 and adds that many 256ths of the wind-up on top.
That's a little wobble of up to about 6%, so no two pitches are quite the same.

Put it together and a plain pitch is twice the base speed, plus the wobble.
That makes the SPEED rating easy to read: each point is worth about **1.2 miles an hour**.
A SPEED 0 pitcher throws a plain pitch at about 66; a SPEED 15 pitcher, like Sandie, at about 84 to 86.

## Down is the fastball

So what about Up and Down?

The manual is clear about it: "When the pitcher is in his wind-up use the Control Pad up for a fast-ball, down for a slow ball, left and right for curve-balls." ([US manual](https://archive.org/download/NESManuals/Baseball%20Stars%20%28USA%29_text.pdf))

The code checks Up and Down, sure enough.
But when we read what each one does, it looked backwards.
So we did the simplest experiment we could think of: play the same game three times, and pitch with Sandie holding Up the whole time, then Down, then nothing.

| Held | Speeds on the radar |
|---|---|
| Down | 94 to 98 M/H |
| nothing | 84 to 86 M/H |
| Up | 77 to 79 M/H |

Down is the fastball.
Up is the slow one.
The manual has them the other way around.

Same pitcher, same frame, same roll of the dice — only the button changes:

| Held | Sixteenths | M/H |
|---|---|---|
| Up | 1272 | 79.5 |
| nothing | 1383 | 86.4 |
| Down | 1567 | 97.9 |

When the manual and the game disagree, we go with the game.
That's the whole idea of the bench.

## Cosine, as a dial

The fastball's recipe is plain arithmetic: the wind-up gets an extra 22% to 28% of the base speed.

The slow pitch is sneakier.
It multiplies the base speed by a *cosine*.

If trigonometry makes you nervous, here's all you need: cosine is a smooth dial.
Turn it to 0° and you get all of something; turn it toward 90° and you get less and less, gently.
The slow pitch turns the dial to somewhere between about 28° and 39°, which keeps roughly 77% to 88% of the base speed for the wind-up.

The game doesn't calculate cosines, either.
It keeps a table of 128 sine values in its ROM, and it looks them up.
We checked every entry: each one is just sin × 256, rounded.
The same table aims the pitch, too — it splits the ball's speed into "toward the plate" and "sideways" — so the radar reads a hair under the release speed when a pitch is thrown at an angle.

## A puzzle

There's one more twist in the slow pitch.
It rolls the dice a second time, and if the roll misses, the pitch comes out a touch slower and a flag gets cleared.
That flag is the drop ball — the pitch that sinks at the plate — and [the whole pitch]({{ '/baseball-stars/04-the-whole-pitch/' | relative_url }}) follows it all the way into the dirt.

The odds of that roll come from one of the pitcher's ratings.
You'd guess DROP.
It's R CURVE.

We checked this three ways.
Sandie's DROP is 12 and R CURVE is 8, and only 8 reproduces Sandie's slow pitches.
The record keeps the two in separate halves of separate boxes, in the same order as the card.
And the routine reads the R CURVE half.

Is that a bug from 1989, or a design decision we can't see the reason for yet?
We don't know.
Our model does what the original does, and keeps the question open.

## Model it

Now the proof.
Here's the pitcher as a small JavaScript class — the code version of "an object with properties and methods."

The constructor takes the six ratings off the card and keeps them as properties:

{% snippet lab:models/baseball-stars/pitcher.js match:constructor({ after:8 %}

The base speed is a *getter*: a property that's worked out when you ask for it, instead of stored.
The game's table of sixteen speeds turned out to be a straight line, so the model can compute it:

{% snippet lab:models/baseball-stars/pitcher.js match:baseSpeed() before:1 after:2 %}

And throwing is a method.
Give it the button held and a random number, and it gives back the release speed in sixteenths, the same way the original does — down to the rounding:

{% snippet lab:models/baseball-stars/pitcher.js match:releaseSpeed({ before:5 after:20 %}

How do we know it's right?
We wrote a *test*: a little program that checks our code against things we know are true.
This one replays 24 real pitches from the bench — two pitchers, every button — and asks our `Pitcher` for each one's speed.
All 24 come out exactly, to the sixteenth.

We also made sure the test can fail.
Swap R CURVE for DROP in that slow-pitch roll, and three of Sandie's pitches come out wrong.
A test that can't fail isn't telling you anything.

<details class="bench" markdown="1">
<summary>On the bench</summary>

Where the speed is kept — runs: `pitch-speed-hunt` (RAM dumps on four calls), `pitch-speed-code` (a trap on every digit written to RAM or the PPU), `pitch-speed-caller` (each queue write with its caller, read off the stack).

| Frame | Call | Shown | `$051A–$051B` | ÷ 16 | Rounded |
|---|---|---|---|---|---|
| 2800 | STRIKE | 89 M/H | 1417 | 88.56 | 89 |
| 3220 | STRIKE | 89 M/H | 1424 | 89.00 | 89 |
| 3550 | STRIKE OUT | 93 M/H | 1494 | 93.38 | 93 |
| 3910 | BALL | 81 M/H | 1298 | 81.13 | 81 |

The one caller, at `$D4C0`: `LDA $051A / STA $04 / LDA $051B / STA $05 / LDA #$10 / JSR $D750`.
The queue entry for "89 M/H": `25 ED 20 38 39 61 62 63 FF` — screen address `$25ED`, a space, "8", "9", the three M/H tiles, end of queue.

Where it comes from — runs: `pitch-speed-source` (a trap on writes to `$051A`), `pitch-velocity` (writes to `$B0–$B3`), `pitch-speed-recipe` (breakpoints through the release routine), `pitch-base-speed` and `pitch-record` (the pitcher's record), `pitch-hold-up`, `pitch-hold-down`, `pitch-hold-none` (Sandie pitching with each button held).

- `$9820` (bank 6) copies {% ram baseball-stars ball_velocity %} into {% ram baseball-stars pitch_speed %} once, while the speed is still zero and the ball's position crosses a line.
- `$9600` (bank 6) is the release: base speed from {% ram baseball-stars pitcher_base_speed %}, the button from {% ram baseball-stars pitch_buttons %} (Down `$04`, Up `$08`), dice from {% ram baseball-stars random %}.
- `$ABE3` (bank 4) loads the pitcher: the SPEED nibble of record byte 1 indexes a table of sixteen 16-bit speeds at `$ACEA`.
- Records: Sandie `00 FF C8 0C …`, Sasuke `02 CD C8 0C …` — byte 1 is SPEED/STAMINA, byte 2 L CURVE/R CURVE, byte 3 DROP, high nibble first, matching both cards.
- `$C2B6` is cosine: add a quarter turn (`$40`), look up the half-wave table at `$C3D4`, multiply by 256ths (`$C2D2`, rounded), negate past 180°.
- A simulation of the release routine reproduced all 44 logged releases (24 distinct) exactly.

</details>

## Still to find

- What Left, Right, and the flight do — that's [the whole pitch]({{ '/baseball-stars/04-the-whole-pitch/' | relative_url }}).
- Stamina: one box per team, {% ram baseball-stars pitcher_stamina_left %}, falls with every pitch, and the code reads as if pitches start slowing down once it runs out. Do they, by how much, and how does it refill?
- How the ball's speed turns into frames to the plate. Is that {% ram baseball-stars pitch_travel_frames %}?
