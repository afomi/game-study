-- Does the PRG bank follow the scene? Trace $0484 (scene) and $0025 (PRG bank
-- shadow) through the attract demo, and trap sound-chip writes by PC and by the
-- bank shadow at the moment of the write.
local by = {}
local function on_write()
  local key = string.format("pc=%04X bank=%d scene=%d", emu.getState()["cpu.pc"] or 0, emu.read(0x25, emu.memType.nesDebug), emu.read(0x484, emu.memType.nesDebug))
  by[key] = (by[key] or 0) + 1
end
emu.addMemoryCallback(on_write, emu.callbackType.write, 0x4000, 0x4013)

local STOP = 4000
lab.every_frame(function(f)
  if f == STOP then
    local keys = {}
    for k in pairs(by) do keys[#keys + 1] = k end
    table.sort(keys)
    for _, k in ipairs(keys) do print("NOTE apu " .. k .. " count=" .. by[k]) end
  end
end)

lab.run{ stop = STOP, ram = { every = 1, addrs = { 0x0484, 0x0025 } } }
