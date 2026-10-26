-- Pitch input sources: who writes the pitcher's pad slot ($0093-$0096)? The CPU pitches the top
-- of the first (frames 2600-2730, release on 2726) and Sandie, player 1, pitches the bottom
-- (6650-6830, release on 6820, Left held from 6705). Log each distinct writer (PC, bank) per half.

local function r(a) return emu.read(a, emu.memType.nesDebug) end
local seen = {}
emu.addMemoryCallback(function(addr, value)
  local half = (lab.frame >= 2600 and lab.frame <= 2730) and "cpu" or ((lab.frame >= 6650 and lab.frame <= 6830) and "human" or nil)
  if not half then return end
  local k = string.format("%s %04X pc=%04X/b%d", half, addr, emu.getState()["cpu.pc"], r(0x25))
  if not seen[k] then seen[k] = 0 end
  if value ~= 0 then seen[k] = seen[k] + 1 end
end, emu.callbackType.write, 0x0093, 0x0096)
lab.every_frame(function(f)
  if f == 6831 then for k, n in pairs(seen) do print("NOTE writer " .. k .. " nonzero=" .. n) end end
end)

lab.run{
  stop = 6832,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
    { from = 6700, to = 6703, buttons = { a = true } },
    { from = 6705, to = 6820, buttons = { left = true } },
  },
}
