---
title: The lab
game: baseball-stars
episode: 0
status: published
subsystem: method
summary: In 1989 SNK fit a whole baseball league into a cartridge the size of a paperback. Here's how we'll learn how — by building it again.
---

In 1989, SNK fit eight teams, a draft, a league you could save, and a pitcher's duel into 256 kilobytes.
That's less than one photo on your phone.

This series takes Baseball Stars apart one system at a time — the pitch, the swing, the draft, the season — and builds each one back up, in code you can read and a game you can play.

## A remake made of guesses

There's already a remake, and you can play it at the bottom of this page.
It's a two-minute sketch of *a* baseball game.
It isn't Baseball Stars.

Every number that shapes how it plays was made up.
Here's how fast a fielder runs:

{% snippet baseball-stars:src/phases/fielding.js match:FIELDER_SPEED context:1 %}

Sixty pixels a second sounded about right.
The original has a real answer, sitting somewhere in its memory, and the only way to get it is to go and look.

Or the pitches:

{% snippet baseball-stars:src/phases/pitching.js match:PITCH_LIST %}

Four pitch types with tidy modern names.
Does the real game have anything like a pitch menu?
That's the first thing [the pitch]({{ '/baseball-stars/01-the-pitch/' | relative_url }}) sets out to learn.

## How a sketch works

Each sketch takes one system and builds it back up in five steps:

1. **Look.** Play the original and say what you see.
2. **Find.** Hunt through memory for the bytes that change when that thing happens.
3. **Name.** Give each one a name, and say how sure we are.
4. **Measure.** Repeat the moment, exactly, and record what the numbers do frame by frame.
5. **Rebuild.** Put the real number into the remake, with a test that proves it.

## Reading the numbers

The NES has 2 kilobytes of working memory.
Every byte has an address, from `$0000` to `$07FF`; the `$` means the number is written in hexadecimal, the way programmers wrote addresses at the time.

You won't need to read hex.
Each address we find gets a plain name — like {% ram baseball-stars scene %}, the byte that decides which screen you're on — and the address rides along in a small tag for anyone who wants it.

The color says how sure we are.
Amber is a guess.
Blue was seen on the bench.
Green is confirmed: the code and the measurements agree.
Click a name to see it in the [RAM map]({{ '/baseball-stars/#ram' | relative_url }}).

When the raw measurements matter, they're folded into an "On the bench" box.
Open it if you're curious; skip it if you're not.

## The bench

The original game runs in [Mesen](https://github.com/nesdev-org/MesenCE), an NES emulator built for this kind of work — a debugger, memory tools, and a scripting language.
We run it with no screen at all, sealed in a container, and drive it with scripts.

An experiment is a short file: switch on, press these buttons on these exact frames, take pictures here, write down memory there.
The NES does the same thing every time it's given the same inputs, so anyone with the same cartridge gets the same frames, down to the pixel.
Ninety seconds of game runs in about nine.

## Play the remake

Here's where the remake starts, guesses and all.
By the end of the series, every number in it will have come from the original.

{% include play.html game="baseball-stars" %}
