-- Menu branch: Right, down, down wraps to LEAGUE PLAY, then A (make a league)
-- Start at 480 opens the main menu (cursor on LEAGUE PLAY); then: Right, down, down wraps to LEAGUE PLAY, then A (make a league)
local shots = {}
for f = 560, 3000, 30 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end

lab.run{
  stop = 3000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 660, to = 663, buttons = { down = true } },
    { from = 720, to = 723, buttons = { a = true } },
  },
  shots = shots,
}
