-- Scene byte through the menus: Start → main menu → VS → 1 player → select team.
-- Same inputs as vs-1player.lua.
lab.run{
  stop = 3000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
  },
  ram = { every = 1, addrs = { 0x0484, 0x0486, 0x002A, 0x04FD, 0x04FA } },
}
