-- Letter strip → cursor value ($00BB): name screen, then RIGHT every 60 frames ×49 (one full
-- lap of the ring), logging $00BB after each press settles; shots at a few laps for checking.
local inputs = {
  { from = 480, to = 485, buttons = { start = true } },
  { from = 600, to = 603, buttons = { right = true } },
  { from = 630, to = 633, buttons = { down = true } },
  { from = 690, to = 693, buttons = { a = true } },
  { from = 900, to = 903, buttons = { a = true } },
}
local shots = {}
for i = 1, 49 do
  local f = 1150 + i * 60
  inputs[#inputs + 1] = { from = f, to = f + 3, buttons = { right = true } }
  if i % 7 == 0 then shots[#shots + 1] = { frame = f + 50, name = string.format("step%02d", i) } end
end
lab.every_frame(function(f)
  if f >= 1200 and (f - 1150) % 60 == 50 then print(string.format("NOTE strip step=%d bb=%d", (f - 1150) // 60, emu.read(0xBB, emu.memType.nesDebug))) end
end)
lab.run{ stop = 1150 + 50 * 60, inputs = inputs, shots = shots }
