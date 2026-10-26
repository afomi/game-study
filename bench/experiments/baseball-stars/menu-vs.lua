-- Menu branch: Right to VS, then A
-- Start at 480 opens the main menu (cursor on LEAGUE PLAY); then: Right to VS, then A
local shots = {}
for f = 560, 2400, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 2400,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
  },
  shots = shots,
}
