---
title: The frame loop
game: baseball-stars
episode: 2
status: draft
scene: power-on
subsystem: boot, NMI, scene dispatch
image: title
summary: What a cartridge does in its first two frames, how one interrupt keeps the whole game on time, and how a single byte decides which screen you're looking at.
---

Sixty times a second, every NES game does the same small dance.
The TV finishes drawing a picture, the console taps the game on the shoulder, and the game has a sliver of time to get the next picture ready.
Everything else — the pitch, the menus, the music — happens in between.

This sketch follows Baseball Stars from the moment you switch it on to the rhythm it keeps for the rest of the game.

## Three addresses at the end of the cartridge

The NES's processor, a 6502, doesn't start at the beginning of the program.
It starts by reading three addresses from the very top of memory, `$FFFA` to `$FFFF`, and jumping where they point.

| Vector | Address | Used for |
|---|---|---|
| NMI | `$CFB3` | The tap on the shoulder: every time the TV finishes a picture |
| RESET | `$CC69` | Switching on, and the reset button |
| IRQ | `$D026` | Nothing at all — a single `RTI`, "return" |

The cartridge holds eight 16 KB banks of program, but the console can only see two at a time.
Only the last bank carries these addresses: the game trusts its MMC1 mapper chip to wake up with that bank in place.

## The first two frames

The reset code is short, and nearly every NES game has some version of it:

```
CC69  LDA #$00
CC6B  STA $2000      ; PPUCTRL: no NMI yet
CC6E  SEI            ; ignore IRQs
CC6F  LDX #$FF
CC71  TXS            ; stack at the top of page 1
CC72  STX $9FFF      ; bit 7 set: reset the MMC1 mapper
CC75  LDA #$1E
CC77  JSR $C002      ; configure MMC1, one bit at a time
CC7A  LDA #$00
CC7C  STA $2001      ; PPUMASK: screen off
CC7F  LDX #$02
CC81  LDA $2002      ; wait for vblank...
CC84  BPL $CC81
CC86  DEX            ; ...twice, while the PPU warms up
CC87  BNE $CC81
```

MMC1 is talked to one bit at a time.
To set it up, the routine at `$C002` writes the value five times, shifting it right between writes.
It wraps the five writes in a busy counter ({% ram baseball-stars mapper_busy %}) so nothing can interrupt it halfway through.

Then the game clears its first page of memory, fills page `$0300` with `$FF`, and picks its first screen.
`$FF` marks the end of the {% ram baseball-stars screen_queue %} — filling it means "nothing to draw yet."

One thing it doesn't do is clear the rest of memory, `$0400` to `$07FF`.
The emulator's debugger notices: in the first frames, it reports the game reading memory it never wrote.

## Two threads, one clock

An NES game has two threads of control.
One is the main loop, which plays the game.
The other is the NMI, the tap on the shoulder, which runs at the start of every vertical blank — the brief pause when the TV's beam travels back to the top, and the only safe moment to change what's on screen.

Baseball Stars keeps the two in step with one flag, {% ram baseball-stars frame_ready %}:

```
CC98  LDA $0486      ; spin until the NMI clears it
CC9B  BNE $CC98
CC9D  INC $0486      ; claim this frame
CCA0  JSR $CCBF      ; run one frame of the current scene
...
CCBC  JMP $CC98
```

The main loop does one frame of work, then waits.
The NMI saves what it was doing, sends the sprites to the screen, sets the scroll, plays the sound, reads the controllers, and clears the flag.
Then the main loop is off again.

What if a frame's work runs long and the next NMI arrives while the last one is still busy?
The NMI checks {% ram baseball-stars nmi_busy %}, skips its work, and raises {% ram baseball-stars nmi_overrun %}.
The main loop sees that flag and reads the controllers itself — so a button press is never lost, even on a frame that ran late.

On the bench, across 90 seconds of the attract demo, that happened on 29 of 5,400 frames.
Every one of them was a frame spent setting up a new screen.
The title, the at-bat, and the field never ran late once.

### Eight buttons, one wire

The controller reader at `$D132` is a little gem.
The NES controller hands over its eight buttons one at a time, down a single wire.
The game catches them with a loop that starts with a single 1 bit and stops the moment that 1 falls out of the other end:

```
D158  LDA #$01
D15A  STA $8F,X      ; a marker bit
D15C  LDA $4016,X    ; next button
D15F  LSR A
D160  ROL $8F,X      ; shift it in...
...
D168  BCC $D15C      ; ...until the marker falls out: 8 buttons read
```

From that it keeps the buttons held ({% ram baseball-stars pad_held %}), the ones newly pressed ({% ram baseball-stars pad_pressed %}), and both players' presses together ({% ram baseball-stars pads_pressed_any %}) — which is why either controller can work the menus.

## One byte decides the screen

Each frame, the main loop asks a single byte, {% ram baseball-stars scene %}, what to do.
It switches in the bank of program that scene lives in, then calls `$C178`, which treats the bytes right after the call as a list of addresses:

```
CCD0  LDA $0484
CCD3  LSR A
CCD4  TAX
CCD5  LDA $CD5F,X    ; which bank holds this pair of scenes
CCD8  JSR $C056      ; switch it in (five more one-bit writes)
CCDB  LDA $0484
CCDE  JSR $C178      ; the next 84 bytes are 42 addresses, one per scene
CCE1  .word $A7FC, $A87B, $D219, $D3F8, $D7B6, $D858, ...
```

`$C178` doubles the scene number, pulls its own return address off the stack to find the list, and jumps through it.
It's a `switch` statement, in fifteen instructions.

Watching that byte frame by frame lays the whole game out:

| Scene | What's on screen |
|---|---|
| 12 → 13 | SNK logo and title card |
| 0 → 1 | Title screen |
| 6 → 7 | Main menu, VS, select team — one scene with its own pages |
| 8 → 17 → 9 → 10 → 11 | The demo sets up, then "PLAY BALL" |
| 8 → 17 → 18 → 19 | A real game sets up: the lineups |
| 2 → 3 | The at-bat |
| 4 → 5 | Ball in play — the home run board included |
| 14 → 16 → 15 | Time out, and the relief pitcher |
| 27 → 24 → 25 | After the game: the crowd and the gate |
| 20 → 21 | Make a team |
| 22 → 23 | View a team |
| 28 → 29 | Make a league, the league menu, the standings |
| 32 → 33 | Fire a player |
| 34 → 35 | Hire a player |

That's 33 of the 42.
The scoreboard pair (10 → 11) works twice: "PLAY BALL" before the game, the line score between innings.

Notice the pairs.
An even scene sets a screen up — loading its tiles while the screen is dark — and lasts a few frames.
The odd scene after it runs that screen until something changes.
If you've written a game with an `enter` and an `update` for each screen, this is the same shape, thirty-five years earlier.

## Sharing one window

The console sees one swappable 16 KB window of program at `$8000`, and the music and the game both want it.
The game keeps the bank it wants in {% ram baseball-stars prg_bank_shadow %}.
The music lives in bank 0.
On the bench, every write to the sound chip came from one instruction in bank 0 — `STA $4000,X` at `$8768` — even while the shadow said bank 4 or 6.

So the music borrows the window, and the code shows how politely.
The bank-switching routine has three ways in, one instruction apart:

```
C054  LDA $25        ; restore: put back the bank the game wants
C056  STA $25        ; set: remember this bank as the one the game wants
C058  INC $2B        ; borrow: switch banks without remembering
      ...            ; (then five one-bit writes to the mapper)
```

One routine comes in through the third door — very likely the one that feeds the music, though we haven't proved it yet:

```
D1DE  INC $2B
D1E0  LDA #$00
D1E2  JSR $C058      ; borrow bank 0, leaving the shadow alone
...                  ; work through a queue at $0470, with a table from bank 0
D213  JSR $C054      ; give the window back, from the shadow
```

Three entry points into one routine, for three intentions: *restore*, *set*, *borrow*.
And the {% ram baseball-stars mapper_busy %} flag it raises is checked by the NMI before it touches the mapper itself — so the two threads never talk over each other in the middle of a five-bit sentence.

The same trap showed where the music is.
The title screen made 6,790 writes to the sound chip in under two minutes, and the PLAY BALL fanfare 1,822.
The at-bat made 19.
In the demo, at least, the pitch is played in near silence.

## Still to find

- The nine scenes we haven't named: 26, 30, 31, and 36 to 41. Scenes 30, 32, and 34 all start with the same setup routine — so firing, hiring, and scene 30 are three faces of one screen.
- Whether {% ram baseball-stars menu_page %} really is the menu's page number.
- Where the sound queue at `$0470` is filled from, and which of the two threads drives the music each frame.
