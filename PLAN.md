# Game Study — Plan

*Rebuilding classic games, frame by frame.* A Civic Studio series at games.civic.studio (repo `civicstudio/game-study`).
Each study takes one classic game apart one system at a time and rebuilds it as a playable web remake; installments are sketches.
Goals: fun to make, teach how games are made, honor the people who made them, keep the games alive.
First game: SNK's Baseball Stars (remake in `../baseball-stars`).

Tasks are tracked inline here.

## Current docs

- `README.md` — content model, authoring tags, fail-loud contract, rules.
- `bench/MESEN.md` — how to drive MesenCE (pinned 2.2.1), the experiment contract.
- `bench/MESENCE-SECURITY.md` — security review; container posture.
- `_data/storyboard/<game>.yml` — the game's scenes; the book's spine.
- `workbench/` — local-only, ROM-derived images (`npm run workbench`).
- `~/workspace/tldrawings/game-study.tldr` — storyboard drawing, generated from the storyboard YAML (`npm run storyboard`).

## Now

**Sketches 01–04, then publish.**
Sketch 01 (pitch speed: where it's kept, where it comes from) and Sketch 04 (the whole pitch: placement, release, steering every frame, the drop, and the controller slot the CPU shares) are drafted in the new voice and backed by remake tests (`npm test` in ../baseball-stars: 43 passing, 12 flights frame by frame).
Voice for sketches (user, 2026-10-25): conversational, beginner-friendly, objects/properties/methods as the lens; user interactions and the code approaches behind them are a priority (2026-10-26).
Next: retone 00/02/03; then the remake's pitching phase (no menu; mound, wind-up, release, per-frame steering through one controls slot).

## Tasks

- [x] L1. Lab scaffold — games/episodes collections, RAM map with build-time validation, live code snippets from remake repos, embedded playable remake.
  Test: `npm run check`.
- [x] L1b. Storyboard — scenes in play order drive the book's contents, each sketch's chapter placement, and the `.tldr`; validated at build.
  Test: `npm run check` (episode in unknown scene, missing remake file).
- [x] L2. Mesen bench — Docker image (2.2.1, checksum-pinned), Lua prelude (`lab.run{}`), harness `bench/run.mjs` with explicit checks, ROM SHA-1 recorded; CHR extractor; local-only workbench page.
  Test: harness checks on every run; `npm run check` asserts no workbench leak.
  Gap: no deliberately broken experiment in the test suite yet.
- [x] L3. Screenshot pass — all 30 storyboard scenes observed, each with its bench shot (swing frame by frame, relief pitcher, called game, the gate, the riddles).
  Test: build validates every observed scene names a shot that exists in the workbench.
- [~] L11. Sketch 03 — Eight teams, and yours (draft): rosters and their themes, player cards (POINT = sum of six ratings), team creation, the draft (TOO MANY PLAYERS → fire → hire by style; rookie ceilings re-roll).
  Done since: default name per strength; "?" is a fixed archetype (identical save data); female hire (hidden 4th row) and both riddle teams verified with exact answers; player records (16 bytes, ASCII names) in save RAM; growth rules sourced to the manual.
  Open: how saved records hold ratings (pitchers are nibble-packed in the working copy, card order — found in L4); the power-up cost curve; prestige → crowd → dollars; the Crushers' real names (no source found; ROM has no staff strings).
- [~] L4. Sketch 01 — The pitch (draft): speed kept at `$051A` in sixteenths; set at release (`$9600`, bank 6) from the SPEED table (`$ACEA`, bank 4), the held button (Down = fastball, Up = slow, reversing the manual), and a random 0–15; the slow pitch uses the sine table and an R CURVE roll. Remake: `src/model/pitcher.js` + `test/pitcher.test.js` (24 bench pitches; Pages runs `npm test`).
  Test: `npm test` in the remake (fault-injected: DROP instead of R CURVE fails 3).
  Open: stamina (`$0510`) and the fatigue cosine.
- [~] L13. Sketch 04 — The whole pitch (draft): mound placement, release lanes, per-frame steering (`$991B`: curve table, speed traded for bend), the drop (`$98D5`/`$9837`: fall −682/frame, brake 220/256; Down in flight is never read), the per-frame routine order (`$97B2`), and the controller slots (`$93`–`$96`) filled by pad copy or CPU (`$0521` = CPU plan, formerly the `pitch_speed_index` guess). Rig: `bench/lib/pitch-rig.lua` + 12 `pitch-rig-*` runs. Remake: `src/model/pitch.js` + `test/pitch.test.js` (12 flights, fault-injected).
  Open: release angle math (`$C18F`, style table `$97A4`); mound limits; strike-zone flag (`$98F0`) and calls; pad read before/after step (needs a run that changes buttons mid-flight); the batter's side.
- [ ] L5. Credits — sourced credits for Baseball Stars on the game page.
- [ ] L6. Label export — generate a Mesen `.mlb` from `_data/ram/<game>.yml`.
- [ ] L7. Go live — you: create `civicstudio/game-study` and `civicstudio/baseball-stars`, enable Pages (source: GitHub Actions) with custom domain `games.civic.studio`, add DNS `CNAME games → civicstudio.github.io`, push.
  Ready: `CNAME`, `.github/workflows/pages.yml` (pinned SHAs), Linux platform in `Gemfile.lock`, fair-use captions, trademark footer.
  Test: the workflow's check + verify steps; then load https://games.civic.studio.
- [x] L8. Fair-use screenshot pipeline — `bench/promote.mjs` publishes single frames with provenance; captions credit game/publisher/year/frame; build fails on unrecorded screens.
  Test: `npm run check` (2 fault injections).
- [ ] L9. Study No. 2 — SimCity 2000: storyboard, a DOS bench (DOSBox-X or DOSBox Staging, security-reviewed like Mesen), remake repo.
- [x] L12. Gaps pass (2026-10-25): sourced research (`bench/research/baseball-stars.md`), closed-loop typist, pitch speed decoded, the bank-borrow routine found, credits honestly stated on the game page.
- [~] L10. Baseball Stars runtime — boot, NMI/main-loop handshake, controller reader, bank switching, sound in bank 0, 27 of 42 scenes named (Sketch 02, draft). Tools: `bench/disasm.mjs`, RAM dumps in `lab.run{dumps}`.
  Open: the other 15 scenes (27 of 42 named); confirm `menu_page` ($00B1, now seen stepping 2 → 4 on team select); how the NMI swaps to bank 0 for sound; the pitch-speed bytes (leads in Sketch 01).

## Studies on the shelf

Games to study after Baseball Stars, with the system each one is best at teaching. Order of NES studies after Baseball Stars (user, 2026-10-22): Life Force before Excitebike; Zelda on the list.
NES dumps should be US or Japanese (60 Hz): PAL dumps run at 50 Hz with retuned timing, so they aren't the faithful reference for frame-by-frame work.
The collection in `tmp/ROMS/` (gitignored, excluded from every build) is a 2000-era set; check each dump against a current database (e.g. No-Intro) before pinning its SHA-1 — some old headers are wrong.

| Game | Publisher, year | What the study would build up | Dump in `tmp/ROMS/` (header) |
|---|---|---|---|
| SimCity 2000 | Maxis, 1993 (DOS) | A city as a model: zoning, land value, traffic, budgets, feedback between policy and outcome — the Civic Studio study | needs a DOS bench |
| Contra | Konami, 1988 | Two-player co-op on one screen, scrolling, enemy scripts, the Konami code | `USA/Contra (U)` — UxROM, 128 KB, CHR-RAM (graphics copied from PRG, no tile banks to extract) |
| Mike Tyson's Punch-Out!! | Nintendo, 1987 | Opponents as readable patterns and tells; giant sprites on MMC2, a mapper made for this game | `USA/Mike Tyson's Punch-Out!! (U) (PRG 1)` — MMC2, 128 + 128 KB. (`Punch-Out!! (U)` has a bad header: mapper 73.) |
| Life Force | Konami, 1988 | Two-player co-op shooter, alternating horizontal and vertical stages; the power-up bar; a shooter's scrolling and enemy waves | **needs a dump** — only `Unclassified/ZZZ_UNK_Salamander (Bad CHR …)` (a bad JP dump); `USA/Gradius (U)` is its sibling |
| The Legend of Zelda | Nintendo, 1987 (US) | A world as a grid of screens; the overworld map, dungeons, the save on a battery; secrets | `USA/Legend of Zelda, The (U) (PRG 1)` — MMC1, 128 KB, CHR-RAM, battery |
| Excitebike | Nintendo, 1984 | A whole game in 24 KB with no mapper; the track designer; overheating as a resource | `World/Excitebike (JU)` — NROM, 16 + 8 KB |
| Tetris | Nintendo, 1989 | The piece randomizer, gravity by level, delayed auto-shift — the rules competitive players study | `USA/Tetris (U) [!]` — MMC1, 32 + 16 KB |
| Dr. Mario | Nintendo, 1990 | Virus placement and the RNG; a puzzle game's fairness | `World/Dr Mario (JU)` — MMC1, 32 + 32 KB |
| Dragon Warrior | Enix, 1989 (US) | The console RPG's bones: menus, damage and encounter formulas, text, a battery save | `USA/Dragon Warrior (U) (PRG 1)` — MMC1, 64 + 16 KB, battery |
| Gemfire | Koei, 1992 (US) | Running provinces: taxes, loyalty, alliances — governance as a game system | `USA/Gemfire (U)` — MMC5, 256 + 256 KB, battery |

