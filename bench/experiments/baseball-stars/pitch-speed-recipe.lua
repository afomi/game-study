-- Pitch speed, the recipe: break into the release routine at $9600 (bank 6) and log the
-- inputs and intermediate values at each step, for every pitch in game-03-start's game.
--   9600 entry       X (whose base speed), the per-side tables $0500-$051F, pad $94, random $33
--   962F before add  $04-$05 (base, after fast/slow/fatigue adjustments)
--   9647 jitter      $02 (random 0-15) and $04-$05 (the amount it scales)
--   9657 release     $B2-$B3 (speed, before the aim splits it)
--   97A3 aimed       $B0-$B1 (sideways), $B2-$B3 (toward the plate), $00 (aim angle)

local function r(a) return emu.read(a, emu.memType.nesDebug) end
local function w16(a) return r(a) + 256 * r(a + 1) end
local function on(pc, fn)
  emu.addMemoryCallback(function()
    if r(0x25) ~= 6 then return end
    local st = emu.getState()
    print("NOTE f=" .. lab.frame .. " " .. fn(st))
  end, emu.callbackType.exec, pc, pc)
end

on(0x9600, function(st)
  local t = {}
  for a = 0x0500, 0x051F do t[#t + 1] = string.format("%02X", r(a)) end
  return string.format("entry x=%d pad94=%02X rand33=%02X side0503=%d t500=%s",
    st["cpu.x"], r(0x94), r(0x33), r(0x0503), table.concat(t, " "))
end)
on(0x962F, function(st) return string.format("beforeadd x=%d w04=%d", st["cpu.x"], w16(0x04)) end)
on(0x9647, function() return string.format("jitter r02=%d w04=%d b2=%d", r(0x02), w16(0x04), w16(0xB2)) end)
on(0x9657, function() return string.format("release b2=%d", w16(0xB2)) end)
on(0x97A3, function() return string.format("aimed b0=%d b2=%d angle=%02X", w16(0xB0), w16(0xB2), r(0x00)) end)

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
