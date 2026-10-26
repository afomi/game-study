-- MAKE TEAM, step 1: main menu → MAKE TEAM → A on the first strength (CONSISTENT HITTERS).
-- What does creating a team ask for?
local shots = {}
for f = 840, 2400, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
lab.run{
  stop = 2400,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
  },
  shots = shots,
  ram = { from = 840, every = 1, addrs = { 0x0484, 0x00B1 } },
}
