// Run one bench experiment in the locked-down MesenCE container and verify it.
//
//   node bench/run.mjs bench/experiments/<game>/<name>.lua
//
// The experiment's game is its parent directory name. The ROM path comes from
// bench/roms.local.json ({ "<game>": "/path/to/dump.nes" }, gitignored).
// Output goes to workbench/<game>/runs/<name>/ (gitignored, unpublished):
// PNG shots, ram.csv, notes.txt (Mesen's own warnings), run.json.
//
// Success is explicit (see bench/MESEN.md § experiment contract). The run fails
// unless: docker exits 0, READY is the first tagged line, its ROM SHA-1 matches
// both the dump on disk and rom_sha1 in _games/<game>.md, every EXPECTed shot
// arrived as a valid PNG, and DONE was printed.

import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LAB = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IMAGE = 'mesence-bench:2.2.1'
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const experiment = process.argv[2] && resolve(process.argv[2])
const timeout = Number(process.argv[3] || 120)
if (!experiment || !existsSync(experiment)) {
  console.error('usage: node bench/run.mjs bench/experiments/<game>/<name>.lua [timeout-seconds]')
  process.exit(2)
}
const game = basename(dirname(experiment))
const name = basename(experiment, '.lua')

const romsFile = join(LAB, 'bench/roms.local.json')
const rom = existsSync(romsFile) && JSON.parse(readFileSync(romsFile, 'utf8'))[game]
if (!rom || !existsSync(rom)) {
  console.error(`no ROM for '${game}': add { "${game}": "/path/to/dump.nes" } to bench/roms.local.json`)
  process.exit(2)
}
const romSha1 = createHash('sha1').update(readFileSync(rom)).digest('hex')
const gamePage = readFileSync(join(LAB, '_games', `${game}.md`), 'utf8')
const pinnedSha1 = (gamePage.match(/^rom_sha1:\s*([0-9a-f]{40})\s*$/m) || [])[1]

// Mesen's sandbox has no require(), so the prelude is prepended.
const work = mkdtempSync(join(tmpdir(), 'bench-'))
const script = join(work, `${name}.lua`)
// `-- @include lib/<file>.lua` lines in an experiment are replaced by that bench library file.
const body = readFileSync(experiment, 'utf8').replace(/^-- @include (lib\/[\w.-]+\.lua)$/gm, (_, lib) => {
  const path = join(LAB, 'bench', lib)
  if (!existsSync(path)) { console.error(`@include: bench/${lib} not found`); process.exit(2) }
  return readFileSync(path, 'utf8')
})
writeFileSync(script, readFileSync(join(LAB, 'bench/lib/prelude.lua'), 'utf8') + '\n' + body)

const started = Date.now()
const run = spawnSync('docker', [
  'run', '--rm',
  '--network', 'none',
  '--read-only', '--tmpfs', '/home/mesen:uid=1000,gid=1000,exec',
  '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
  '-v', `${rom}:/roms/game.nes:ro`,
  '-v', `${script}:/experiment/${name}.lua:ro`,
  IMAGE, '/roms/game.nes', `/experiment/${name}.lua`, String(timeout),
], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
rmSync(work, { recursive: true, force: true })
const seconds = (Date.now() - started) / 1000

// ---- parse ----
const out = join(LAB, 'workbench', game, 'runs', name)
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const tagged = [], notes = [], expected = [], shots = {}, ram = [], dumps = {}, srams = {}
let ready = null, done = null
for (const line of (run.stdout || '').split('\n')) {
  const [tag, ...rest] = line.split(' ')
  if (tag === 'READY') { ready = rest[0]; tagged.push(tag) }
  else if (tag === 'EXPECT') { expected.push(rest[0]); tagged.push(tag) }
  else if (tag === 'PNG') {
    const [frame, shot, data] = rest
    const bytes = Buffer.from(data || '', 'base64')
    writeFileSync(join(out, `${shot}.png`), bytes)
    shots[shot] = { frame: Number(frame), bytes: bytes.length, png: bytes.subarray(0, 8).equals(PNG_MAGIC) }
    tagged.push(tag)
  } else if (tag === 'RAM') {
    const [frame, ...pairs] = rest
    for (const p of pairs) { const [addr, val] = p.split('='); ram.push(`${frame},$${addr},${parseInt(val, 16)}`) }
    tagged.push(tag)
  } else if (tag === 'DUMP') {
    const [frame, data] = rest
    const bytes = Buffer.from(data || '', 'hex')
    writeFileSync(join(out, `ram-${String(frame).padStart(5, '0')}.bin`), bytes)
    dumps[frame] = bytes.length
    tagged.push(tag)
  } else if (tag === 'SRAM') {
    const [frame, data] = rest
    const bytes = Buffer.from(data || '', 'hex')
    writeFileSync(join(out, `sram-${String(frame).padStart(5, '0')}.bin`), bytes)
    srams[frame] = bytes.length
    tagged.push(tag)
  } else if (tag === 'NOTE') { notes.push(rest.join(' ')); tagged.push(tag) }
  else if (tag === 'DONE') { done = Number(rest[0]); tagged.push(tag) }
  else if (line.trim()) notes.push(line)
}
if (ram.length) writeFileSync(join(out, 'ram.csv'), 'frame,addr,value\n' + ram.join('\n') + '\n')
writeFileSync(join(out, 'notes.txt'), notes.join('\n') + '\n' + (run.stderr || ''))

// ---- verify ----
const checks = [
  ['docker exited 0', run.status === 0, `status ${run.status}${run.error ? ` (${run.error.message})` : ''}`],
  ['READY was the first tagged line', tagged[0] === 'READY', `first: ${tagged[0] || 'nothing — script may have failed to load (Mesen hides script errors)'}`],
  ['ROM SHA-1 from Mesen matches the dump', ready === romSha1, `${ready} vs ${romSha1}`],
  ['ROM SHA-1 matches rom_sha1 on the game page', pinnedSha1 === romSha1, `page: ${pinnedSha1 || 'not set'}`],
  [`all ${expected.length} expected shots arrived as PNGs`, expected.every((s) => shots[s]?.png === true),
    expected.filter((s) => shots[s]?.png !== true).map((s) => `${s} (${shots[s] ? 'bad header' : 'missing'})`).join(', ')],
  ['every RAM dump is 2 KB', Object.values(dumps).every((n) => n === 2048), JSON.stringify(dumps)],
  ['every cartridge RAM dump is 8 KB', Object.values(srams).every((n) => n === 8192), JSON.stringify(srams)],
  ['DONE was printed', done !== null, 'no DONE line'],
]
const failed = checks.filter(([, ok]) => !ok)
writeFileSync(join(out, 'run.json'), JSON.stringify({
  experiment: `bench/experiments/${game}/${name}.lua`, rom_sha1: romSha1, image: IMAGE,
  seconds, frames: done, shots, dumps, srams, checks: checks.map(([c, ok]) => ({ check: c, ok })),
}, null, 2) + '\n')

for (const [c, ok, why] of checks) console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${c}${ok ? '' : `\n       ${why}`}`)
console.log(`${failed.length ? 'FAILED' : 'passed'}: ${name} — ${done ?? '?'} frames, ${Object.keys(shots).length} shots, ${ram.length} RAM samples, ${Object.keys(dumps).length} dumps, ${seconds.toFixed(1)}s → ${out.replace(LAB + '/', '')}`)
process.exit(failed.length ? 1 : 0)
