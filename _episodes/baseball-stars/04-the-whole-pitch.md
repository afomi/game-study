---
title: The whole pitch
game: baseball-stars
episode: 4
status: draft
subsystem: pitching controls
scene: pitching
summary: A pitch in Baseball Stars isn't a button press — it's two seconds of wind-up and half a second of flight, and the pitcher's d-pad matters for nearly every frame of it. We map each moment, find who's really holding the controller, and rebuild the flight frame by frame.
---

If you played Baseball Stars as a kid, you probably remember leaning on the d-pad the whole way to the plate.
Your thumb wasn't imagining it.

In [the pitch]({{ '/baseball-stars/01-the-pitch/' | relative_url }}) we found out how fast a pitch leaves the pitcher's hand.
This sketch is about everything else your thumb does: before the throw, during the wind-up, and while the ball is in the air.

## One pitch, four moments

The best way to learn how a game listens is to change one thing at a time.
So we built a little rig on the bench: the same game, the same inning, the same pitcher — Sandie — throwing one pitch.
Every run is identical except for which button is held, and when.
Then we watched the ball, frame by frame.

Here's what the pitcher's d-pad does, moment by moment:

| Moment | How long | What the d-pad does |
|---|---|---|
| Before the throw | as long as you like | Left and Right walk the pitcher across the mound |
| The wind-up | 2 seconds (120 frames) | Nothing yet — the game only cares what you're holding at the very end |
| The release | 1 frame | Up, Down, or nothing picks the speed; Left, Right, or nothing picks one of three lanes |
| The flight | about half a second (27 frames) | For 24 of those frames, Left and Right bend the ball |

So the controls aren't a menu you pick from once.
They're a conversation that lasts the whole pitch.

## Before the throw: where to stand

The manual tells you to "select your pitcher's position on the mound by moving him left and right with the Control Pad."
On the bench, holding Left before pressing A moved the whole pitch about eight units to one side; holding Right moved it about seven to the other.
The pitch itself is the same — same speed, same angle — it just starts from somewhere else.

## The release: speed and lane

At the instant the ball leaves the hand, the game reads the d-pad once.
Up and Down set the speed, as we saw in Sketch 01: Down is the fastball, Up is the slow one.
Left and Right choose the lane:

| Held at release | Sideways speed | Toward the plate |
|---|---|---|
| Left | 0 | 1383 |
| nothing | 135 | 1378 |
| Right | 238 | 1361 |

Notice the last column.
The game doesn't *add* sideways speed; it *turns* the pitch, using the sine table from Sketch 01, so a pitch thrown at an angle gives up a little speed toward the plate.

## The flight: every frame counts

Now the part your thumb remembers.

While the ball is in the air, the game asks the pitcher's controller the same question every single frame: are you holding Left or Right?
If you are, it bends the ball a little — and the amount comes from the pitcher's card.
Sandie's Right bends by 11 a frame (from L CURVE 12), and Sandie's Left by 7 a frame (from R CURVE 8).
Better curve ratings, bigger bends.

Here's the catch, and it's a lovely bit of design.
Bending isn't free.
Every bit of sideways speed the ball gains is taken out of its speed toward the plate.

| Held in flight | Speed toward the plate at the end |
|---|---|
| nothing | 1378 (86 M/H) |
| Left, the whole way | 1210 (76 M/H) |
| Right, the whole way | 1114 (70 M/H) |

So a big curve is a slow curve.
And the game has two rules that keep it honest: the ball can never be going more sideways than forward, and it can never stop.
When a bend would break either rule, that frame's bend simply doesn't happen.

(Yes, Right uses L CURVE and Left uses R CURVE.
Probably because the pitcher is facing you, so their left is your right.)

## The drop

In Sketch 01 we found that the slow pitch rolls a second set of dice and sets a flag.
Now we know what the flag does.
It's the drop ball.

Every pitch in Baseball Stars flies at exactly the same height, start to finish.
There's no gravity at all.
Except for a drop ball: a few frames before the plate, the game gives it a sudden push downward — 682 units of height a frame — and it brakes hard, keeping only 220/256 of its forward speed each frame.
Seven frames later it hits the dirt.

{% include screenshot.html game="baseball-stars" name="pitch-arrives" caption="A plain pitch reaches the plate: the ball (white) rides high above its shadow." %}

{% include screenshot.html game="baseball-stars" name="drop-ball-lands" caption="A drop ball, a few frames late: it has sunk onto its shadow at the batter's feet, and the swing is going over the top of it." %}

Fans say that a good drop-ball pitcher can hold Down in flight to keep the pitch from dropping.
We tested it: the same drop ball, once with nothing held and once with Down held all the way.
The two flights were identical, frame for frame.
The code agrees — once the ball is released, nothing ever looks at Down again.
In this version of the game, at least, the drop is decided at the release.

## One frame, six steps

How does the game keep all of this straight?
With a routine that runs once a frame for as long as the ball is in the air.
It's nothing but a list of calls:

```
97B2  JSR $9820   ; radar: the first frame, write down the speed
97B5  JSR $9837   ; fall: if it's dropping, lose height and brake
97B8  JSR $98F0   ; did it cross the strike zone?
97BB  JSR $991B   ; steer: Left or Right held? bend it
97BE  JSR $98D5   ; drop: nearly at the plate? start falling
97C1  ...         ; move: position += velocity
```

If you've written a game loop before, this will look familiar.
It's an `update` function: one small job after another, in a fixed order, sixty times a second.
The order matters, too.
The drop starts *after* the fall step has already run, so a drop ball starts losing height on the frame after it's triggered — and our rebuild has to do the same, or it drifts by a frame.

## Who's holding the controller?

Here's the part we like best.

When *you* pitch, the d-pad is yours.
When the computer pitches, there's no thumb at all.
So how does the same code bend the computer's pitches?

The answer is a single box in memory: {% ram baseball-stars pitch_buttons %}.
Every bit of pitching code reads its buttons from that box, and never from the controller itself.
Every frame, something fills the box:

- When you're pitching, the game copies your controller into it.
- When the computer is pitching, it writes the buttons it *wants* to press: {% ram baseball-stars cpu_pitch_plan %}.

There's a matching box for the batter, {% ram baseball-stars batter_buttons %}, filled the same two ways.

That solves a mystery from Sketch 01, too.
We'd found a byte that "rose with the pitch speed" — 1, 4, 6 for 81, 89, 93 M/H — and filed it as a guess.
It's the computer's plan.
1 is Right, 4 is Down, 6 is Down and Left.
It only *looked* like it rose with the speed because Down is the fastball.

In object-oriented terms, this is one of the most useful ideas there is.
The pitching code doesn't care *who* is holding the controller.
It only cares that *something* can answer the question "what's held right now?"
A person can answer it.
So can a computer player.
So can a test, or a recording, or someone on the other side of a network.
Programmers call that an *interface*: agree on the question, and anything that can answer it can plug in.

## Rebuild it

Our remake's `Pitch` is an object that remembers where the ball is and how fast it's going.
Its `step` method is the original's routine, almost line for line — every step but the strike-zone check, which we haven't followed yet:

{% snippet baseball-stars:src/model/pitch.js match:step(held before:1 after:6 %}

And notice what `step` asks for: just `held`, a plain description of what's held right now.
It doesn't know about keyboards or controllers or computer players.
That's the interface, and it's what will let the remake's computer pitcher drive exactly the same code later.

Steering is one small method, with the original's two rules right there in it:

{% snippet baseball-stars:src/model/pitch.js match:steer({ after:15 %}

To check it, we exported every frame of twelve pitches from the bench — plain, placed left and right, aimed three ways, steered both ways, slow, dropped, and dropped-with-Down — and wrote a test that flies each one through the remake's `Pitch`.
All twelve match the original exactly: position, speed, and height, every frame, until the ball stops.
And the test can fail: brake the drop at 230/256 instead of 220, or swap the two curve ratings, and it catches it.

<details class="bench" markdown="1">
<summary>On the bench</summary>

The rig: `bench/lib/pitch-rig.lua`, used by `pitch-rig-none`, `-set-left`, `-set-right`, `-aim-left`, `-aim-right`, `-steer-left`, `-steer-right`, `-up`, `-up-then-down`, `-down-flight`, `-drop`, `-drop-down`.
AD vs NB, the bottom of the first; Sandie presses A on frame 6700 and releases on 6820.
`-drop` throws on 6702 instead: on that frame the dice keep the drop flag (throws on 6701–6710 kept it on 6702, 6703, 6706, 6707, and 6710).
We first tried forcing the dice by writing to memory; the game froze the ball, so we threw those runs away and found natural ones.

Who reads the pad in flight: `pitch-input-readers` traps every read of the pad bytes during a pitch.
After release, only `$9938` reads {% ram baseball-stars pitch_buttons %}, every frame from 6824 to 6847, and it masks the byte with `AND #$03` — Left and Right only.
Who writes it: `pitch-input-sources`. Human: `$C51C` (`LDA $8F,X / STA $93,Y / LDA $91,X / STA $95,Y`). Computer pitcher: `$B0DC` (`LDA $0521 / STA $94`). Computer batter: `$BCD2`.

The flight state: {% ram baseball-stars ball_x %}, {% ram baseball-stars ball_depth %}, {% ram baseball-stars ball_velocity_sideways %}, {% ram baseball-stars ball_velocity %}, {% ram baseball-stars ball_height %}, {% ram baseball-stars ball_fall_speed %}, {% ram baseball-stars drop_ball %}, {% ram baseball-stars steer_frames %}, {% ram baseball-stars pitch_flags %}.
Steering (`$991B`) runs while the high byte of the depth is `$50`–`$DF` and the high byte of `x` is `$40`–`$BF`; the bend comes from a 16-entry table at `$99BD` (1, 1, 2, 2, 3, 4 … 14).
The drop (`$98D5`) starts at depth `$A8xx`; the fall (`$9837`) multiplies forward speed by `$DC`/256 and lands at height 0.

</details>

## What the remake learns

The remake's pitching phase has been a menu: pick FAST, CURVE, SLIDE, or CHANGE, then press A.
The original has no menu at all, and the difference matters more than any number.
So the plan for the remake's pitching phase is now:

- Before the throw, Left and Right move the pitcher; A starts a two-second wind-up.
- At release, read Up/Down for speed and Left/Right for the lane.
- Every frame of flight, hand `Pitch#step` whatever is held — from the keyboard today, and from a computer pitcher later, through the same door.

## Still to find

- The lanes: how the release turns Left, Right, or nothing into an angle (`$C18F`, and a table that seems to depend on the pitcher's throwing style).
- How far the pitcher can walk on the mound.
- What the strike-zone flag in {% ram baseball-stars pitch_flags %} feeds, and how a call is made.
- Whether the pad is read before or after a frame's step — every run so far held its buttons steady, so the test can't tell yet.
- The batter's side of the conversation: when does a swing get decided?
