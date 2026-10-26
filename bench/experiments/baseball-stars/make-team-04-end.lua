-- MAKE TEAM: CONSISTENT HITTERS → keep "BLASTERS / TEAM 1" → LEFT once (A wraps to END) → A.
-- Then follow along: shots every 30 frames, no further input until 2000, then A every 150.
local shots, inputs = {}, {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },
  { from = 1100, to = 1103, buttons = { left = true } },
  { from = 1160, to = 1163, buttons = { a = true } },
}
for f = 2000, 4400, 150 do inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { a = true } } end
for f = 1140, 4500, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
lab.run{ stop = 4500, inputs = inputs, shots = shots, ram = { from = 1080, every = 1, addrs = { 0x0484, 0x00B1 } } }
