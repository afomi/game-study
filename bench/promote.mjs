// Publish one bench screenshot, deliberately, for use in a sketch.
//
//   node bench/promote.mjs <game> <run>/<shot> <name>
//   node bench/promote.mjs baseball-stars attract/t053 pitch-view
//
// Copies workbench/<game>/runs/<run>/<shot>.png to assets/screens/<game>/<name>.png
// and records its provenance in _data/screens/<game>.yml (run, shot, frame, ROM SHA-1,
// date). The screenshot include reads that record for the frame number and the
// attribution caption; `npm run check` fails on a published screen with no record,
// or a record with no file.
//
// Fair use: publish single frames that a sketch discusses. The bulk material
// (whole runs, decoded tiles) stays in the local workbench.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LAB = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [game, ref, name] = process.argv.slice(2)
if (!game || !/^[\w-]+\/[\w-]+$/.test(ref || '') || !/^[a-z0-9-]+$/.test(name || '')) {
  console.error('usage: node bench/promote.mjs <game> <run>/<shot> <name>   (name: lowercase-with-dashes)')
  process.exit(2)
}
const [run, shot] = ref.split('/')
const src = join(LAB, 'workbench', game, 'runs', run, `${shot}.png`)
const runJson = join(LAB, 'workbench', game, 'runs', run, 'run.json')
if (!existsSync(src) || !existsSync(runJson)) {
  console.error(`not found: ${src.replace(LAB + '/', '')} — rerun the experiment first`)
  process.exit(1)
}
const meta = JSON.parse(readFileSync(runJson, 'utf8'))
const frame = meta.shots?.[shot]?.frame
if (!Number.isInteger(frame)) throw new Error(`${ref}: no frame recorded in run.json`)

const dest = join(LAB, 'assets/screens', game, `${name}.png`)
mkdirSync(dirname(dest), { recursive: true })
copyFileSync(src, dest)

const dataFile = join(LAB, '_data/screens', `${game}.yml`)
mkdirSync(dirname(dataFile), { recursive: true })
const existing = existsSync(dataFile) ? readFileSync(dataFile, 'utf8') : `# Published screenshots for ${game}: provenance written by bench/promote.mjs.\n`
const entry = [
  `${name}:`,
  `  run: ${run}`,
  `  shot: ${shot}`,
  `  frame: ${frame}`,
  `  experiment: ${meta.experiment}`,
  `  rom_sha1: ${meta.rom_sha1}`,
  `  promoted: ${new Date().toISOString().slice(0, 10)}`,
].join('\n')
// Replace an existing record for this name, else append.
const blocks = existing.split(/\n(?=[a-z0-9-]+:\n)/)
const kept = blocks.filter((b) => !b.startsWith(`${name}:\n`))
writeFileSync(dataFile, [...kept, entry].join('\n').replace(/\n*$/, '\n'))

if (!readFileSync(dest).subarray(1, 4).equals(Buffer.from('PNG'))) throw new Error(`${dest}: not a PNG`)
console.log(`published ${ref} (frame ${frame}) → assets/screens/${game}/${name}.png`)
console.log(`use: {% include screenshot.html game="${game}" name="${name}" caption="…" %}`)
