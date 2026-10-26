-- Menu sub-state check (league path): trace $00B1/$00FC (sub-menu id?) and $001F (cursor?).
lab.run{
  stop = 1000,
  inputs = { { from = 480, to = 485, buttons = { start = true } }, { from = 600, to = 603, buttons = { right = true } }, { from = 630, to = 633, buttons = { down = true } }, { from = 660, to = 663, buttons = { down = true } }, { from = 720, to = 723, buttons = { a = true } }, },
  ram = { from = 500, every = 1, addrs = { 0x0484, 0x00B1, 0x00FC, 0x001F } },
}
