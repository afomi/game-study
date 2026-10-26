---
title: Baseball Stars
study: 1
publisher: SNK
platform: NES
year: 1989
# Bring your own ROM. Experiments are only reproducible against the same
# dump, so the bench records its hash here once it is set up.
rom_sha1: ff1e9f9e214a678704c4725a77dcc03c71cbe4f0
---
{% include screenshot.html game="baseball-stars" name="title" caption="The title screen: \"Be a champ!\"" %}

## Why this game

<!-- DRAFT for Ryan to rewrite in his own words: why Baseball Stars, why first. -->
I remember leaning on the d-pad the whole way to the plate, trying to bend a pitch.
It turns out the game really was listening, every frame.

That's what makes it a good first study.
At its heart is a real-time duel — pitcher against batter, sixty times a second — and wrapped around it is a slow game of building a team.
Taking both apart shows a lot of how games were made in 1989: what fit in the memory, what the code had to do every frame, and what the designers chose to hide.

## 1989

Baseball came to the NES early, and for years it stayed simple.
Nintendo's own *Baseball* was a launch title in North America in 1985: six teams, and "the only gameplay difference between teams is the uniform colors" ([Wikipedia](https://en.wikipedia.org/wiki/Baseball_(1983_video_game))).
In 1988, *R.B.I. Baseball* became the first console game of its kind licensed by the players' union, so it could use real players' names ([Wikipedia](https://en.wikipedia.org/wiki/R.B.I._Baseball)), and *Bases Loaded* showed the pitcher–batter matchup like a TV broadcast ([Wikipedia](https://en.wikipedia.org/wiki/Bases_Loaded_(video_game))).

SNK was an arcade company.
Founded by Eikichi Kawasaki, its biggest hit was *Ikari Warriors* (1986), and it had been making games for Nintendo's console since 1985 ([Wikipedia](https://en.wikipedia.org/wiki/SNK)).
A year after Baseball Stars, SNK launched its own hardware, the Neo Geo, with a sequel — *Baseball Stars Professional* — among its first games ([Wikipedia](https://en.wikipedia.org/wiki/Baseball_Stars_Professional)).

Baseball Stars came out in Japan on May 19, 1989, and in North America that July.
It was the first baseball game on any console that could save your league to a battery in the cartridge, and the first NES sports game that let you create your own players ([Wikipedia](https://en.wikipedia.org/wiki/Baseball_Stars)).
A *Nintendo Power* reader poll named it the most popular baseball game, and eight years after its release *Electronic Gaming Monthly* still called it "the best baseball game the NES ever saw" (both via [Wikipedia](https://en.wikipedia.org/wiki/Baseball_Stars)).
In 2011, the producer of EA's hockey games said "Our GM mode is based on Baseball Stars" ([Kotaku](http://web.archive.org/web/20110925025432/http://www.kotaku.com.au/2011/09/old-school-nes-baseball-game-inspired-ea-sports-world-class-hockey-title/)).

### Who made it

SNK made Baseball Stars, and SNK Corporation of America brought it to the US.
We haven't found the name of a single person who worked on it — not in the manual, not on MobyGames ("There are no game credits on file"), not in any interview, and not anywhere in the cartridge's text.

The closest thing to a credits roll is a team.
The SNK Crushers are the league's last-place club, and two reviewers say their players are named after the game's developers ([NESJunk](https://nesjunk.com/2020/06/03/baseball-stars-1989-review-snk-hits-one-out-of-the-park/), [SABR Baseball Gaming](https://sabrbaseballgaming.com/2023/02/12/still-shining-baseball-stars-for-the-nes/)): Shacho, Nobe, Ikawa, Hama, Kohno, Vince, Manny, Jab, Paul, Neal, KJB, Jun, Tommy, Ed, Taro, Glen, Geoff, and Tyrone.
*Shachō* is Japanese for "company president."
If you know who any of them were, we'd love to put their names here.

## How it plays

The manual sums it up in one line: "Player, manager, owner... You can do it all in Baseball Stars!"

**On the field**, it's a duel.
You pitch, steering the ball as it flies; you bat, timing a swing; you field, diving and leaping for the ball; you run the bases, leading off and stealing.
Play a friend, or the computer.

**Winning** a game is ordinary baseball, with one mercy: "If, at the end of an inning, one team has a leading margin of ten points, the game will be called" (US manual).
**Winning money** is the part that matters.
Beat the computer and your team earns money at the gate, and your players' PRESTIGE "affects audience and income numbers."
Lose, and you go home with nothing.

{% include screenshot.html game="baseball-stars" name="the-gate" caption="After the game: the crowd, and what each team takes home." %}

**Building** is the game wrapped around the games.
Make a team from scratch: pick what it's good at, name it, choose a logo.
It starts as a roster of placeholders.
Fire them, hire better ones, and spend your winnings to power players up, a few random points at a time, toward each player's ceiling.
Then set up a league — up to six teams, up to 25 games — and the cartridge keeps the standings, the statistics, and your money on its battery.

## Key mechanics

| Mechanic | What it is | Teardown |
|---|---|---|
| The pitch | Speed from the pitcher's rating and the button held at release; steering every frame of the flight; the drop ball | [The pitch]({{ '/baseball-stars/01-the-pitch/' | relative_url }}), [The whole pitch]({{ '/baseball-stars/04-the-whole-pitch/' | relative_url }}) |
| The swing | Step around the box, time the swing, bunt; push forward or back to swing up or down | still to come |
| Fielding | Fielders drift toward the ball on their own; dives, jumps, climbing the wall | still to come |
| Baserunning | Leading off, stealing, pickoffs | still to come |
| Building a team | Making a team, the draft (hire and fire), power-ups, and three hidden secrets | [Eight teams, and yours]({{ '/baseball-stars/03-eight-teams-and-yours/' | relative_url }}) |
| Money and prestige | Who earns what, and how a crowd becomes dollars | partly, in Sketch 03 |
| Stamina | Pitchers tire; in a league, an overused pitcher needs a game's rest | still to come |
| The league | Schedules, standings, and statistics saved to the cartridge's battery | still to come |
| Under the hood | How the console runs it all, sixty times a second | [The frame loop]({{ '/baseball-stars/02-the-frame-loop/' | relative_url }}) |
