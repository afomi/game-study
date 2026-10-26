-- Menus: from power-on, press Start on the title screen and see what follows.
-- Title is up by ~6 s (frame 360); Start at frame 480.
local shots = {}
for f = 450, 1800, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 1800,
  inputs = { { from = 480, to = 485, buttons = { start = true } } },
  shots = shots,
}
