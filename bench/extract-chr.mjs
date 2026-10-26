// Decode a ROM's CHR (tile graphics) into PNG sheets for the workbench.
//
//   node bench/extract-chr.mjs <game>
//
// Reads the ROM from bench/roms.local.json, writes workbench/<game>/chr/:
//   bank-NN.png   one 4 KB bank = 256 tiles as a 16×16 grid (128×128 px), grey palette
//   chr.json      header facts + bank list
// NES tiles are 8×8, 2 bits per pixel, stored as two 8-byte bit planes.
// The grey palette is a stand-in: real colors come from palette RAM at run time.
// Output is ROM-derived: gitignored, unpublished.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32, deflateSync } from 'node:zlib'

const LAB = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const game = process.argv[2]
const roms = JSON.parse(readFileSync(join(LAB, 'bench/roms.local.json'), 'utf8'))
if (!game || !roms[game] || !existsSync(roms[game])) {
  console.error('usage: node bench/extract-chr.mjs <game>  (ROM path in bench/roms.local.json)')
  process.exit(2)
}

const rom = readFileSync(roms[game])
if (rom.subarray(0, 4).toString('latin1') !== 'NES\x1a') throw new Error('not an iNES ROM')
const prgBanks = rom[4], chrBanks = rom[5], flags6 = rom[6], flags7 = rom[7]
const header = {
  sha1: createHash('sha1').update(rom).digest('hex'),
  mapper: (flags7 & 0xf0) | (flags6 >> 4),
  prg_kb: prgBanks * 16,
  chr_kb: chrBanks * 8,
  battery: Boolean(flags6 & 0x02),
  mirroring: flags6 & 0x08 ? 'four-screen' : flags6 & 0x01 ? 'vertical' : 'horizontal',
  trainer: Boolean(flags6 & 0x04),
}
const chrStart = 16 + (header.trainer ? 512 : 0) + prgBanks * 16384
const chr = rom.subarray(chrStart, chrStart + chrBanks * 8192)
if (chr.length !== chrBanks * 8192) throw new Error(`CHR truncated: ${chr.length} bytes`)

function png(width, height, gray) {
  const raw = Buffer.alloc((width + 1) * height)
  for (let y = 0; y < height; y++) gray.copy(raw, y * (width + 1) + 1, y * width, (y + 1) * width)
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
    return Buffer.concat([len, td, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 0
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

const SHADES = [0, 85, 170, 255]
const out = join(LAB, 'workbench', game, 'chr')
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const banks = []
for (let b = 0; b < chr.length / 4096; b++) {
  const px = Buffer.alloc(128 * 128)
  for (let t = 0; t < 256; t++) {
    const base = b * 4096 + t * 16
    const tx = (t % 16) * 8, ty = Math.floor(t / 16) * 8
    for (let row = 0; row < 8; row++) {
      const lo = chr[base + row], hi = chr[base + row + 8]
      for (let col = 0; col < 8; col++) {
        const bit = 7 - col
        px[(ty + row) * 128 + tx + col] = SHADES[((lo >> bit) & 1) | (((hi >> bit) & 1) << 1)]
      }
    }
  }
  const file = `bank-${String(b).padStart(2, '0')}.png`
  writeFileSync(join(out, file), png(128, 128, px))
  banks.push(file)
}
writeFileSync(join(out, 'chr.json'), JSON.stringify({ ...header, bank_kb: 4, banks }, null, 2) + '\n')

for (const f of banks) if (!readFileSync(join(out, f)).subarray(1, 4).equals(Buffer.from('PNG'))) throw new Error(`${f}: bad PNG`)
console.log(`${game}: mapper ${header.mapper}, PRG ${header.prg_kb} KB, CHR ${header.chr_kb} KB, battery ${header.battery}, ${header.mirroring} mirroring`)
console.log(`wrote ${banks.length} CHR banks (4 KB each) → workbench/${game}/chr/`)
