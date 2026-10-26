-- Save RAM after making a team (sram-mystery-b): pick the strength, keep the suggested name (LEFT → END → A),
-- first logo, YES. Cartridge RAM snapshots before (600) and after the team is saved (2400).
lab.run{
  stop = 2420,
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
    { from = 1100, to = 1103, buttons = { left = true } },
    { from = 1160, to = 1163, buttons = { a = true } },
    { from = 2000, to = 2003, buttons = { a = true } },
    { from = 2150, to = 2153, buttons = { a = true } },
  },
  sram = { 600, 2400 },
  shots = { { frame = 2400, name = "after" } },
}
