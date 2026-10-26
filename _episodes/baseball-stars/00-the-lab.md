---
title: The lab
game: baseball-stars
episode: 0
status: published
subsystem: method
summary: How these teardowns are made — an emulator with no screen, experiments as short scripts, and small working models checked against the original.
---

In 1989, SNK fit eight teams, a draft, a league you could save, and a pitcher's duel into 256 kilobytes.
That's less than one photo on your phone.

This series takes Baseball Stars apart one system at a time — the pitch, the swing, the draft, the season — to see how each one works.
Not from memory, and not from guesses: from the game itself, measured.

## How a sketch works

Each sketch takes one system and works through it in five steps:

1. **Look.** Play the original and say what you see.
2. **Find.** Hunt through memory for the bytes that change when that thing happens.
3. **Name.** Give each one a name, and say how sure we are.
4. **Measure.** Repeat the moment, exactly, and record what the numbers do frame by frame.
5. **Model.** Write the system as a small program, and check that it gives the same numbers as the original.

That last step is the proof.
If a few dozen lines of code can replay a real pitch, frame for frame, and land on exactly the numbers the game did, then we've understood it.
If they can't, we haven't yet.

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

## The models

When a system is understood, it becomes a model: a small JavaScript class that does what the original does, in the original's own units.
The sketches quote them, and each comes with a test that replays recordings from the bench.
They live with the study, in [`models/`](https://github.com/afomi/game-study/tree/main/models), so anyone can run them.
