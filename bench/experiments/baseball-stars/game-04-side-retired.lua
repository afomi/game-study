-- Play a game, step 4: same start, then no input — AD strikes out in order.
-- What does the end of a half-inning look like, and what happens when NB bats?
local shots = {}
for f = 4200, 10800, 60 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 10800,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
  },
  shots = shots,
  ram = { from = 4200, every = 1, addrs = { 0x0484, 0x00B1 } },
}
