// Minimal 6502 disassembler for NES PRG-ROM (official opcodes only).
//
//   node bench/disasm.mjs <game> <bank> <$addr> [count]
//   node bench/disasm.mjs baseball-stars 7 '$CC69' 60
//
// <bank> is a 16 KB PRG bank number; it's mapped at $C000 if it's the last bank
// (fixed by MMC1 at power-on), otherwise at $8000. Output is ROM-derived: print it,
// study it, quote short excerpts in sketches — don't publish whole listings.
// Stops early at RTS/RTI/JMP so a routine reads as one unit (pass a count to go on).

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LAB = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// opcode → [mnemonic, mode]. Modes: imp acc imm zp zpx zpy abs abx aby ind izx izy rel
const OPS = {}
const def = (mn, list) => list.split(' ').forEach((p) => { const [hex, mode] = p.split(':'); OPS[parseInt(hex, 16)] = [mn, mode] })
def('ADC', '69:imm 65:zp 75:zpx 6D:abs 7D:abx 79:aby 61:izx 71:izy')
def('AND', '29:imm 25:zp 35:zpx 2D:abs 3D:abx 39:aby 21:izx 31:izy')
def('ASL', '0A:acc 06:zp 16:zpx 0E:abs 1E:abx')
def('BCC', '90:rel'); def('BCS', 'B0:rel'); def('BEQ', 'F0:rel'); def('BMI', '30:rel')
def('BNE', 'D0:rel'); def('BPL', '10:rel'); def('BVC', '50:rel'); def('BVS', '70:rel')
def('BIT', '24:zp 2C:abs'); def('BRK', '00:imp')
def('CLC', '18:imp'); def('CLD', 'D8:imp'); def('CLI', '58:imp'); def('CLV', 'B8:imp')
def('CMP', 'C9:imm C5:zp D5:zpx CD:abs DD:abx D9:aby C1:izx D1:izy')
def('CPX', 'E0:imm E4:zp EC:abs'); def('CPY', 'C0:imm C4:zp CC:abs')
def('DEC', 'C6:zp D6:zpx CE:abs DE:abx'); def('DEX', 'CA:imp'); def('DEY', '88:imp')
def('EOR', '49:imm 45:zp 55:zpx 4D:abs 5D:abx 59:aby 41:izx 51:izy')
def('INC', 'E6:zp F6:zpx EE:abs FE:abx'); def('INX', 'E8:imp'); def('INY', 'C8:imp')
def('JMP', '4C:abs 6C:ind'); def('JSR', '20:abs')
def('LDA', 'A9:imm A5:zp B5:zpx AD:abs BD:abx B9:aby A1:izx B1:izy')
def('LDX', 'A2:imm A6:zp B6:zpy AE:abs BE:aby')
def('LDY', 'A0:imm A4:zp B4:zpx AC:abs BC:abx')
def('LSR', '4A:acc 46:zp 56:zpx 4E:abs 5E:abx'); def('NOP', 'EA:imp')
def('ORA', '09:imm 05:zp 15:zpx 0D:abs 1D:abx 19:aby 01:izx 11:izy')
def('PHA', '48:imp'); def('PHP', '08:imp'); def('PLA', '68:imp'); def('PLP', '28:imp')
def('ROL', '2A:acc 26:zp 36:zpx 2E:abs 3E:abx'); def('ROR', '6A:acc 66:zp 76:zpx 6E:abs 7E:abx')
def('RTI', '40:imp'); def('RTS', '60:imp')
def('SBC', 'E9:imm E5:zp F5:zpx ED:abs FD:abx F9:aby E1:izx F1:izy')
def('SEC', '38:imp'); def('SED', 'F8:imp'); def('SEI', '78:imp')
def('STA', '85:zp 95:zpx 8D:abs 9D:abx 99:aby 81:izx 91:izy')
def('STX', '86:zp 96:zpy 8E:abs'); def('STY', '84:zp 94:zpx 8C:abs')
def('TAX', 'AA:imp'); def('TAY', 'A8:imp'); def('TSX', 'BA:imp'); def('TXA', '8A:imp'); def('TXS', '9A:imp'); def('TYA', '98:imp')

const SIZE = { imp: 1, acc: 1, imm: 2, zp: 2, zpx: 2, zpy: 2, rel: 2, izx: 2, izy: 2, abs: 3, abx: 3, aby: 3, ind: 3 }

// Well-known NES hardware registers, so listings read as intent.
const REGS = {
  0x2000: 'PPUCTRL', 0x2001: 'PPUMASK', 0x2002: 'PPUSTATUS', 0x2003: 'OAMADDR', 0x2004: 'OAMDATA',
  0x2005: 'PPUSCROLL', 0x2006: 'PPUADDR', 0x2007: 'PPUDATA', 0x4014: 'OAMDMA', 0x4015: 'APU_STATUS',
  0x4016: 'JOY1', 0x4017: 'JOY2/APU_FRAME', 0x4010: 'DMC_FREQ',
}
const hex = (n, w) => '$' + n.toString(16).toUpperCase().padStart(w, '0')
const name = (a) => (REGS[a] ? `${hex(a, 4)} ${REGS[a]}` : hex(a, 4))

export function disassemble(bytes, base, start, count = 40, { stopAtReturn = true } = {}) {
  const lines = []
  let pc = start
  for (let n = 0; n < count; n++) {
    const off = pc - base
    if (off < 0 || off >= bytes.length) break
    const op = bytes[off]
    const entry = OPS[op]
    if (!entry) { lines.push({ pc, bytes: [op], text: `.byte ${hex(op, 2)}` }); pc++; continue }
    const [mn, mode] = entry
    const size = SIZE[mode]
    const raw = [...bytes.subarray(off, off + size)]
    const b1 = raw[1], w = raw[1] | (raw[2] << 8)
    const arg = {
      imp: () => '', acc: () => 'A', imm: () => `#${hex(b1, 2)}`, zp: () => hex(b1, 2),
      zpx: () => `${hex(b1, 2)},X`, zpy: () => `${hex(b1, 2)},Y`,
      abs: () => name(w), abx: () => `${name(w)},X`, aby: () => `${name(w)},Y`, ind: () => `(${hex(w, 4)})`,
      izx: () => `(${hex(b1, 2)},X)`, izy: () => `(${hex(b1, 2)}),Y`,
      rel: () => hex((pc + 2 + ((b1 << 24) >> 24)) & 0xffff, 4),
    }[mode]()
    lines.push({ pc, bytes: raw, text: `${mn} ${arg}`.trim() })
    pc += size
    if (stopAtReturn && ['RTS', 'RTI', 'JMP'].includes(mn)) break
  }
  return lines
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [game, bankArg, addrArg, countArg] = process.argv.slice(2)
  const roms = JSON.parse(readFileSync(join(LAB, 'bench/roms.local.json'), 'utf8'))
  if (!game || !roms[game] || bankArg === undefined || !addrArg) {
    console.error("usage: node bench/disasm.mjs <game> <bank> <$addr> [count]")
    process.exit(2)
  }
  const rom = readFileSync(roms[game])
  const banks = rom[4]
  const bank = Number(bankArg)
  const prg = rom.subarray(16 + bank * 16384, 16 + (bank + 1) * 16384)
  const base = bank === banks - 1 ? 0xc000 : 0x8000
  const start = parseInt(addrArg.replace('$', ''), 16)
  const count = Number(countArg || 40)
  for (const l of disassemble(prg, base, start, count, { stopAtReturn: !countArg })) {
    console.log(`${hex(l.pc, 4).slice(1)}  ${l.bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ').padEnd(9)}  ${l.text}`)
  }
}
