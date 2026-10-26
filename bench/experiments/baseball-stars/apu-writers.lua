-- Who writes the sound chip? Trap CPU writes to $4000-$4013 and $4015 for
-- 20 s of the title screen (music playing) and count them by program counter.
local by_pc, total = {}, 0
local function on_write(addr, value)
  local pc = emu.getState()["cpu.pc"]
  local key = string.format("%04X", pc or 0)
  by_pc[key] = (by_pc[key] or 0) + 1
  total = total + 1
end
emu.addMemoryCallback(on_write, emu.callbackType.write, 0x4000, 0x4013)
emu.addMemoryCallback(on_write, emu.callbackType.write, 0x4015, 0x4015)

local STOP = 1600
lab.every_frame(function(f)
  if f == STOP then
    local keys = {}
    for k in pairs(by_pc) do keys[#keys + 1] = k end
    table.sort(keys)
    print("NOTE apu-writes total=" .. total .. " distinct-pcs=" .. #keys)
    for _, k in ipairs(keys) do print("NOTE apu-write pc=$" .. k .. " count=" .. by_pc[k]) end
  end
end)

lab.run{ stop = STOP, ram = { from = 400, to = 1600, every = 300, addrs = { 0x0484 } } }
