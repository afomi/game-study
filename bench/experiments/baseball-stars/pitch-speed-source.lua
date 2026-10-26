-- Pitch speed, the source: same inputs as pitch-speed-caller, run through the four calls.
-- Trap every write to $051A-$051B (the speed, in sixteenths of M/H) and log who wrote it:
-- the PC, the bank in the window, and the speed after the write.

local last = {}
local function speed_write(addr, value)
  local st = emu.getState()
  local lo = emu.read(0x051A, emu.memType.nesDebug)
  local hi = emu.read(0x051B, emu.memType.nesDebug)
  if addr == 0x051A then lo = value else hi = value end
  local key = string.format("%04X", st["cpu.pc"] or 0)
  print(string.format("NOTE f=%d addr=%04X value=%02X pc=%s bank=%d speed=%d a=%02X x=%02X y=%02X",
    lab.frame, addr, value, key, emu.read(0x25, emu.memType.nesDebug), hi * 256 + lo,
    st["cpu.a"] or 0, st["cpu.x"] or 0, st["cpu.y"] or 0))
end
emu.addMemoryCallback(speed_write, emu.callbackType.write, 0x051A, 0x051B)

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
}
