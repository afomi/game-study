-- Easter egg: women's team: onto and off VETERANS 4 times, then on to "?"
-- Main menu → MAKE TEAM; on the strength grid: right down up down up down up down up down down; then A (on "?"). Shots of the grid and the name screen.
lab.run{
  stop = 1260,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { right = true } },
    { from = 860, to = 863, buttons = { down = true } },
    { from = 880, to = 883, buttons = { up = true } },
    { from = 900, to = 903, buttons = { down = true } },
    { from = 920, to = 923, buttons = { up = true } },
    { from = 940, to = 943, buttons = { down = true } },
    { from = 960, to = 963, buttons = { up = true } },
    { from = 980, to = 983, buttons = { down = true } },
    { from = 1000, to = 1003, buttons = { up = true } },
    { from = 1020, to = 1023, buttons = { down = true } },
    { from = 1040, to = 1043, buttons = { down = true } },
    { from = 1080, to = 1083, buttons = { a = true } },
  },
  shots = { { frame = 1070, name = "grid" }, { frame = 1250, name = "name" } },
}
