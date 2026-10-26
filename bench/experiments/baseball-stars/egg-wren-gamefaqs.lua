-- Easter egg: women's team (GameFAQs: Down ×5, Right ×7, then Power Hitters)
-- Main menu → MAKE TEAM; on the strength grid: down down down down down right right right right right right right left; then A. Shots of the grid and the name screen.
lab.run{
  stop = 1300,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { down = true } },
    { from = 860, to = 863, buttons = { down = true } },
    { from = 880, to = 883, buttons = { down = true } },
    { from = 900, to = 903, buttons = { down = true } },
    { from = 920, to = 923, buttons = { down = true } },
    { from = 940, to = 943, buttons = { right = true } },
    { from = 960, to = 963, buttons = { right = true } },
    { from = 980, to = 983, buttons = { right = true } },
    { from = 1000, to = 1003, buttons = { right = true } },
    { from = 1020, to = 1023, buttons = { right = true } },
    { from = 1040, to = 1043, buttons = { right = true } },
    { from = 1060, to = 1063, buttons = { right = true } },
    { from = 1080, to = 1083, buttons = { left = true } },
    { from = 1120, to = 1123, buttons = { a = true } },
  },
  shots = { { frame = 1110, name = "grid" }, { frame = 1290, name = "name" } },
}
