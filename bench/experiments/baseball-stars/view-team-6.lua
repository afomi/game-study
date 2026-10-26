-- VIEW TEAM, team 6: main menu → VIEW TEAM → move right 6 times on select team → A.
-- Shots every 30 frames, with A pressed every 120 frames to page through whatever follows.
local shots, pages = {}, {}
for f = 990, 2400, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
for f = 1200, 2300, 120 do pages[#pages + 1] = { from = f, to = f + 3, buttons = { a = true } } end
lab.run{
  stop = 2400,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { down = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { right = true } },
    { from = 790, to = 793, buttons = { right = true } },
    { from = 820, to = 823, buttons = { right = true } },
    { from = 850, to = 853, buttons = { right = true } },
    { from = 880, to = 883, buttons = { right = true } },
    { from = 910, to = 913, buttons = { right = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    table.unpack(pages),
  },
  shots = shots,
  ram = { from = 990, every = 1, addrs = { 0x0484, 0x00B1 } },
}
