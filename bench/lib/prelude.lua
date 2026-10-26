-- Bench prelude: prepended to every experiment by bench/run.mjs.
-- Mesen's sandbox has no io/os/require, so everything leaves through print(),
-- one tagged line at a time (see ../MESEN.md § experiment contract):
--
--   READY <rom sha1>
--   EXPECT <shot name>          one per planned shot, so the harness knows what must exist
--   PNG <frame> <name> <base64>
--   RAM <frame> <addr>=<hex> ...
--   DUMP <frame> <hex>         all 2 KB of CPU RAM ($0000-$07FF), at frames listed in `dumps`
--   SRAM <frame> <hex>         all 8 KB of cartridge RAM ($6000-$7FFF, battery-backed), at `sram` frames
--   NOTE <text>
--   DONE <frame>
--
-- An experiment calls lab.run{...} with plain data:
--
--   lab.run{
--     stop = 900,                                    -- last frame
--     inputs = { { from = 300, to = 304, buttons = { start = true } } },  -- port = 1 for player 2
--     shots = { { frame = 240, name = "title" } },
--     ram = { from = 0, to = 900, every = 1, addrs = { 0x0400, 0x0401 } },
--     dumps = { 600, 720 },                          -- full RAM snapshots
--     sram = { 2300 },                               -- cartridge (save) RAM snapshots
--   }
--
-- spec.controller = function(frame) return { right = true } end  — closed-loop input: called at
-- every input poll, its buttons are added to player 1's pad (read RAM, decide, press).
--
-- lab.every_frame(fn) registers extra per-frame work that runs before the
-- shots/DONE bookkeeping (e.g. printing a summary on the last frame).

lab = {}

local B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
local b64 = {}
for i = 1, 64 do b64[i - 1] = B64:sub(i, i) end

function lab.base64(s)
  local out, n = {}, #s
  for i = 1, n, 3 do
    local a, b, c = s:byte(i, i + 2)
    local v = (a << 16) | ((b or 0) << 8) | (c or 0)
    out[#out + 1] = b64[(v >> 18) & 63] .. b64[(v >> 12) & 63]
      .. (b and b64[(v >> 6) & 63] or "=") .. (c and b64[v & 63] or "=")
  end
  return table.concat(out)
end

lab.frame = 0

local function ram_line(addrs)
  local parts = {}
  for _, a in ipairs(addrs) do
    parts[#parts + 1] = string.format("%04X=%02X", a, emu.read(a, emu.memType.nesDebug))
  end
  print("RAM " .. lab.frame .. " " .. table.concat(parts, " "))
end

local extra = {}
function lab.every_frame(fn) extra[#extra + 1] = fn end

local function dump_line()
  local hex = {}
  for a = 0, 0x7FF do hex[#hex + 1] = string.format("%02X", emu.read(a, emu.memType.nesDebug)) end
  print("DUMP " .. lab.frame .. " " .. table.concat(hex))
end

local function sram_line()
  local hex = {}
  for a = 0x6000, 0x7FFF do hex[#hex + 1] = string.format("%02X", emu.read(a, emu.memType.nesDebug)) end
  print("SRAM " .. lab.frame .. " " .. table.concat(hex))
end

function lab.run(spec)
  assert(type(spec.stop) == "number", "lab.run: stop (last frame) is required")
  local inputs, shots, ram = spec.inputs or {}, {}, spec.ram
  local dumps = {}
  for _, f in ipairs(spec.dumps or {}) do dumps[f] = true end
  local srams = {}
  for _, f in ipairs(spec.sram or {}) do srams[f] = true end

  print("READY " .. string.lower(emu.getRomInfo().fileSha1Hash))
  for _, s in ipairs(spec.shots or {}) do
    assert(s.frame <= spec.stop, "lab.run: shot " .. s.name .. " is after stop")
    shots[s.frame] = shots[s.frame] or {}
    table.insert(shots[s.frame], s.name)
    print("EXPECT " .. s.name)
  end

  -- Input lasts until the next poll, so it is (re)applied at every poll.
  emu.addEventCallback(function()
    local pads = { [0] = {}, [1] = {} }
    for _, step in ipairs(inputs) do
      if lab.frame >= step.from and lab.frame <= (step.to or step.from) then
        for k, v in pairs(step.buttons) do pads[step.port or 0][k] = v end
      end
    end
    if spec.controller then
      for k, v in pairs(spec.controller(lab.frame) or {}) do pads[0][k] = v end
    end
    emu.setInput(pads[0], 0)
    emu.setInput(pads[1], 1)
  end, emu.eventType.inputPolled)

  local stopped = false
  emu.addEventCallback(function()
    if stopped then return end
    lab.frame = lab.frame + 1
    local f = lab.frame
    for _, fn in ipairs(extra) do fn(f) end
    if dumps[f] then dump_line() end
    if srams[f] then sram_line() end
    if ram and f >= (ram.from or 0) and f <= (ram.to or spec.stop) and (f - (ram.from or 0)) % (ram.every or 1) == 0 then
      ram_line(ram.addrs)
    end
    for _, name in ipairs(shots[f] or {}) do
      print("PNG " .. f .. " " .. name .. " " .. lab.base64(emu.takeScreenshot()))
    end
    if f >= spec.stop then
      print("DONE " .. f)
      stopped = true
      emu.stop(0)
    end
  end, emu.eventType.endFrame)
end
