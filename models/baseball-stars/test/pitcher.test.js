// Replays real pitches from the original game, measured on the bench
// (bench/experiments/baseball-stars/pitch-hold-*.lua), against the Pitcher model.
// Each row: who pitched, the buttons held in the wind-up ($94), the random byte ($33),
// and the release speed the game computed ($B2-$B3), in sixteenths of a mile per hour.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Pitcher, radarMph } from '../pitcher.js'
import { SINE } from '../sine.js'

// Ratings as their cards show them (American Dreams' and Ninja Blacksox's aces).
const SANDIE = new Pitcher({ name: 'SANDIE', stamina: 15, speed: 15, lCurve: 12, rCurve: 8, drop: 12, prestige: 14 })
const SASUKE = new Pitcher({ name: 'SASUKE', stamina: 13, speed: 12, lCurve: 12, rCurve: 8, drop: 12, prestige: 12 })

const UP = 0x08
const DOWN = 0x04
const heldFrom = (pad) => (pad & UP ? 'up' : pad & DOWN ? 'down' : null)

const PITCHES = [
  { pitcher: SANDIE, held: 0x04, random: 0x7A, release: 1567, run: 'pitch-hold-down', frame: 6820 },
  { pitcher: SANDIE, held: 0x04, random: 0xC9, release: 1545, run: 'pitch-hold-down', frame: 7420 },
  { pitcher: SANDIE, held: 0x04, random: 0x6F, release: 1574, run: 'pitch-hold-down', frame: 8620 },
  { pitcher: SANDIE, held: 0x04, random: 0x95, release: 1511, run: 'pitch-hold-down', frame: 9434 },
  { pitcher: SANDIE, held: 0x00, random: 0x7A, release: 1383, run: 'pitch-hold-none', frame: 6820 },
  { pitcher: SANDIE, held: 0x00, random: 0x33, release: 1360, run: 'pitch-hold-none', frame: 7270 },
  { pitcher: SANDIE, held: 0x00, random: 0xEC, release: 1378, run: 'pitch-hold-none', frame: 7720 },
  { pitcher: SANDIE, held: 0x00, random: 0x27, release: 1355, run: 'pitch-hold-none', frame: 9070 },
  { pitcher: SANDIE, held: 0x00, random: 0x73, release: 1381, run: 'pitch-hold-none', frame: 9670 },
  { pitcher: SANDIE, held: 0x08, random: 0x7A, release: 1272, run: 'pitch-hold-up', frame: 6820 },
  { pitcher: SANDIE, held: 0x08, random: 0xC9, release: 1270, run: 'pitch-hold-up', frame: 7420 },
  { pitcher: SANDIE, held: 0x08, random: 0x6D, release: 1249, run: 'pitch-hold-up', frame: 8620 },
  { pitcher: SANDIE, held: 0x08, random: 0x99, release: 1264, run: 'pitch-hold-up', frame: 8920 },
  { pitcher: SANDIE, held: 0x08, random: 0xC5, release: 1230, run: 'pitch-hold-up', frame: 9220 },
  { pitcher: SASUKE, held: 0x04, random: 0x83, release: 1434, run: 'pitch-hold-down', frame: 2726 },
  { pitcher: SASUKE, held: 0x04, random: 0x21, release: 1441, run: 'pitch-hold-down', frame: 3140 },
  { pitcher: SASUKE, held: 0x06, random: 0x78, release: 1494, run: 'pitch-hold-down', frame: 3483 },
  { pitcher: SASUKE, held: 0x01, random: 0xF8, release: 1324, run: 'pitch-hold-down', frame: 3867 },
  { pitcher: SASUKE, held: 0x02, random: 0x5A, release: 1314, run: 'pitch-hold-down', frame: 4221 },
  { pitcher: SASUKE, held: 0x06, random: 0xD8, release: 1482, run: 'pitch-hold-down', frame: 4603 },
  { pitcher: SASUKE, held: 0x02, random: 0xEF, release: 1319, run: 'pitch-hold-down', frame: 5138 },
  { pitcher: SASUKE, held: 0x01, random: 0x75, release: 1321, run: 'pitch-hold-down', frame: 5528 },
  { pitcher: SASUKE, held: 0x01, random: 0x26, release: 1296, run: 'pitch-hold-down', frame: 5961 },
  { pitcher: SASUKE, held: 0x05, random: 0x68, release: 1488, run: 'pitch-hold-down', frame: 6283 },
]

test('base speed matches the table in the original (bank 4, $ACEA)', () => {
  const table = [528, 537, 547, 556, 566, 576, 585, 595, 604, 614, 624, 633, 643, 652, 662, 672]
  table.forEach((want, speed) => assert.equal(new Pitcher({ speed }).baseSpeed, want, `SPEED ${speed}`))
})

test('the sine table rounds to the same bytes as the original', () => {
  assert.deepEqual(SINE.slice(0, 8), [0, 6, 13, 19, 25, 31, 38, 44])
  assert.equal(SINE[64], 1)
  assert.equal(SINE.length, 128)
})

for (const p of PITCHES) {
  test(`${p.pitcher.name}, ${heldFrom(p.held) ?? 'nothing'} held, random ${p.random}: ${p.release} (${p.run} f${p.frame})`, () => {
    assert.equal(p.pitcher.releaseSpeed({ held: heldFrom(p.held), random: p.random }), p.release)
  })
}

test('the radar rounds sixteenths to whole miles per hour', () => {
  // The four calls from Sketch 01: STRIKE 89, STRIKE 89, STRIKE OUT 93, BALL 81.
  assert.deepEqual([1417, 1424, 1494, 1298].map(radarMph), [89, 89, 93, 81])
})

test('Down is the fastball, Up the slow pitch', () => {
  const fastest = (held) => Math.max(...Array.from({ length: 256 }, (_, random) => SANDIE.releaseSpeed({ held, random })))
  const slowest = (held) => Math.min(...Array.from({ length: 256 }, (_, random) => SANDIE.releaseSpeed({ held, random })))
  assert.ok(slowest('down') > fastest(null), 'every fastball beats every plain pitch')
  assert.ok(slowest(null) > fastest('up'), 'every plain pitch beats every slow pitch')
})
