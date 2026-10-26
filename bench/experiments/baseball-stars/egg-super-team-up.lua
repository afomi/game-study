-- Easter egg: super team, variant with Up first (Up, Down, Right, Left, Down, Down, Right)
-- Main menu → MAKE TEAM; on the strength grid: up down right left down down right; then A. Shots of the grid and the name screen.
lab.run{
  stop = 1180,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { up = true } },
    { from = 860, to = 863, buttons = { down = true } },
    { from = 880, to = 883, buttons = { right = true } },
    { from = 900, to = 903, buttons = { left = true } },
    { from = 920, to = 923, buttons = { down = true } },
    { from = 940, to = 943, buttons = { down = true } },
    { from = 960, to = 963, buttons = { right = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
  },
  shots = { { frame = 990, name = "grid" }, { frame = 1170, name = "name" } },
}
