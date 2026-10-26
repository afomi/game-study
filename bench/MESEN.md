# Mesen on the bench

How we use [MesenCE](https://github.com/nesdev-org/MesenCE) to take games apart, and how to drive it from scripts and agents.
**Pinned version: MesenCE 2.2.1** (released 2026-06-05, Lua 5.4.8).
Facts below come from a source review of master at `4b8a196` (2026-10-07); the test runner is the same in 2.2.1, but master-only Lua calls (`drawPixels`, `getPressedKeys`) aren't available.
Items marked **(unverified)** were read from the code but haven't been run yet.
**Confirmed on the bench (2026-10-21, 2.2.1 ARM64 in Docker):** headless runs need no display; `takeScreenshot()` returns a PNG; `io`/`os` are `nil` in the sandbox; `getRomInfo().fileSha1Hash` gives the ROM hash; a 90-second run takes ~9 s (about 10× real time).
Unlike master, 2.2.1's core links SDL2 directly, so the image needs `libsdl2` even though no audio device is opened.
Security review: [MESENCE-SECURITY.md](MESENCE-SECURITY.md).

## Why Mesen

MesenCE is the community continuation of Mesen 2.
Sour, the original author, still writes most of it, and the old `SourMesen/Mesen2` repo is archived and points here.
It's accurate, has a full debugger, and has Lua scripting with direct access to memory, input, screenshots, and savestates.
That combination is what a study needs.

## Two ways to use it

| | GUI (exploring) | Headless test runner (measuring) |
|---|---|---|
| For | Finding things: which byte moves when the pitcher winds up? | Proving things: run the same inputs, record the same frames, every time |
| Tools | Debugger, memory search, trace logger, PPU/tile/sprite viewers, event viewer | Lua API only |
| Where | Your Mac, interactively | Docker, scripted, no window |
| Output | Notes, candidate addresses, screenshots | Screenshots + RAM logs + exit code |

The loop is: **explore in the GUI → write down a guess → write an experiment → run it headless → promote the guess to *observed***.
Memory search, the trace logger, and the viewers are GUI-only, so finding a variable is still hands-on work.
That's the fun part.

## The headless runner

```sh
Mesen --testRunner --timeout=30 game.nes experiment.lua
```

- Runs at maximum speed with no window, renderer, or audio device. No Xvfb needed (confirmed).
- Takes exactly one ROM and any number of `.lua` files.
  A savestate can't be passed on the command line.
- The exit code is whatever the script passes to `emu.stop(code)`.
  The first non-zero code wins.
- A timeout or a ROM that fails to load exits `-1` (255 in the shell).
- `--help` mentions `emu.exit`; that function doesn't exist.
- Any setting can be passed as `--section.prop=value`, e.g. `--debug.scriptWindow.allowIoOsAccess=true` **(unverified)**.
- Other flags: `--novideo`, `--noaudio`, `--noinput`, `--doNotSaveSettings`, `--recordMovie=path`.

### Gotchas

- **No `settings.json`, no run.**
  If the home folder has no `settings.json`, Mesen opens the setup wizard before checking for `--testRunner`.
  Any `settings.json`, even `{}`, avoids it.
  The home folder is `~/.config/MesenCE`, or next to the binary in portable mode.
- **Script failures are silent.**
  A script that can't be read is swallowed by an empty `catch`, and Lua errors go to an internal log, not stdout.
  The run just waits out the timeout and exits `-1`.
  So a harness must never infer success from a missing error — see the experiment contract below.
- **`print()` reaches stdout; `emu.log()` doesn't.**
- **Each callback has a one-second watchdog.**
  Long work has to be spread across frames.

## Lua API cheat sheet

The authoritative reference is `UI/Debugger/Documentation/LuaDocumentation.json` in the repo.
The docs on mesen.ca describe the old 0.9.9 API.

| Need | Call |
|---|---|
| Run code every frame | `emu.addEventCallback(fn, emu.eventType.endFrame)` (also `startFrame`, `inputPolled`, `nmi`, `irq`, `reset`, `stateLoaded`) |
| Run code when memory is touched | `emu.addMemoryCallback(fn, emu.callbackType.write, start, end)` (also `read`, `exec`) |
| Read RAM | `emu.read(addr, emu.memType.nesDebug)` — side-effect free; also `read16`, `read32` |
| Write RAM | `emu.write(addr, value, emu.memType.nesDebug)` |
| Press buttons | `emu.setInput({ a = true, right = true }, 0)` — port 0 is player 1; lasts until the next input poll |
| Screenshot | `emu.takeScreenshot()` → PNG bytes as a Lua string (works headless) |
| Raw pixels | `emu.getScreenBuffer()` → ARGB values |
| Savestates | `emu.createSavestate()` → string, `emu.loadSavestate(s)` — only inside an `exec` memory callback |
| Frame count | `emu.getState().frameCount` |
| Stop with a result | `emu.stop(code)` |
| ROM info | `emu.getRomInfo()` |
| Labels | `emu.getLabelAddress(name)` |
| Coverage | `emu.getCdlData()`, `emu.getAccessCounters()` |

Other NES memory types: `nesMemory`, `nesInternalRam`, `nesPrgRom`, `nesWorkRam`, `nesSaveRam`, `nesPpuDebug`, `nesNametableRam`, `nesSpriteRam`, `nesPaletteRam`, `nesChrRom`, `nesChrRam`.

## Proposed experiment contract

An experiment is one `.lua` file and one headless run.
This is a proposal for the L2 spike, open to change.

**Getting to the moment we want to measure.**
Savestates can't be passed on the command line, and a script can only read a savestate file with I/O access turned on.
Instead, each experiment **replays inputs from power-on**: a list of `{ frame, buttons }` steps that walks through the title screen and menus to the pitch we want to study.
Emulation is deterministic, so the same ROM and the same inputs give the same frames.
The input script *is* the reproducible setup, and it's readable in a blog post.

**Getting data out — stdout only, I/O off.**
The script prints tagged lines, and the harness parses them:

```
READY <rom sha1>              first line, proves the script loaded
RAM <frame> <addr>=<hex> ...  watched values
PNG <frame> <base64>          screenshot (PNG encoded in Lua)
DONE <n frames>               last line
```

The harness writes the PNGs and a RAM CSV into `out/`, then checks it all explicitly:

- exit code 0,
- `READY` came first and its ROM hash matches `rom_sha1` on the game page,
- `DONE` was printed,
- every expected file exists in `out/`.

Anything less is a failure, even when the exit code was 0.
Keeping I/O off means the scripts can't run shell commands or write files at all, and the container doesn't need a writable script-data folder.

**Labels.**
Mesen auto-loads a label file (`.mlb`, among others) that sits next to the ROM with the same name, even in headless mode.
Generating that file from `_data/ram/<game>.yml` would make our variable names appear in Mesen's debugger and work with `emu.getLabelAddress`.
Then the RAM map is the single source for the blog, the debugger, and the experiments.

## Container posture

From the security review:

```sh
docker run --rm \
  --network none \
  --read-only --tmpfs /home/mesen \
  --cap-drop ALL --security-opt no-new-privileges \
  --user 1000:1000 \
  -v "$ROMS:/roms:ro" -v "$PWD/bench/experiments:/experiments:ro" \
  -v "$PWD/bench/out:/out" \
  mesence-bench:2.2.1 /experiments/pitch.lua
```

- Use the official 2.2.1 Linux release zip, verified against GitHub's SHA-256 digest before unpacking.
  For Linux x64 that's `c88ff4d251b407515c43d3332d641927655cd69fb538996b6a21da4509dbb58f`; the same digests appear in Mesen's own update manifest.
  Never use `nightly.link` dev builds.
- If we ever need to build from source instead: .NET 10 SDK and clang, the floating `Dotnet.Bundle` NuGet version pinned, and no librashader.
- SDL2 is only loaded for audio, which we don't use.
- Mesen extracts its native core into the home folder on every start and loads it from there.
  A tmpfs home that disappears with the container keeps that clean.

## Driving it from an agent

Mesen has no socket, stdin, or RPC control channel.
The options:

1. **One run per experiment (start here).**
   An agent, or you, writes an experiment, runs it, reads the frames and RAM log, and writes the next one.
   Slower per question, but every step is a reproducible file.
2. **Live control over LuaSocket.**
   A Lua script opens a socket and takes commands (step, press, peek, screenshot) from outside.
   This needs both the I/O and network settings on, which reopens what the posture above closes.
   Worth it only if the run-per-experiment loop proves too slow, and then only on a private Docker network.
3. **File polling.**
   A script polls a mounted file for commands.
   Needs I/O on; clunky.

Option 1 also suits an AI agent well: each experiment is a hypothesis, each run is evidence, and the trail is the study's lab notebook.

## Using the bench

```sh
docker build -t mesence-bench:2.2.1 bench/docker        # once
node bench/run.mjs bench/experiments/<game>/<name>.lua  # one experiment → workbench/<game>/runs/<name>/
node bench/extract-chr.mjs <game>                       # tile banks → workbench/<game>/chr/
npm run workbench                                       # local-only site with every image
```

ROM paths live in `bench/roms.local.json` (gitignored).
Experiments are plain data for `lab.run{}` (see `bench/lib/prelude.lua`): inputs, shots, RAM traces, `dumps` (2 KB of CPU RAM), and `sram` (8 KB of battery-backed cartridge RAM).
For anything a fixed rhythm of button presses can't do reliably — menus drop presses that come too fast — use closed-loop input: `controller = function(frame) … end` reads RAM each frame and returns buttons.
`bench/lib/typist.lua` (pull it in with a line `-- @include lib/typist.lua`) types names on Baseball Stars' letter strip that way and runs simple scripts of presses and waits.
Other tools: `bench/disasm.mjs` (6502, NES register names), `bench/extract-chr.mjs` (tiles), `bench/promote.mjs` (publish one frame, with provenance).
Sourced background research lives in `bench/research/`.
Mesen's debugger messages (e.g. "Uninitialized memory read: $040A") land in each run's `notes.txt` — leads worth following.

## Still open

- Does `--debug.scriptWindow.allowIoOsAccess=false` parse as expected (keeping it off explicitly)?
- `emu.setInput` drives menus correctly; is input applied on the exact frame we expect? Matters for timing measurements.
