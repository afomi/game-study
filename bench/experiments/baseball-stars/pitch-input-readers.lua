-- Pitch input readers: which code reads the controller bytes during a pitch?
-- Sandie pitches (from frame 6700, A every 150 frames, nothing held). From the wind-up
-- to the ball reaching the plate (6790-6880), log every read of the pad bytes $008F-$0097
-- and $002F-$0030 with its PC and bank, plus ball state each frame.

local function r(a) return emu.read(a, emu.memType.nesDebug) end
local seen = {}
emu.addMemoryCallback(function(addr)
  if lab.frame < 6700 or lab.frame > 6880 then return end
  local st = emu.getState()
  local key = string.format("%04X@%04X/b%d", addr, st["cpu.pc"], r(0x25))
  seen[key] = seen[key] or { first = lab.frame, last = lab.frame, n = 0 }
  seen[key].last = lab.frame
  seen[key].n = seen[key].n + 1
end, emu.callbackType.read, 0x008F, 0x0097)
emu.addMemoryCallback(function(addr)
  if lab.frame < 6700 or lab.frame > 6880 then return end
  local st = emu.getState()
  local key = string.format("%04X@%04X/b%d", addr, st["cpu.pc"], r(0x25))
  seen[key] = seen[key] or { first = lab.frame, last = lab.frame, n = 0 }
  seen[key].last = lab.frame
  seen[key].n = seen[key].n + 1
end, emu.callbackType.read, 0x002F, 0x0030)

lab.every_frame(function(f)
  if f == 6881 then
    for k, v in pairs(seen) do print(string.format("NOTE read %s frames %d-%d n=%d", k, v.first, v.last, v.n)) end
  end
end)

local pitch = {}
for f = 6700, 6900, 150 do pitch[#pitch + 1] = { from = f, to = f + 3, buttons = { a = true } } end

lab.run{
  stop = 6890,
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
  ram = { from = 6700, to = 6880, every = 1, addrs = { 0x0484, 0x0094, 0x008F, 0x00B0, 0x00B1, 0x00B2, 0x00B3, 0x00BA, 0x00BB, 0x00BD, 0x00BE, 0x0518 } },
}
