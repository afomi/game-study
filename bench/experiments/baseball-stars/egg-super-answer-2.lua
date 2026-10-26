-- Easter egg answered: WHEN ISN'T IT? — WHEN IT / IS
-- The cheat on the strength grid (down right left down down right, then A), then the closed-loop typist answers the riddle
-- with "WHEN IT IS      " (16 letters: line 1, then line 2) and END. Save the team (first logo, YES), then
-- VIEW TEAM → the new team (9th) → its roster → its first player's card.
-- @include lib/typist.lua
local names = { "typed", "logo", "saved", "menu", "view", "", "", "", "", "", "", "", "teams", "roster", "card" }
local script = {
  { wait = 1260 },
  { type = "WHEN IT IS      " },
  { wait = 700 }, { press = "a", wait = 150 }, { press = "a", wait = 300 },
  { press = "down", wait = 60 }, { press = "a", wait = 200 },
  { press = "right", wait = 60 }, { press = "right", wait = 60 }, { press = "right", wait = 60 }, { press = "right", wait = 60 },
  { press = "right", wait = 60 }, { press = "right", wait = 60 }, { press = "right", wait = 60 }, { press = "right", wait = 120 },
  { press = "a", wait = 200 }, { press = "a", wait = 150 }, { wait = 10 },
}
local function snap(step, frame)
  local name = names[step - 1]
  if name and name ~= "" then print("PNG " .. frame .. " " .. name .. " " .. lab.base64(emu.takeScreenshot())) end
end
lab.run{
  stop = 16000,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 630, to = 633, buttons = { down = true } },
    { from = 690, to = 693, buttons = { a = true } },
    { from = 840, to = 843, buttons = { down = true } },
    { from = 860, to = 863, buttons = { right = true } },
    { from = 880, to = 883, buttons = { left = true } },
    { from = 900, to = 903, buttons = { down = true } },
    { from = 920, to = 923, buttons = { down = true } },
    { from = 940, to = 943, buttons = { right = true } },
    { from = 980, to = 983, buttons = { a = true } },
  },
  controller = typist.controller(script, snap),
  shots = (function() local t = { { frame = 1160, name = "riddle" } } for f = 9000, 15900, 150 do t[#t + 1] = { frame = f, name = string.format("t%05d", f) } end return t end)(),
}
