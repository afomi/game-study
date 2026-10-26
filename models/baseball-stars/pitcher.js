/**
 * A pitcher, and how fast they throw.
 *
 * Measured from the original (Game Study, Sketch 01): the game keeps a pitch's speed as a
 * whole number of sixteenths of a mile per hour, and the radar shows it rounded.
 * Every number below came off the bench, and test/pitcher.test.js replays 24 real pitches.
 *
 *   speed = base + windup + windup × jitter / 256
 *
 *   base    from the SPEED rating: 528 + 9.6 per point (33 to 42 MPH)
 *   windup  base again, or more or less of it, depending on the button held as the ball is let go:
 *             nothing  base                        (a plain pitch: 66 to 86 MPH)
 *             Down     base × (1.22 to 1.28)       (the fastball)
 *             Up       base × cos(28° to 39°)      (the slow pitch)
 *   jitter  a random 0 to 15
 */

import { SINE } from './sine.js'

/** Odds (out of 64) that the Up pitch keeps its flag, by the pitcher's R CURVE rating. */
const UP_PITCH_ODDS = [1, 2, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 44, 46, 48, 50]

export class Pitcher {
  constructor({ name, stamina, speed, lCurve, rCurve, drop, prestige }) {
    this.name = name
    this.stamina = stamina
    this.speed = speed
    this.lCurve = lCurve
    this.rCurve = rCurve
    this.drop = drop
    this.prestige = prestige
  }

  /** Half a plain pitch, in sixteenths of a mile per hour: 528 at SPEED 0, 672 at SPEED 15. */
  get baseSpeed() {
    return 528 + Math.floor((this.speed * 48) / 5)
  }

  /**
   * How fast the ball leaves the pitcher's hand, in sixteenths of a mile per hour.
   * `held` is the button held as the ball is let go: 'up', 'down', or nothing.
   * `random` is one byte (0-255) from the game's random number generator.
   */
  releaseSpeed({ held = null, random }) {
    const base = this.baseSpeed
    let windup = base // nothing held: a plain pitch

    if (held === 'down') {
      // The fastball: add 22% to 28% of the base.
      windup = base + scale(base, (random & 0x0f) + 0x38)
    }

    if (held === 'up') {
      // The slow pitch: keep 77% to 88% of the base, by turning a cosine dial to 28°-39°.
      // A second roll, with odds from R CURVE (not DROP!), nudges the dial one step further.
      const roll = ((random << 4) | (random >> 4)) & 0x3f
      const missed = roll >= UP_PITCH_ODDS[this.rCurve] ? 1 : 0
      windup = cosine(base, (random & 0x07) + 0x14 + missed)
    }

    // A wobble of 0 to 15 256ths of the wind-up, so no two pitches are quite the same.
    const jitter = (random >> 3) & 0x0f
    return base + windup + scale(windup, jitter)
  }
}

/** What the radar shows for a speed in sixteenths: rounded to the nearest mile per hour. */
export function radarMph(sixteenths) {
  return (sixteenths + 8) >> 4
}

/** value × factor / 256, rounded — the game's 16×8 multiply ($C2D2). */
function scale(value, factor) {
  const product = value * factor
  return (product >> 8) + (product & 0x80 ? 1 : 0)
}

/** value × cos(angle), with a full turn = 256 — the game's sine-table lookup ($C2B6). */
function cosine(value, angle) {
  const a = (angle + 0x40) & 0xff
  const s = SINE[a & 0x7f]
  const result = s === 1 ? value : scale(value, s)
  return a & 0x80 ? -result : result
}
