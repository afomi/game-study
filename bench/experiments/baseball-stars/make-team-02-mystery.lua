-- MAKE TEAM: the "?" strength (right, down ×3); then Start on the name screen (accept the default), A every 120 frames after.
local shots, keep = {}, {}
for f = 1080, 3600, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
for f = 1400, 3500, 120 do keep[#keep + 1] = { from = f, to = f + 3, buttons = { a = true } } end
lab.run{
  stop = 3600,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { right = true } },
    { from = 860, to = 863, buttons = { down = true } },
    { from = 880, to = 883, buttons = { down = true } },
    { from = 900, to = 903, buttons = { down = true } },
    { from = 940, to = 943, buttons = { a = true } },
    { from = 1100, to = 1105, buttons = { start = true } },
    table.unpack(keep),
  },
  shots = shots,
  ram = { from = 1080, every = 1, addrs = { 0x0484, 0x00B1 } },
}
