-- Pitch speed, the code: same game as game-03-start. Between frames 2600 and 2800 (the first
-- call, "STRIKE · 89 M/H"), log every CPU write of an ASCII digit to RAM ($0000-$07FF) and to
-- the PPU ($2007): which instruction (PC), which address, which digit, on which frame.

local log, seen = {}, {}
local function digit_write(addr, value)
  if lab.frame < 2600 or lab.frame > 2800 then return end
  if value < 0x30 or value > 0x39 then return end
  local key = string.format("pc=%04X addr=%04X", emu.getState()["cpu.pc"] or 0, addr)
  if not seen[key] then seen[key] = true; log[#log + 1] = string.format("f%d %s digit=%s", lab.frame, key, string.char(value)) end
end
emu.addMemoryCallback(digit_write, emu.callbackType.write, 0x0000, 0x07FF)
emu.addMemoryCallback(digit_write, emu.callbackType.write, 0x2007, 0x2007)
lab.every_frame(function(f) if f == 2801 then for _, l in ipairs(log) do print("NOTE " .. l) end end end)

lab.run{
  stop = 2810,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
  },
  shots = { { frame = 2800, name = "call" } },
  
}
