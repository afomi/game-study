/**
 * Half a sine wave, 128 steps from 0° to 180°, scaled so 256 = 1.0.
 * The original keeps the same table in ROM (bank 7, $C3D4), and it matches this one entry for entry.
 * One wrinkle, kept on purpose: a byte can't hold 256, so where the value would be 1.0 the table holds 1,
 * and the lookup treats 1 as "exactly 1.0".
 */
export const SINE = Array.from({ length: 128 }, (_, i) => {
  const value = Math.round(256 * Math.sin((i * Math.PI) / 128))
  return value === 256 ? 1 : value
})
