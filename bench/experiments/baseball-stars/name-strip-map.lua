-- Map the name-entry letter strip: MAKE TEAM → CONSISTENT HITTERS → name screen, then RIGHT ×50
-- from "A", a shot after each press (the cursor sits on the third of five visible entries).
local inputs, shots = {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },
}, { { frame = 1090, name = "r00" } }
for i = 1, 50 do
  local f = 1100 + i * 16
  inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { right = true } }
  shots[#shots + 1] = { frame = f + 12, name = string.format("r%02d", i) }
end
lab.run{ stop = 1100 + 51 * 16, inputs = inputs, shots = shots }
