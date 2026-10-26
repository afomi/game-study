-- Play a game, step 3: AD vs NB, then A on START GAME at the lineup screen.
-- Follow it to the first pitch.
local shots = {}
for f = 1480, 4200, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 4200,
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
  ram = { from = 1480, every = 1, addrs = { 0x0484, 0x00B1 } },
}
