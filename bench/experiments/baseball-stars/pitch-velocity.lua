-- Pitch velocity: $051A is latched from $B2-$B3 by $9820 (bank 6) while $BD-$BE is being
-- advanced by $B2-$B3 each frame. Log every write to $B0-$B3 (who sets the velocity) and
-- $B0-$BE every frame around the first pitch (frames 2600-2760).

emu.addMemoryCallback(function(addr, value)
  if lab.frame < 2400 or lab.frame > 3950 then return end
  local st = emu.getState()
  print(string.format("NOTE w f=%d addr=%04X value=%02X pc=%04X bank=%d",
    lab.frame, addr, value, st["cpu.pc"] or 0, emu.read(0x25, emu.memType.nesDebug)))
end, emu.callbackType.write, 0x00B0, 0x00B3)

local addrs = {}
for a = 0xB0, 0xC3 do addrs[#addrs + 1] = a end
addrs[#addrs + 1] = 0x051A
addrs[#addrs + 1] = 0x051B

lab.run{
  stop = 3950,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
  },
  ram = { from = 2600, to = 2760, every = 1, addrs = addrs },
}
