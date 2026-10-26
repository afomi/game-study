-- Pitch while holding up: same start as game-05-mash, but when AD takes the field
-- (from frame 6700) press A every 150 frames while holding up the whole time.
-- Log the release routine's inputs ($9600), its result ($9657), and the radar latch ($051A), so the three
-- runs (pitch-hold-up, pitch-hold-down, pitch-hold-none) can be compared.

local function r(a) return emu.read(a, emu.memType.nesDebug) end
emu.addMemoryCallback(function()
  if r(0x25) ~= 6 then return end
  print(string.format("NOTE f=%d entry side=%d pad94=%02X rand33=%02X", lab.frame, r(0x0503), r(0x94), r(0x33)))
end, emu.callbackType.exec, 0x9600, 0x9600)
emu.addMemoryCallback(function()
  if r(0x25) ~= 6 then return end
  local v = r(0xB2) + 256 * r(0xB3)
  print(string.format("NOTE f=%d radar=%d mph=%.2f shown=%d", lab.frame, v, v / 16, math.floor(v / 16 + 0.5)))
end, emu.callbackType.exec, 0x982E, 0x982E)

emu.addMemoryCallback(function()
  if r(0x25) ~= 6 then return end
  print(string.format("NOTE f=%d release=%d", lab.frame, r(0xB2) + 256 * r(0xB3)))
end, emu.callbackType.exec, 0x9657, 0x9657)

local pitch = {}
for f = 6700, 9600, 150 do pitch[#pitch + 1] = { from = f, to = f + 3, buttons = { up = true, a = true } } end
pitch[#pitch + 1] = { from = 6650, to = 9700, buttons = { up = true } }

lab.run{
  stop = 9700,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
    table.unpack(pitch),
  },
}
