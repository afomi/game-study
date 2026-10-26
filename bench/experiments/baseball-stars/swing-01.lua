-- The swing, frame by frame: same game as game-03-start; Pete swings (A) at Sasuke's first
-- pitch. A shot every 2 frames around the swing.
local shots = {}
for f = 2700, 2800, 2 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 2810,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
    { from = 2745, to = 2748, buttons = { a = true } },
  },
  shots = shots,
  ram = { from = 2700, every = 1, addrs = { 0x051A, 0x051B } },
}
