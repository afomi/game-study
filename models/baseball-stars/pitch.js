/**
 * A pitch in the air, one frame at a time.
 *
 * Measured from the original (Game Study, Sketches 01 and 04): every frame of a pitch, the game runs
 * the same steps, in this order (bank 6, $97B2). The pitcher's d-pad is read every frame, so
 * steering is a conversation that lasts the whole flight, not a choice made once. (The original also
 * checks the strike zone between fall and steer, $98F0; that isn't rebuilt yet.)
 *
 *   1. radar   the first frame, copy the forward speed into the radar reading ($9820)
 *   2. fall    a dropping ball loses height and brakes: speed × 220/256 a frame ($9837)
 *   3. steer   Left or Right held: trade forward speed for sideways speed ($991B)
 *   4. drop    a drop ball that's nearly at the plate starts to fall ($98D5)
 *   5. move    position += velocity ($97C4)
 *
 * Units are the original's: positions are 16-bit and wrap around; speeds are sixteenths of a
 * mile per hour, which is also distance per frame. `x` is sideways, `d` is toward the plate.
 * test/pitch.test.js replays 12 real pitches from the bench against this, frame by frame.
 */

/** How much one frame of steering bends the pitch, by curve rating (bank 6, $99BD). */
const STEER = [1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

/** How fast a drop ball falls, per frame ($98E2: $FD56). */
const DROP_FALL = -682

/** Height of every pitch until it drops ($C0-$C1). */
export const PITCH_HEIGHT = 0x1200

export class Pitch {
  constructor({ pitcher, x, d = 0x4000, vx, vd, drop = false }) {
    this.pitcher = pitcher
    this.x = x
    this.d = d
    this.vx = vx
    this.vd = vd
    this.height = PITCH_HEIGHT
    this.fallSpeed = 0
    this.drop = drop
    this.onGround = false
    this.radar = 0
    this.steerFrames = 0
  }

  /** One frame of flight. `held` is what the pitcher holds right now: { left, right }. */
  step(held = {}) {
    this.readRadar()
    this.fall()
    this.steer(held)
    this.startDrop()
    this.move()
  }

  readRadar() {
    if (this.radar === 0 && hi(this.d) < 0x80) this.radar = this.vd
  }

  fall() {
    if (this.onGround || this.fallSpeed >= 0) return
    this.vd = scale(this.vd, 220)
    this.height += this.fallSpeed
    if (this.height < 0) {
      this.height = 0
      this.fallSpeed = 0
      this.onGround = true
    }
  }

  steer({ left, right }) {
    if (this.onGround || !(left || right)) return
    if (hi(this.d) < 0x50 || hi(this.d) >= 0xe0) return // only in the middle of the flight
    if (((hi(this.x) - 0x40) & 0x80) !== 0) return // and only while it isn't far off to one side

    // Left wins if both are held. Right bends by L CURVE, Left by R CURVE.
    const bend = left ? -STEER[this.pitcher.rCurve] : STEER[this.pitcher.lCurve]
    const vx = this.vx + bend
    const vd = this.vd - Math.abs(bend)

    // The ball can't go more sideways than forward, and can't stop.
    if (Math.abs(vx) > this.vd || vd < 0) return
    this.vx = vx
    this.vd = vd
    this.steerFrames += 1
  }

  startDrop() {
    if (!this.drop || hi(this.d) < 0xa8) return
    this.fallSpeed = DROP_FALL
    this.drop = false
  }

  move() {
    this.x = (this.x + this.vx) & 0xffff
    this.d = (this.d + this.vd) & 0xffff
  }
}

const hi = (word) => word >> 8

/** value × factor / 256, rounded — the game's multiply ($C2D2). */
function scale(value, factor) {
  const product = value * factor
  return (product >> 8) + (product & 0x80 ? 1 : 0)
}
