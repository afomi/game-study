# MesenCE security review (static, read-only)

- Repo: https://github.com/nesdev-org/MesenCE
- Commit reviewed: `4b8a196e299b3de297b204fd1208d2981562c89b` (master, 2026-10-07, "Debugger: Tile Viewer ... (#294)")
- Method: shallow clone, static reading, `gh` API, and web lookups.
  Nothing was built, executed, or restored from it.
- Latest tagged release: `2.2.1` (2026-06-05).
  HEAD is about 4 months and ~200 commits ahead of it.
  Where it matters, the differences are noted.
- Review date: 2026-10-21.
- Notation: paths are relative to the clone root, and `file:line` refers to the reviewed SHA.

## Verdict

**It is reasonable to use in a Docker container for our purpose** (our own ROM dumps, our own Lua scripts, headless `--testRunner`), with the mitigations below.
I found no telemetry, no crash reporting, no obfuscated code, no committed secrets and no checked-in executables.
The network surface is opt-in or GUI-only:

- the update check, which the GUI runs by default but `--testRunner` never reaches;
- netplay, which is started manually;
- LuaSocket, which is off by default and needs two settings.

The main residual risks are generic ones:

- a large C/C++ codebase parsing binary inputs (ROMs, archives, savestates);
- a CI and release pipeline that is not hardened (actions not pinned to SHAs, an unpinned librashader download, a floating NuGet version, manually uploaded release assets with no attestations).

Recommended container posture:

1. `--network none`.
   Nothing in the headless path needs the network.
   This also neutralises LuaSocket and the update checker even if they are misconfigured.
2. Run as a non-root user, with `--cap-drop ALL`, `--security-opt no-new-privileges`, and `--read-only` on the root filesystem.
3. Give MesenCE a writable home only through a dedicated volume or tmpfs (see "File writes" below).
   Mount ROMs and Lua scripts read-only (`:ro`).
   Mount a separate writable `out/` volume for screenshots, savestates and logs.
4. Do not mount the Mac home directory or the docker socket.
   Treat the container as disposable: the native core `.so` files are extracted into the writable home folder and loaded from there.
5. Build from a pinned commit yourself, or verify release zips against GitHub's sha256 digests (listed below).
   Do not use `nightly.link` dev builds for anything you want to be reproducible.
6. Enable `AllowIoOsAccess` only if scripts must write files directly.
   Prefer returning data via `print()` to stdout.
   Never enable `AllowNetworkAccess`.

## 1. Provenance

| Item | Finding | Evidence |
|---|---|---|
| Upstream | `SourMesen/Mesen2` is **archived**. Its README says "This repository is an archive of Mesen as it was around version 2.1.1 in mid-2025. For the latest version of Mesen, see here: https://github.com/nesdev-org/MesenCE". | `gh api repos/SourMesen/Mesen2` → `archived: true`, pushed_at 2026-06-04; the README text was fetched via `gh api repos/SourMesen/Mesen2/readme` |
| Fork relationship | GitHub fork, `parent: SourMesen/Mesen2`, created 2026-02-13. | `gh api repos/nesdev-org/MesenCE` |
| Why the fork | Release notes: "Mesen is becoming MesenCE, a Community Edition maintained by Sour and various community members. All development will occur in this new fork going forward so it can continue whenever Sour is away from the project." | https://github.com/nesdev-org/MesenCE/releases/tag/2.2.1 |
| Who runs it | The `nesdev-org` GitHub org. Its public members are `avivace` and `Fiskbit`. The original author **SourMesen still commits most of the code**: 37 of the last 50 commits, and 119 of 212 commits since 2026-04-21. | `gh api orgs/nesdev-org/public_members`; `git log` |
| Maintainers / contributors | Since 2026-04-21: SourMesen 119, Fiskbit 34, NovaSquirrel 10, asiekierka 10, TakuikaNinja 7, HeeminTV 6, zeta0134 4, BrokeStudio 4, plus others. Effectively 1 primary author and ~2–4 regular reviewers or contributors. | `gh api repos/.../commits?since=...` |
| Activity | 48 commits since 2026-07-21, 212 since 2026-04-21, 299 in 2026. All recent commits are squash-merged PRs (`(#NNN)`). | `git log`, gh API |
| License | GPL-3.0 (`LICENSE`, `README.md`). New contributions are accepted under MIT, with an intent to relicense eventually. AI-generated code is prohibited. | `CONTRIBUTING.md` lines 1–9 |
| Release process | Releases `2.2.0` and `2.2.1` were **uploaded by user accounts** (author `SourMesen` for 2.2.0 and `Fiskbit` for 2.2.1), not by a CI bot. No provenance attestations exist (`gh api .../attestations/sha256:<linux zip>` → 404). GitHub shows a sha256 digest for each asset. Those digests **match** the hashes in the auto-update manifest `nesdev-org/MesenAutoUpdate/latestversion.json` (verified for all 6 assets). Example: Linux x64 `c88ff4d251b407515c43d3332d641927655cd69fb538996b6a21da4509dbb58f`. | `gh api repos/nesdev-org/MesenCE/releases`; `gh api repos/nesdev-org/MesenAutoUpdate/contents/latestversion.json` |
| CI builds | `.github/workflows/build.yml` builds Windows, Linux (gcc/clang/clang_aot, x64 and arm64), AppImage and macOS on every push and PR. Dev builds are served through the third-party proxy `nightly.link` (`README.md`). Whether the release zips are byte-identical to CI artifacts is **UNVERIFIED**. | `build.yml` |
| Code signing | macOS builds are self-signed. `README.md` says they "are self-signed and will require approval via Gatekeeper". The certificate comes from secret `MACOS_CERTIFICATE` (`build.yml:226-250`). Windows and Linux binaries are unsigned. | `README.md`, `build.yml` |
| Security policy | No `SECURITY.md` (`gh api .../contents/SECURITY.md` → 404). Issues are disabled on the repo (`has_issues: false`). Branch protection could not be inspected (404 without admin rights): **UNVERIFIED**. | gh API |

## 2. Network surface

| Component | Location | Default | Notes / how to disable |
|---|---|---|---|
| **Update checker** | `UI/ViewModels/UpdatePromptViewModel.cs:45-46` | **ON in the GUI** | `HttpClient.GetStringAsync("https://raw.githubusercontent.com/nesdev-org/MesenAutoUpdate/refs/heads/main/latestversion.json")`. It runs at GUI startup when `Preferences.AutomaticallyCheckForUpdates` is set; that defaults to `true` (`UI/Config/PreferencesConfig.cs:25`; trigger at `UI/Windows/MainWindow.axaml.cs:294-296`). The first-run wizard also defaults it to true (`UI/ViewModels/SetupWizardViewModel.cs:24`). **The `--testRunner` path never reaches it**: `Program.Main` returns from `TestRunner.Run` before the Avalonia window starts (`UI/Program.cs:73-75`). To disable, set `"AutomaticallyCheckForUpdates": false` in `settings.json`, pass `--preferences.automaticallyCheckForUpdates=false`, or use `--network none`. |
| Update download and install | `UpdatePromptViewModel.cs:95-140`, `UI/Utilities/UpdateHelper.cs:22-104` | Needs a user click in a dialog | The download URL must start with `https://github.com/nesdev-org/` or `https://github.com/SourMesen/` (`UpdatePromptViewModel.cs:52`). The SHA-256 is checked, but against a hash taken **from the same manifest**, so integrity rests on GitHub TLS plus control of the `MesenAutoUpdate` repo. There is no signature. The installer re-launches itself with `--update src dest backup` and copies over its own exe; on Windows it retries with `runas` (`UpdateHelper.cs:52-104`). Not reachable headless. |
| Netplay server / client | `Core/Netplay/GameServer.cpp:128` (`StartServer`), `Core/Netplay/GameClient.cpp:26` (`Connect`), `Utilities/Socket.cpp` | OFF; started only from GUI menus | Started from `UI/Windows/NetplayStartServerWindow.axaml.cs:31` and the main menu (`MainMenuViewModel.cs:953`). Default port 8888 (`UI/Config/NetplayConfig.cs:9,12`). No CLI or Lua path starts it. |
| UPnP port mapping | `Utilities/UPnPPortMapper.cpp` | Netplay only | Windows only (`#ifdef _WIN32`, lines 4 and 10). |
| **LuaSocket 3.0.0** (TCP/UDP/unix sockets) | `Lua/luasocket.c`, `tcp.c`, `udp.c`, `unix*.c`, `Lua/luasocket.h:13` | **OFF** | Registered as `package.preload["socket.core"]` only when **both** `ScriptAllowIoOsAccess` and `ScriptAllowNetworkAccess` are true (`Core/Debugger/ScriptingContext.cpp:71-80`). Both default to false (`Core/Shared/SettingTypes.h:936-937`, `UI/Config/Debugger/ScriptWindowConfig.cs:24-25`). |
| Single-instance IPC | `UI/Utilities/SingleInstance.cs:28-110` | ON in GUI mode | Local only: a .NET `NamedPipeServerStream` (a Unix domain socket on Linux and macOS), or a `mesen.lock` file on Linux AOT builds. A second instance forwards its command-line args, which are file paths to load. Not used by `--testRunner` (`Program.cs:73-78`). |
| Browser launches | `UI/Utilities/ApplicationHelper.cs:83-118` | GUI menu clicks only | Uses `xdg-open` via `/bin/sh -c` with regex escaping. All callers pass fixed URLs (`MainMenuViewModel.cs:1189,1202`, `AboutWindow.axaml.cs:105-116`) or the locally generated Lua docs HTML (`ScriptWindowViewModel.cs:120-122`). |
| Telemetry / crash reporting | **None found** | n/a | grep found no Sentry, AppCenter or analytics. The only `HttpClient` uses are in `UpdatePromptViewModel.cs` (lines 45 and 103). `HdPackCopyHelper.cs:8` has an unused `using System.Net;`. CI sets `DOTNET_CLI_TELEMETRY_OPTOUT=1`, which affects the build only. |
| Rainbow mapper "WiFi" | `Core/NES/Mappers/Homebrew/Rainbow.*` | n/a | Emulates the ESP/WiFi registers of the mapper. No socket code was found in these files. Irrelevant for Baseball Stars. |

Search method: `grep -rnE 'HttpClient|WebClient|WebRequest|TcpClient|TcpListener|UdpClient|System\.Net|Process\.Start|ProcessStartInfo|Assembly\.Load'` over `*.cs`.
Native code was searched with `socket\(|connect\(|bind\(|listen\(|accept\(|getaddrinfo|WSAStartup|curl_`.
The native hits were only `Core/Netplay/GameClient.cpp`, `Utilities/Socket.cpp`, `Utilities/UPnPPortMapper.cpp` and the LuaSocket sources.

## 3. Lua sandbox

- Lua version: **5.5.1** at HEAD (`Lua/lua.h:20-22`; upgraded in commit e7ab703, "Lua: Upgrade to Lua 5.5.1 (#281)", 2026-09-26).
  Release `2.2.1` ships **Lua 5.4.8** (`Lua/lua.h@2.2.1`).
- Libraries opened (`Core/Debugger/ScriptingContext.cpp:150-178`):
  - always: `_G` (base), `coroutine`, `table`, `string`, `math`, `utf8`, **`debug`**;
  - only when `ScriptAllowIoOsAccess=true`: `io`, `os`, `package` (with `require`).
- `loadfile`/`dofile` are blocked by a Mesen patch in `luaL_loadfilex` while the sandbox is on (`Lua/lauxlib.c:820-829`; flag set at `ScriptingContext.cpp:69`).
- With I/O enabled, the script's directory is appended to `package.path` (`ScriptingContext.cpp:82-91`).
  `emu.getScriptDataFolder()` then returns `<home>/LuaScriptData/<scriptname>/` (`Core/Debugger/LuaApi.cpp:1093-1107`).
- Network gate: see LuaSocket above. Both flags are required.
  The error text points users to "Script->Settings->Script Window->Restrictions" (`ScriptingContext.cpp:131-134`).
- Execution watchdog: `ScriptTimeout` defaults to 1 second per callback or load (`SettingTypes.h:938`, `ScriptingContext.cpp:141-148`).
  It uses a custom `lua_setwatchdogtimer` hook (`Lua/ldebug.c:147`).
- Native module loading (`package.loadlib`, C modules):
  - The Linux and macOS `makefile` builds define neither `LUA_USE_LINUX` nor `LUA_USE_MACOSX`/`LUA_USE_DLOPEN`; `CFLAGS` is `-fPIC -Wall $(MESENFLAGS)` (`makefile:115`). So `loadlib` falls back to "dynamic libraries not enabled" and **no C modules can be loaded on Linux**. This is derived from the code and was not tested.
  - `io.popen` is also unsupported for the same reason: `LUA_USE_POSIX` is not defined (`Lua/liolib.c:54-80`).
  - **`os.execute` still maps to `system()`** (`Lua/loslib.c:138`). So with I/O enabled, scripts can run shell commands.
  - Windows builds define `LUA_DL_DLL` (`Lua/luaconf.h:55-58`).
- Caveats, relevant only if we ever run untrusted Lua:
  - `debug` is exposed even in sandbox mode.
  - `load()` accepts binary chunks (default mode `"bt"`, `Lua/lbaselib.c:394-398`).
  - Crafted bytecode is a known way to escape a Lua sandbox.
  - So **the sandbox is not a security boundary against hostile scripts**. It is fine for our own scripts.

## 4. Native dependencies and supply chain

Vendored third-party code (in the repo, compiled from source):

| Component | Version | Path |
|---|---|---|
| Lua | 5.5.1 (release 2.2.1: 5.4.8) | `Lua/` |
| LuaSocket | 3.0.0 | `Lua/luasocket.h:13` and the socket sources in `Lua/` |
| miniz | 9.1.15 | `Utilities/miniz.h:258` |
| libspng | 0.6.3 | `Utilities/spng.h:27-29` |
| LZMA SDK / 7z decoder | version not stated in headers (**UNVERIFIED**) | `SevenZip/` |
| libevdev | statically compiled unless `SYSTEM_LIBEVDEV=true` | `Linux/libevdev/`, `makefile` |
| glad (GL/EGL loader) | | `Linux/include/glad/` |
| stb_vorbis, ymfm, emu2413, blip_buf, kissfft, xBRZ, HQX, Scale2x, NTSC filters, gif.h | | `Utilities/**` |
| magic_enum | | `Utilities/magic_enum.hpp` |

- SDL2 is **not vendored**.
  It is `dlopen`'d at runtime (`Sdl/include/Sdl2.h:48-80`, which tries `libSDL2-2.0.so.0` and others) and is used **only for audio** (`Sdl/SdlSoundManager.cpp:24,58`).
- librashader (shaders) is **downloaded at CI build time**, unpinned, from `https://nightly.link/SourMesen/librashader/workflows/build/Mesen/<zip>`.
  This is the latest artifact of a fork's workflow, with no checksum (`.github/actions/get-librashader-action/action.yml:21`).
  It is bundled into official builds.
  **Supply-chain weak point.**

NuGet (`UI/UI.csproj:113-126`, source nuget.org only per `NuGet.Config`):

- Pinned packages:
  - Avalonia 12.1.1 (plus Desktop, ColorPicker, Themes.Fluent at the same version);
  - Avalonia.AvaloniaEdit 12.0.0;
  - CommunityToolkit.Mvvm 8.4.2;
  - Dock.* 12.1.0;
  - ELFSharp 2.17.3;
  - AvaloniaUI.DiagnosticsSupport 2.2.3, only in non-optimized builds.
- **`Dotnet.Bundle` uses `Version="*"` (floating).**
- No `packages.lock.json` is committed.
  Builds are therefore not reproducible, and a compromised future version of `Dotnet.Bundle` would be pulled automatically.

GitHub Actions:

- Actions are pinned to **major tags, not SHAs**:
  - `actions/checkout@v6`, `actions/setup-dotnet@v5`, `microsoft/setup-msbuild@v3`, `actions/upload-artifact@v7`, `actions/cache@v5`;
  - third-party `jidicula/clang-format-action@v4.18.0` (`clang-format-check.yml:18`).
- **No `pull_request_target`** in any workflow.
  Triggers are `push` and `pull_request` only (`build.yml:3`, `tests.yml:3`, and the format checks).
- Secrets: `MACOS_CERTIFICATE` and `MACOS_CERTIFICATE_PWD` are used only in the macOS "Sign binary" step, guarded by `if: github.event_name != 'pull_request'` (`build.yml:226-231`).
  Fork PRs do not get secrets under `pull_request` anyway.
- Workflows declare no `permissions:` block, so they get the default `GITHUB_TOKEN` scope.
  The effective scope depends on org settings: **UNVERIFIED**.
- `tests.yml:42-49` checks out `nesdev-org/MesenTests` (unpinned) and runs it through `PGOHelper.exe citests`.
- `Linux/appimage/appimage.sh:6` downloads `appimagetool` from the AppImageKit `continuous` release, unpinned and unverified, and executes it.

Binaries in the repo (checked with `git ls-files | xargs file`):

- No ELF, PE or Mach-O executables, and no archives.
- Non-source blobs:
  - `UI/Dependencies/Satellaview/BSX012{0..4}-0.bin` (SNES BS-X data, not executable);
  - `UI/Assets/MesenIcon.icns`;
  - PNG icons;
  - `UI/Dependencies/MesenNesDB.txt`;
  - `UI/Dependencies/Internal/CheatDb.*.json`.

## 5. Other observations

- **Obfuscation / remote eval**: none found.
  There are no long base64 literals in code (regex `"[A-Za-z0-9+/=]{200,}"`), no `FromBase64String`, no `Reflection.Emit`/`DynamicMethod`, and no `system()`/`popen()` outside vendored Lua.
  The only downloaded content that gets executed is the user-confirmed self-update (section 2).
- **Secrets**: no AWS, GitHub, Slack, Google or private-key patterns found (`git grep` with common token regexes).
- **Native code loaded from a writable directory**: on every start, `DependencyHelper.ExtractNativeDependencies` unzips the embedded `Dependencies.zip` (`MesenCore.so`, SkiaSharp, HarfBuzz, and so on) into the **home folder** (`UI/Utilities/DependencyHelper.cs:14-44`, `UI/Program.cs:57,71`).
  `DllImportResolver` then loads them from there (`UI/Program.cs:87-108`).
  Anything that can write the home folder can therefore plant native code.
  With I/O enabled, that includes a Lua script.
  Mitigation: an ephemeral container and a home volume scoped to the run.
- **File writes outside the config/home dir**:
  - The GUI on Linux may write freedesktop MIME/desktop files (`UI/Config/FileAssociationHelper.cs:20-40,114-115`). All `Associate*` options default to false (`PreferencesConfig.cs:37-40`).
  - The setup wizard can create a desktop shortcut (`SetupWizardViewModel.cs:113`).
  - Neither is reachable from `--testRunner`.
  - `--recordMovie=` writes to a user-specified path (`UI/Utilities/CommandLineHelper.cs:68-84`).
- **Untrusted-input parsers**: ROM loaders, zip/7z readers (`Utilities/ZipReader.cpp`, `SZReader.cpp`, `ArchiveReader.cpp`), IPS/BPS patchers (`Utilities/Patches`), savestates, ELF (ELFSharp) and debug-symbol importers are all C++ or C#.
  Their memory safety is not audited here.
  The risk is low because we feed only our own dumps.
- **Silent failure in `--testRunner`**: Lua load or runtime errors go only to the in-memory script log (`ScriptingContext.cpp:128-139,180+`), not to stdout.
  The runner then waits for the timeout and exits `-1` (`UI/Utilities/TestRunner.cs:53-66`).
  Script-load exceptions are swallowed with `catch { }` (`TestRunner.cs:42-48`).
  This is not a security issue, but our harness must not trust a missing error message (see the capabilities doc).

## 6. Automated checks

| Tool | Available? | Result |
|---|---|---|
| semgrep | not installed | n/a |
| gitleaks | not installed | n/a (regex secret grep done manually: no hits) |
| osv-scanner | not installed | n/a |
| trivy | not installed | n/a |
| grype / syft / trufflehog / bandit | not installed | n/a |
| grep: URLs, network APIs, Process.Start, sockets, base64 blobs, shell exec | done | results above |
| `file` over all tracked files | done | no executables or archives committed |
| gh API (repo, releases, digests, contributors, attestations) | done | results above |

To run proper SCA later without executing repo code:

- `osv-scanner --recursive <dir>`, which reads `UI.csproj` but will miss the vendored C libraries;
- `trivy fs --scanners vuln,secret,misconfig <dir>`;
- `gitleaks detect --source <dir> --no-git`.

## Top findings, ranked for our use

1. **GUI auto-update check is on by default** (`PreferencesConfig.cs:25`).
   It is unreachable in `--testRunner`; `--network none` removes it entirely.
2. **The Lua sandbox is not a hard boundary**: `debug` is always loaded, binary `load()` is allowed, and `os.execute` works once I/O is on.
   That is fine for our own scripts.
   Keep `AllowIoOsAccess` off unless needed, and never enable `AllowNetworkAccess` (LuaSocket 3.0.0 is bundled).
3. **Supply chain is not hardened**:
   - unpinned librashader artifact from `nightly.link` baked into builds;
   - `Dotnet.Bundle Version="*"`;
   - actions pinned to tags rather than SHAs;
   - unpinned `appimagetool continuous`;
   - releases uploaded by hand with no attestations (GitHub digests do match the update manifest).
   Prefer building from a pinned SHA in our own Dockerfile, pin `Dotnet.Bundle` to an explicit version and vendor or pin librashader (or build without it).
4. **Native libraries are extracted to and loaded from the writable home folder** on each start.
   Keep the container ephemeral and non-root.
5. **Bus factor**: one primary author (SourMesen) plus a small group of reviewers.
   Upstream is archived and this fork is the only active line.
   There is no SECURITY.md and issues are disabled.
