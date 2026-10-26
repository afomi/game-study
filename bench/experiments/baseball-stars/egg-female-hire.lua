-- Easter egg: a hidden fourth row on "WHAT STYLE OF PLAYER?" (manual: "a way to decide if your
-- player will be male or female. Can you find it?"). Build, fire, HIRE → TEAM 1, then DOWN ×5
-- (a shot after each), RIGHT once, then A to meet the prospect.
local shots, inputs = {}, {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },
  { from = 1100, to = 1103, buttons = { left = true } },
  { from = 1160, to = 1163, buttons = { a = true } },
  { from = 2000, to = 2003, buttons = { a = true } },
  { from = 2150, to = 2153, buttons = { a = true } },      -- team saved; main menu ~2240
  { from = 2400, to = 2403, buttons = { right = true } },
  { from = 2430, to = 2433, buttons = { down = true } },
  { from = 2460, to = 2463, buttons = { down = true } },
  { from = 2490, to = 2493, buttons = { down = true } },
  { from = 2550, to = 2553, buttons = { a = true } },      -- FIRE PLAYER
  { from = 2700, to = 2703, buttons = { a = true } },      -- TEAM 1
  { from = 2850, to = 2853, buttons = { a = true } },      -- first player
  { from = 3000, to = 3003, buttons = { a = true } },      -- confirm?
}
local steps = {
  { 3300, { a = true } }, { 3420, { right = true } }, { 3450, { down = true } },
  { 3510, { a = true } }, { 3660, { a = true } },           -- style menu up by ~3670
}
local f = 3720
for i = 1, 5 do
  steps[#steps + 1] = { f, { down = true } }
  shots[#shots + 1] = { frame = f + 20, name = string.format("down%d", i) }
  f = f + 40
end
steps[#steps + 1] = { f, { right = true } }; shots[#shots + 1] = { frame = f + 20, name = "right" }; f = f + 40
steps[#steps + 1] = { f, { a = true } }; shots[#shots + 1] = { frame = f + 120, name = "prospect" }
for _, s in ipairs(steps) do inputs[#inputs + 1] = { from = s[1], to = s[1] + 3, buttons = s[2] } end
lab.run{ stop = f + 130, inputs = inputs, shots = shots, sram = { f + 125 } }
