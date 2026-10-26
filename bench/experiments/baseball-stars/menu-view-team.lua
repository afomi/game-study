-- Menu branch: Down once to VIEW TEAM, then A
-- Start at 480 opens the main menu (cursor on LEAGUE PLAY); then: Down once to VIEW TEAM, then A
local shots = {}
for f = 560, 3000, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 3000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { down = true } },
    { from = 660, to = 663, buttons = { a = true } },
  },
  shots = shots,
}
