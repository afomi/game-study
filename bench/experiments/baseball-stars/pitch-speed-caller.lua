-- Pitch speed, the caller: on frame 2759 the queue helper at $D7A9 writes "8" and "9" into the
-- screen-update queue ($0300). Log each queue write that frame with the helper's return address
-- (read off the stack), so we can find the code that computed the digits.

local log = {}
local function queue_write(addr, value)
  if lab.frame ~= 2759 then return end
  local st = emu.getState()
  local sp = st["cpu.sp"]
  local lo = emu.read(0x100 + ((sp + 1) & 0xFF), emu.memType.nesDebug)
  local hi = emu.read(0x100 + ((sp + 2) & 0xFF), emu.memType.nesDebug)
  local ret = (hi * 256 + lo + 1) & 0xFFFF
  log[#log + 1] = string.format("addr=%04X value=%02X char=%s pc=%04X caller=%04X bank=%d",
    addr, value, (value >= 0x20 and value < 0x7F) and string.char(value) or "?", st["cpu.pc"] or 0, ret - 3, emu.read(0x25, emu.memType.nesDebug))
end
emu.addMemoryCallback(queue_write, emu.callbackType.write, 0x0300, 0x033F)
lab.every_frame(function(f) if f == 2760 then for _, l in ipairs(log) do print("NOTE " .. l) end end end)

lab.run{
  stop = 2765,
  inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
  },
  shots = { { frame = 2761, name = "call" } },
  
}
