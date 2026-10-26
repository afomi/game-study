-- The draft, step 3: build a team, fire PIT-A1 (as hire-02), back to the main menu, then
-- HIRE PLAYER → TEAM 1 → and see the pool of players for hire. Shots every 30 frames.
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
for _, step in ipairs({
  { 3300, { a = true } },                                   -- leave the fired cutscene → main menu (~3322)
  { 3420, { right = true } }, { 3450, { down = true } },
  { 3510, { a = true } },                                   -- HIRE PLAYER
  { 3660, { a = true } },                                   -- TEAM 1
  { 3900, { a = true } }, { 4200, { a = true } },           -- then see what A does
}) do inputs[#inputs + 1] = { from = step[1], to = step[1] + 3, buttons = step[2] } end
for f = 3280, 6000, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
lab.run{ stop = 6000, inputs = inputs, shots = shots, ram = { from = 2200, every = 1, addrs = { 0x0484, 0x00B1 } } }
