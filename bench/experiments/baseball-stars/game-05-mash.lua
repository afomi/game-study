-- Play a game, step 5: same start; from frame 6700 press A every 90 frames —
-- it throws when AD pitches and swings when AD bats. Fishing for contact,
-- fielding, home runs, and later innings.
local mash = {}
for f = 6700, 30000, 90 do mash[#mash + 1] = { from = f, to = f + 3, buttons = { a = true } } end
local shots = {}
for f = 6600, 30000, 60 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 30000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
    table.unpack(mash),
  },
  shots = shots,
  ram = { from = 6600, every = 1, addrs = { 0x0484, 0x00B1 } },
}
