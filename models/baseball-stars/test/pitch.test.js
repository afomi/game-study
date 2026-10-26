// Replays 12 real pitches from the original game, frame by frame, against the Pitch model.
// Each flight was logged on the bench (bench/experiments/baseball-stars/
// pitch-rig-*.lua): Sandie throws once per run, and only the buttons held change between runs.
// From the release state, the model must land on exactly the same position, velocity, and
// height as the original, every frame, until the ball stops.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Pitch, PITCH_HEIGHT } from '../pitch.js'
import { Pitcher } from '../pitcher.js'

const fixture = JSON.parse(readFileSync(new URL('./fixtures/pitch-flights.json', import.meta.url)))
const SANDIE = new Pitcher(fixture.pitcher)
const LEFT = 0x02
const RIGHT = 0x01

function fly(rows) {
  const [, , x, d, vx, vd, , , drop] = rows[0]
  const pitch = new Pitch({ pitcher: SANDIE, x, d, vx, vd, drop: drop === 1 })
  const snapshot = () => ({ x: pitch.x, d: pitch.d, vx: pitch.vx, vd: pitch.vd, height: pitch.height })
  const frames = [snapshot()]
  for (const [, pad] of rows.slice(1)) {
    pitch.step({ left: (pad & LEFT) !== 0, right: (pad & RIGHT) !== 0 })
    frames.push(snapshot())
  }
  return { pitch, frames }
}

for (const [name, rows] of Object.entries(fixture.flights)) {
  test(`${name}: ${rows.length} frames match the original`, () => {
    const { frames } = fly(rows)
    rows.forEach(([frame, , x, d, vx, vd, h], i) => {
      const got = frames[i]
      assert.deepEqual([got.x, got.d, got.vx, got.vd, got.height], [x, d, vx, vd, h], `frame ${frame}`)
    })
  })
}

test('every pitch flies at the same height until it drops', () => {
  assert.equal(fly(fixture.flights.none).pitch.height, PITCH_HEIGHT)
})

test('steering trades forward speed for sideways speed', () => {
  const plain = fly(fixture.flights.none).pitch
  const left = fly(fixture.flights['steer-left']).pitch
  const right = fly(fixture.flights['steer-right']).pitch
  assert.ok(left.vx < plain.vx && right.vx > plain.vx, 'Left bends one way, Right the other')
  assert.ok(left.vd < plain.vd && right.vd < plain.vd, 'either way, the pitch slows down')
  assert.ok(right.steerFrames > 0 && left.steerFrames > 0)
})

test('a drop ball falls to the ground just before the plate, and holding Down does not save it', () => {
  const drop = fly(fixture.flights.drop).pitch
  const held = fly(fixture.flights['drop-down']).pitch
  assert.equal(drop.onGround, true)
  assert.deepEqual([held.x, held.d, held.vd, held.height], [drop.x, drop.d, drop.vd, drop.height])
})
