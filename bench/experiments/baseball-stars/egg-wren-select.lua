-- Easter egg: women's team, reading TCRF literally — "select and deselect Veterans 4 times":
-- on the strength grid, move to VETERANS, then (A to select, B to back out) ×4, then A.
-- A shot after every press.
local inputs, shots = {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 840, to = 843, buttons = { right = true } },
  { from = 860, to = 863, buttons = { down = true } },
}, {}
local f = 900
for i = 1, 4 do
  inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { a = true } };  shots[#shots + 1] = { frame = f + 50, name = string.format("a%d", i) }; f = f + 80
  inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { b = true } };  shots[#shots + 1] = { frame = f + 50, name = string.format("b%d", i) }; f = f + 80
end
inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { a = true } }; shots[#shots + 1] = { frame = f + 150, name = "final" }
lab.run{ stop = f + 160, inputs = inputs, shots = shots }
