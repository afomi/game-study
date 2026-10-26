-- Closed-loop name entry for Baseball Stars' letter strip, plus a little script runner.
-- Mesen's sandbox has no require(), so an experiment pulls this in with a line of its own:
--   -- @include lib/typist.lua
-- which bench/run.mjs replaces with this file's text.
--
-- The strip is a ring of 49 characters (name-strip-map, name-strip-values): A-Z, 0-9, ! $ & ',
-- , . + - ?, space, RIGHT-arrow, LEFT-arrow, END. $00BB is the strip cursor (8 × group + slot,
-- five slots a group; END is 76); $00BC is the position in the 16-letter name.
typist = {}
local RING = { "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
               "0","1","2","3","4","5","6","7","8","9","!","$","&","'", ",",".","+","-","?"," ","RIGHT","LEFT","END" }
local VALUE = {}
for i, ch in ipairs(RING) do VALUE[ch] = (i == 49) and 76 or (8 * ((i - 1) // 5) + (i - 1) % 5) end
local function ram(a) return emu.read(a, emu.memType.nesDebug) end

-- A script is a list of steps run one after another by the controller:
--   { type = "16-char text" }  → each character (padded to 16 with spaces), then END
--   { type = "A BIRD.", exact = true } → just these characters, no padding, no END
--   { type = "A BIRD.", exact = true, finish = true } → just these characters, then END
--   { press = "a", wait = 120 } → press a button, then wait that many frames
--   { wait = 60 }
function typist.controller(script, on_step)
  local step, queue, cool, phase, start_nc, held, waited = 1, nil, 0, "idle", nil, 0, 0
  return function(frame)
    if held > 0 then held = held - 1; return { a = true } end
    if cool > 0 then cool = cool - 1; return {} end
    local s = script[step]
    if not s then return {} end
    if s.type then
      if not queue then
        queue = {}
        local text = s.exact and s.type or (s.type .. string.rep(" ", 16)):sub(1, 16)
        for ch in text:gmatch(".") do queue[#queue + 1] = ch end
        if not s.exact or s.finish then queue[#queue + 1] = "END" end
      end
      local target = VALUE[queue[1]]
      if phase == "idle" then
        if ram(0xBB) ~= target then cool = 10; return { right = true } end
        phase, cool = "settle", 20                          -- let the strip finish scrolling
        return {}
      elseif phase == "settle" then
        phase, start_nc, held, waited = "pressed", ram(0xBC), 3, 0
        return { a = true }
      elseif phase == "pressed" then
        waited = waited + 1
        if queue[1] == "END" or ram(0xBC) ~= start_nc then
          table.remove(queue, 1); phase = "idle"; cool = 6
          if #queue == 0 then queue = nil; step = step + 1; if on_step then on_step(step - 1, frame) end end
        elseif waited > 60 then
          phase = "idle"                                    -- the press didn't take: try again
        end
        return {}
      end
    elseif s.press then
      step = step + 1; cool = s.wait or 60; if on_step then on_step(step - 1, frame) end
      return { [s.press] = true }
    elseif s.wait then
      step = step + 1; cool = s.wait; if on_step then on_step(step - 1, frame) end
      return {}
    end
  end
end
