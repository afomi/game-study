-- MAKE TEAM, name entry: on the name screen, press LEFT from "A" (wrap to the end of the
-- letter strip?), a shot after each press; then A on whatever is there; then follow along.
local shots, inputs = {}, {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },        -- CONSISTENT HITTERS → "BLASTERS"
}
for i = 0, 5 do
  local f = 1100 + i * 40
  inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { left = true } }
  shots[#shots + 1] = { frame = f + 30, name = string.format("left%d", i + 1) }
end
inputs[#inputs + 1] = { from = 1420, to = 1423, buttons = { right = true } }   -- back one (to the first wrapped item)
for i = 1, 4 do inputs[#inputs + 1] = { from = 1420 + i * 30, to = 1423 + i * 30, buttons = { right = true } } end
shots[#shots + 1] = { frame = 1400, name = "before-right" }
for f = 1600, 3000, 40 do shots[#shots + 1] = { frame = f, name = string.format("f%04d", f) } end
inputs[#inputs + 1] = { from = 1620, to = 1623, buttons = { a = true } }
lab.run{ stop = 3000, inputs = inputs, shots = shots, ram = { from = 1080, every = 1, addrs = { 0x0484, 0x00B1 } } }
