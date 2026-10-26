-- Team names: VS → 1 PLAYER → AD, then team 5 as the opponent; the matchup card spells both names.
lab.run{
  stop = 1260,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 930, to = 933, buttons = { right = true } },
    { from = 950, to = 953, buttons = { right = true } },
    { from = 970, to = 973, buttons = { right = true } },
    { from = 990, to = 993, buttons = { right = true } },
    { from = 1060, to = 1063, buttons = { a = true } },
  },
  shots = { { frame = 1050, name = "pick" }, { frame = 1250, name = "card" } },
}
