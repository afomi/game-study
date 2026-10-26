-- Menu sub-state: full RAM dumps in each menu state, two frames apart, all
-- inside scene 7. Inputs as vs-1player.lua.
--   555/557 main menu, cursor on LEAGUE PLAY
--   640/642 main menu, cursor on VS
--   720/722 VS submenu
--   900/902 select team
lab.run{
  stop = 1000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
  },
  dumps = { 555, 557, 640, 642, 720, 722, 900, 902 },
  shots = { { frame = 555, name = "main" }, { frame = 640, name = "main-vs" }, { frame = 720, name = "vs" }, { frame = 900, name = "select-team" } },
}
