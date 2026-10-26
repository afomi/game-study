-- HIRE PLAYER (the draft): build a team first (CONSISTENT HITTERS → BLASTERS → END →
-- first logo → YES), which unlocks HIRE/FIRE PLAYER on the main menu; then RIGHT, DOWN
-- to HIRE PLAYER and A. Shots every 30 frames; A every 150 after that to page through.
local shots, inputs = {}, {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },        -- MAKE TEAM
  { from = 900, to = 903, buttons = { a = true } },        -- CONSISTENT HITTERS
  { from = 1100, to = 1103, buttons = { left = true } },   -- letter strip: A → END
  { from = 1160, to = 1163, buttons = { a = true } },      -- END: keep "BLASTERS / TEAM 1"
  { from = 2000, to = 2003, buttons = { a = true } },      -- first logo
  { from = 2150, to = 2153, buttons = { a = true } },      -- ARE YOU SURE? YES → main menu (~2240)
  { from = 2400, to = 2403, buttons = { right = true } },
  { from = 2430, to = 2433, buttons = { down = true } },
  { from = 2490, to = 2493, buttons = { a = true } },      -- HIRE PLAYER
}
for f = 2800, 4600, 150 do inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { a = true } } end
shots[#shots + 1] = { frame = 2470, name = "menu-cursor" }
for f = 2500, 4800, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
lab.run{ stop = 4800, inputs = inputs, shots = shots, ram = { from = 2200, every = 1, addrs = { 0x0484, 0x00B1 } } }
