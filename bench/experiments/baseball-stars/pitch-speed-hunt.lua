-- Pitch speed hunt: same game as game-03-start; RAM dumps on four calls whose
-- on-screen speeds read 89, 89, 93, 81 M/H (frames 2800, 3220, 3550, 3910).

lab.run{
  stop = 4200,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
  },
  dumps = { 2800, 3220, 3550, 3910 },
  
}
