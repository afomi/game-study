-- Menu branch: Right, down once to MAKE TEAM, then A
-- Start at 480 opens the main menu (cursor on LEAGUE PLAY); then: Right, down once to MAKE TEAM, then A
local shots = {}
for f = 560, 3000, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 3000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
  },
  shots = shots,
}
