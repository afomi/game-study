-- Menu branch: VS, then A on 1PLAYER (team select?)
-- Start at 480 opens the main menu (cursor on LEAGUE PLAY); then: VS, then A on 1PLAYER (team select?)
local shots = {}
for f = 560, 3000, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 3000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
  },
  shots = shots,
}
