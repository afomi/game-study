-- Easter egg answered: WHAT IS A WREN? — type exactly "A BIRD." and blank the second line (no END), then watch
-- The cheat on the strength grid (down down down down down right right right right right right right down down, then A), then the closed-loop typist answers the riddle
-- with "A BIRD.         " (16 letters: line 1, then line 2) and END. Save the team (first logo, YES), then
-- VIEW TEAM → the new team (9th) → its roster → its first player's card.
-- @include lib/typist.lua
local names = { "typed", "logo", "saved", "menu", "view", "", "", "", "", "", "", "", "teams", "roster", "card" }
local script = {
  { wait = 1420 },
  { type = "A BIRD.         ", exact = true },
  { wait = 2000 },
}
local function snap(step, frame)
  local name = names[step - 1]
  if name and name ~= "" then print("PNG " .. frame .. " " .. name .. " " .. lab.base64(emu.takeScreenshot())) end
end
lab.run{
  stop = 9100,
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
    { from = 1080, to = 1083, buttons = { down = true } },
    { from = 1100, to = 1103, buttons = { down = true } },
    { from = 1140, to = 1143, buttons = { a = true } },
  },
  controller = typist.controller(script, snap),
  shots = (function() local t = { { frame = 1320, name = "riddle" } } for f = 3000, 9000, 60 do t[#t + 1] = { frame = f, name = string.format("t%05d", f) } end return t end)(),
}
