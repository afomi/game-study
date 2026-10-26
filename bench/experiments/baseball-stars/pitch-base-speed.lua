-- Pitch base speed: the release routine starts from a per-side base speed at $0506/$0508
-- (low byte, high byte; side 0 and side 1). Trap every write to $0506-$0509 and log who
-- writes it, then disassemble that code to see which rating it's built from.

local function r(a) return emu.read(a, emu.memType.nesDebug) end
emu.addMemoryCallback(function(addr, value)
  local st = emu.getState()
  print(string.format("NOTE f=%d addr=%04X value=%02X pc=%04X bank=%d a=%02X x=%02X y=%02X",
    lab.frame, addr, value, st["cpu.pc"], r(0x25), st["cpu.a"], st["cpu.x"], st["cpu.y"]))
end, emu.callbackType.write, 0x0506, 0x0509)

lab.run{
  stop = 6900,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
    { from = 6700, to = 6703, buttons = { a = true } },
  },
  dumps = { 6810 },
}
