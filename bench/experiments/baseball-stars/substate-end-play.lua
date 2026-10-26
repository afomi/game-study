-- Menu sub-state check (end-play path): trace $00B1/$00FC (sub-menu id?) and $001F (cursor?).
lab.run{
  stop = 1000,
  inputs = { { from = 480, to = 485, buttons = { start = true } }, { from = 600, to = 603, buttons = { down = true } }, { from = 630, to = 633, buttons = { down = true } }, { from = 690, to = 693, buttons = { a = true } }, },
  ram = { from = 500, every = 1, addrs = { 0x0484, 0x00B1, 0x00FC, 0x001F } },
}
