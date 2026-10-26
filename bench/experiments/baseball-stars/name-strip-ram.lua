-- Which byte is the letter-strip cursor? Name screen (CONSISTENT HITTERS), then RIGHT every 60
-- frames ×6 and A ×2 (typing advances the name cursor); a RAM dump before each press settles.
local inputs = {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },
}
local dumps = { 1150 }
for i = 1, 6 do inputs[#inputs + 1] = { from = 1150 + i * 60, to = 1153 + i * 60, buttons = { right = true } }; dumps[#dumps + 1] = 1150 + i * 60 + 50 end
for i = 1, 2 do local f = 1510 + i * 60; inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { a = true } }; dumps[#dumps + 1] = f + 50 end
lab.run{ stop = 1700, inputs = inputs, dumps = dumps, shots = { { frame = 1690, name = "end" } } }
