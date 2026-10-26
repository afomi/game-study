-- A pitching rig for Baseball Stars: AD vs NB (game-03-start's inputs), NB bats out the top
-- of the first, and Sandie throws one pitch — A on frame 6700, released on frame 6820.
-- An experiment pulls this in with   -- @include lib/pitch-rig.lua
-- then calls pitch_rig.run{ name = "...", holds = { { from =, to =, buttons = {...} } } }.
--
-- Every frame from 6600 to 6880 it logs one NOTE line of ball and pitcher state:
--   ball position  x = $BA-$BB (sideways), d = $BD-$BE (toward the plate)
--   ball velocity  vx = $B0-$B1, vd = $B2-$B3 (sixteenths of M/H, signed)
--   pad94          the pitcher's held buttons as the pitch code sees them
--   f517, f518     the steering counter and the Up-pitch flag
--   h, vh          the ball's height $C0-$C1 and vertical speed $B4-$B5 (only the drop moves them)
--   c3             pitch flags: bit 0 = crossed the strike zone ($98F0), bit 1 = on the ground (drop)
-- spec.throw = frame to press A (default 6700); release follows 120 frames later. Throwing on a
-- different frame is how a run gets different dice ($33) without touching memory.
-- and every read of $0094 after release, with its PC (who listens to the pad in flight).

pitch_rig = {}
local function r(a) return emu.read(a, emu.memType.nesDebug) end
local function s16(a) local v = r(a) + 256 * r(a + 1); return v >= 32768 and v - 65536 or v end

function pitch_rig.run(spec)
  local readers = {}
  emu.addMemoryCallback(function()
    if lab.frame < 6821 or lab.frame > 6880 then return end
    local pc = string.format("%04X/b%d", emu.getState()["cpu.pc"], r(0x25))
    readers[pc] = readers[pc] or { first = lab.frame, last = lab.frame }
    readers[pc].last = lab.frame
  end, emu.callbackType.read, 0x0094, 0x0094)

  lab.every_frame(function(f)
    if f >= 6600 and f <= 6880 then
      print(string.format("NOTE ball f=%d x=%d d=%d vx=%d vd=%d h=%d vh=%d pad94=%02X f517=%d f518=%d c3=%02X",
        f, s16(0xBA), s16(0xBD), s16(0xB0), s16(0xB2), s16(0xC0), s16(0xB4), r(0x94), r(0x0517), r(0x0518), r(0xC3)))
    end
    if f == 6881 then
      for pc, v in pairs(readers) do print(string.format("NOTE reader %s frames %d-%d", pc, v.first, v.last)) end
    end
  end)

  local inputs = {
    { from = 480, to = 485, buttons = { start = true } },
    { from = 600, to = 603, buttons = { right = true } },
    { from = 660, to = 663, buttons = { a = true } },
    { from = 760, to = 763, buttons = { a = true } },
    { from = 900, to = 903, buttons = { a = true } },
    { from = 1000, to = 1003, buttons = { a = true } },
    { from = 1500, to = 1503, buttons = { a = true } },
    { from = spec.throw or 6700, to = (spec.throw or 6700) + 3, buttons = { a = true } },
  }
  for _, h in ipairs(spec.holds or {}) do inputs[#inputs + 1] = h end
  lab.run{ stop = 6890, inputs = inputs, shots = spec.shots }
end
