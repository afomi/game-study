-- Play a game, step 1: VS → 1 PLAYER → select team, then A on the first team (AD).
-- What comes after picking a team?
local shots = {}
for f = 880, 2400, 20 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 2400,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
  },
  shots = shots,
  ram = { from = 880, every = 1, addrs = { 0x0484, 0x00B1 } },
}
