-- Easter egg: super team (Down, Right, Left, Down, Down, Right)
-- Main menu → MAKE TEAM; on the strength grid: down right left down down right; then A. Shots of the grid and the name screen.
lab.run{
  stop = 1160,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { down = true } },
    { from = 860, to = 863, buttons = { right = true } },
    { from = 880, to = 883, buttons = { left = true } },
    { from = 900, to = 903, buttons = { down = true } },
    { from = 920, to = 923, buttons = { down = true } },
    { from = 940, to = 943, buttons = { right = true } },
    { from = 980, to = 983, buttons = { a = true } },
  },
  shots = { { frame = 970, name = "grid" }, { frame = 1150, name = "name" } },
}
