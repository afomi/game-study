-- Easter egg: women's team (TCRF: select and deselect Veterans 4 times)
-- Main menu → MAKE TEAM; on the strength grid: right down left right left right left right left right; then A. Shots of the grid and the name screen.
lab.run{
  stop = 1240,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { right = true } },
    { from = 860, to = 863, buttons = { down = true } },
    { from = 880, to = 883, buttons = { left = true } },
    { from = 900, to = 903, buttons = { right = true } },
    { from = 920, to = 923, buttons = { left = true } },
    { from = 940, to = 943, buttons = { right = true } },
    { from = 960, to = 963, buttons = { left = true } },
    { from = 980, to = 983, buttons = { right = true } },
    { from = 1000, to = 1003, buttons = { left = true } },
    { from = 1020, to = 1023, buttons = { right = true } },
    { from = 1060, to = 1063, buttons = { a = true } },
  },
  shots = { { frame = 1050, name = "grid" }, { frame = 1230, name = "name" } },
}
