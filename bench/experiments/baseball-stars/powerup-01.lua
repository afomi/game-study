-- Power-ups: build a team, fire PIT-A1, hire a ROOKIE pitcher (the defaults), then
-- VIEW TEAM → TEAM 1 → first player, and poke the POINT row: RIGHT ×3, LEFT, A, UP, DOWN.
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
local steps = {
  { 3300, { a = true } }, { 3420, { right = true } }, { 3450, { down = true } },
  { 3510, { a = true } }, { 3660, { a = true } },           -- HIRE PLAYER → TEAM 1 → style menu
  { 3760, { a = true } },                                   -- accept ROOKIE / PITCHER OVERHAND / RIGHT
  { 3900, { a = true } }, { 4050, { a = true } },           -- confirm whatever follows
  { 4200, { b = true } }, { 4350, { a = true } },           -- try to get back to the main menu
}
for f = 3700, 4800, 30 do shots[#shots + 1] = { frame = f, name = string.format("h%04d", f) } end
for _, s in ipairs(steps) do inputs[#inputs + 1] = { from = s[1], to = s[1] + 3, buttons = s[2] } end
lab.run{ stop = 4800, inputs = inputs, shots = shots, ram = { from = 3600, every = 1, addrs = { 0x0484, 0x00B1 } } }
