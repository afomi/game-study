---
title: Eight teams, and yours
game: baseball-stars
episode: 3
status: draft
scene: make-team
subsystem: teams, players, the draft, secrets
image: fired
summary: Presidents, monsters, ninjas, the Lovely Ladies, a team of SNK's own — and a ninth team that's yours to build, hire, fire, and, if you know the riddles, rebuild entirely.
---

Baseball Stars shipped with eight teams.
The ninth is yours.

## Who's in the league

Each of the eight teams is a joke with a roster.
The game spells out their full names on the card before every game:

| Team | Who's on it |
|---|---|
| American Dreams | Baseball's legends, by first name — Babe, Cy, Hank, Pete, Willie, Dizzy |
| Ninja Blacksox | Ninja and samurai — Sasuke, Hanzo, Goemon, Benkei |
| Brave Warriors | American presidents — Abe, George, Thomas, Grover, Calvin |
| Japan Robins | Japanese surnames — Oh, Nomura, Suzuki, Fuji |
| World Powers | History's heavyweights — Plato, Caesar, Brutus, Zeus, Wilbur and Orvile |
| Ghastly Monsters | The movie monsters — Medusa, the Mummy, Freddy, Jason, Bela, Boris, Lurch |
| Lovely Ladies | An all-women team — Lian, Amy, Grace, Juana, Rachel, Karen |
| SNK Crushers | The last-place club, named after the people who made the game |

The Crushers are the closest thing Baseball Stars has to a credits roll — more about them on the [game page]({{ '/baseball-stars/' | relative_url }}).

## A player is six numbers and a price

Every player has a card.

{% include screenshot.html game="baseball-stars" name="player-card-sandie" caption="Sandie, the American Dreams' ace: a right-handed overhand pitcher, worth $90,000." %}

"PIT RO" means pitcher, right-handed, overhand.
The six bars are a pitcher's ratings: stamina, speed, left curve, right curve, drop, and prestige.
Add them up and you get the number beside POINT — Sandie's 15 + 15 + 12 + 8 + 12 + 14 makes 76.
MAX means he can't grow any further.

The Lovely Ladies play by exactly the same numbers.

{% include screenshot.html game="baseball-stars" name="player-card-lian" caption="Lian, the Lovely Ladies' ace: left-handed, overhand, 64 points, worth $60,000." %}

## Building your own

MAKE TEAM starts with a question: what is your team good at?
Pick a strength and the game suggests a name to go with it.

| Strength | Suggested name |
|---|---|
| Consistent hitters | BLASTERS |
| Power hitters | ROCKETS |
| Good defense | BEARS |
| Fast runners | SCOUTS |
| Strong pitchers | STRIKERS |
| Veterans | TURTLES |
| Balanced team | FALCONS |
| ? | SHARKS |

The manual calls "?" the *surprise category*.
It isn't random, though: we made three teams of Sharks at three different moments, and their saved data matched byte for byte.

Keep the name or spell your own on a strip of letters that loops around — A to Z, digits, a few symbols, a space, two arrows, and END.
Then pick one of thirteen logos, pointed out by a tiny batter, and confirm.

What you get is a team of placeholders.
Its pitchers are PIT-A1 through PIT-E1, its fielders 1B-1, SS-1, CA-1, its bench BAT-A1 through BAT-E1.
They're cheap, and their ratings are mostly single digits.
They're there to be replaced.

## The draft

Saving a team changes the main menu: HIRE PLAYER, FIRE PLAYER, and REMOVE TEAM appear.

Try to hire first and the game says no — "TOO MANY PLAYERS."
A team holds 18, and yours is full.
To bring someone in, you have to let someone go.

{% include screenshot.html game="baseball-stars" name="fired" caption="Firing a player gets a scene of its own." %}

Fire PIT-A1, and the game cuts to a long road at dusk.
He walks away from you, toward the city, with his dog at his side.
"PIT-A1 WAS FIRED."
It stays on screen for as long as you let it.

Then you can hire — but you don't pick a player, you describe one.

{% include screenshot.html game="baseball-stars" name="hire-style" caption="Hiring starts with a style, not a name." %}

Rookie, veteran, or star player.
Overhand or sidearm.
Right or left.
The game answers with a prospect: a rookie right-handed pitcher for $5,000, with 9 points and room to grow to 72.

Back out and ask again, and you meet a different rookie — the same 9 points, but this one can reach 78.
The ceiling is rolled when you ask.
A patient manager can shop for potential.

## Three secrets

### A question in the manual

The manual, in its section on fielders, leaves a riddle: "There is also a way to decide if your player will be male or female. Can you find it?"

On the hiring screen, press Down past the last line.
A fourth line appears that wasn't there before — MALE — and Left or Right turns it to FEMALE.

{% include screenshot.html game="baseball-stars" name="hire-female" caption="The line you can't see until you go looking for it." %}

She arrives with her own portrait, the same rookie numbers, and a ceiling of her own.

### What is a wren?

Make a team, and on the strengths, press Down five times, Right seven times, and Down twice, then choose.
The suggested name is no longer a name.

{% include screenshot.html game="baseball-stars" name="riddle-wren" caption="The game asks you a question instead of suggesting a name." %}

The answer is "A BIRD." — on the first line, with the second line blank, full stop included.
We tried it without the full stop, and on the second line, and nothing happened.
Get it exactly right and press END, and you get what The Cutting Room Floor calls a team of women.
The first card we opened agrees.

{% include screenshot.html game="baseball-stars" name="card-wren-team" caption="The same placeholder pitcher, PIT-A1, after the right answer." %}

### When isn't it?

Press Down, Right, Left, Down, Down, Right, then choose, and the game asks WHEN ISNT IT?

{% include screenshot.html game="baseball-stars" name="riddle-when" caption="The second riddle." %}

Answer "WHEN" on the first line and "IT IS." on the second.
The names stay the same — PIT-A1, SS-1 — but look at the numbers.

{% include screenshot.html game="baseball-stars" name="card-super-team" caption="PIT-A1 again — this time worth $80,000, with 70 points." %}

On an ordinary Sharks team, that same PIT-A1 is worth $3,000 and has 12 points.

In the Japanese version, both riddles are lines of classical poetry from the *Ogura Hyakunin Isshu* — Ono no Komachi's for the women, Emperor Sutoku's for the stars ([The Cutting Room Floor](http://web.archive.org/web/20250829214608/https://tcrf.net/Baseball_Stars_(NES))).

## How a player grows

A rookie's 9 points can become 72, but not for free.
According to the manual, you earn money by beating the computer, and you spend it on a player's card: pay the price beside his face, the game rolls a number from 1 to 6, and you hand out that many points among his ratings, never past his MAX ([US manual](https://archive.org/download/NESManuals/Baseball%20Stars%20%28USA%29_text.pdf)).

The money comes at the gate.

{% include screenshot.html game="baseball-stars" name="the-gate" caption="After the game: the crowd, and each team's take." %}

The manual says a player's PRESTIGE "affects audience and income numbers" — stars draw crowds, and crowds pay.
Our first game drew 35,000 and paid both teams nothing: we lost 10–0 and the game was called after two innings, which, in the manual's terms, earns a loser exactly what we got.

<details class="bench" markdown="1">
<summary>On the bench</summary>

Runs: `view-team-0` … `view-team-7` and `team-name-2` … `team-name-7` (rosters and team names), `strength-*` (suggested names), `sram-*` (save RAM after making a team), `make-team-0*`, `hire-0*`, `records-01` (fire, hire, and the records they change), `egg-female-hire-2`, `egg-wren-unlock`, `egg-super-unlock` (the secrets), `game-06-nine-innings` (the gate).

Made teams live in battery-backed cartridge RAM.
The team's name is plain ASCII at {% ram baseball-stars made_team_name %}.
Its {% ram baseball-stars made_team_players %} are 16-byte records — a six-letter name, then ten bytes of data — and firing a player turns his name into six spaces.
While you hire and fire, the game works on a copy at {% ram baseball-stars roster_being_edited %}.

The letter strip and the typed name are {% ram baseball-stars letter_strip_cursor %} and {% ram baseball-stars name_cursor %}.
The riddles were answered by a script that reads both every frame and presses buttons until the right letter is under the cursor — pressing at a fixed rhythm drops letters.

While a game is on, a pitcher's ratings sit in the team's working copy packed two to a byte, in the same order as the card: Sandie's `FF C8 0C` is SPEED 15 and STAMINA 15, L CURVE 12 and R CURVE 8, DROP 12 ([the pitch]({{ '/baseball-stars/01-the-pitch/' | relative_url }}) found them).
How the saved 16-byte records hold them is still open.

</details>

## Still to find

- How the saved records hold the ratings (a pitcher's are packed two to a byte in the working copy), and where a fielder's live.
- What a power-up costs, and how that cost grows.
- How prestige turns into a crowd, and a crowd into dollars.
- Who the SNK Crushers were.
