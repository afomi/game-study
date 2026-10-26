-- The draft, step 2: build a team (as hire-01), then FIRE PLAYER (right, down ×3, A),
-- choose TEAM 1 (A), first player (A), confirm (A); then back on the main menu go to
-- HIRE PLAYER and see the pool. Shots every 30 frames; A every 150 after 3300.
local shots, inputs = {}, {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },
  { from = 1100, to = 1103, buttons = { left = true } },
  { from = 1160, to = 1163, buttons = { a = true } },
  { from = 2000, to = 2003, buttons = { a = true } },
  { from = 2150, to = 2153, buttons = { a = true } },      -- team saved; main menu ~2240
  { from = 2400, to = 2403, buttons = { right = true } },
  { from = 2430, to = 2433, buttons = { down = true } },
  { from = 2460, to = 2463, buttons = { down = true } },
  { from = 2490, to = 2493, buttons = { down = true } },
  { from = 2550, to = 2553, buttons = { a = true } },      -- FIRE PLAYER
  { from = 2700, to = 2703, buttons = { a = true } },      -- TEAM 1
  { from = 2850, to = 2853, buttons = { a = true } },      -- first player
  { from = 3000, to = 3003, buttons = { a = true } },      -- confirm?
}
for f = 3300, 5800, 150 do inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { a = true } } end
for f = 2520, 6000, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
lab.run{ stop = 6000, inputs = inputs, shots = shots, ram = { from = 2200, every = 1, addrs = { 0x0484, 0x00B1 } } }
