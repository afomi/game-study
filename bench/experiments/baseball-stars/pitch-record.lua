-- Pitcher record: when $ABE3 (bank 4) loads a pitcher for the mound, print the record it reads
-- through the pointer at $04 (eight bytes), plus the side. Byte 1's top nibble is the speed
-- rating; this run shows which nibble feeds the drop-ball odds at $050C.

local function r(a) return emu.read(a, emu.memType.nesDebug) end
emu.addMemoryCallback(function()
  if r(0x25) ~= 4 then return end
  local ptr = r(0x04) + 256 * r(0x05)
  local t = {}
  for i = 0, 7 do t[#t + 1] = string.format("%02X", r(ptr + i)) end
  print(string.format("NOTE f=%d side=%d ptr=%04X bytes=%s", lab.frame, r(0x0503), ptr, table.concat(t, " ")))
end, emu.callbackType.exec, 0xABEE, 0xABEE)

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
  },
}
