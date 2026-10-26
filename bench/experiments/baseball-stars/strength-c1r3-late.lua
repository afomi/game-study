-- MAKE TEAM strengths: column 1, row 3 of the grid; then A, 43 frames later than strength-c1r3. Random? does the game suggest?
lab.run{
  stop = 1140,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { right = true } },
    { from = 860, to = 863, buttons = { down = true } },
    { from = 880, to = 883, buttons = { down = true } },
    { from = 900, to = 903, buttons = { down = true } },
    { from = 1003, to = 1006, buttons = { a = true } },
  },
  shots = { { frame = 950, name = "grid" }, { frame = 1130, name = "name" } },
}
