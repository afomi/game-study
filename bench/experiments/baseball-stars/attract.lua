-- Attract: power on, touch nothing, and watch what the game shows by itself.
-- One shot a second for 90 seconds.
local shots = {}
for s = 1, 90 do shots[#shots + 1] = { frame = s * 60, name = string.format("t%03d", s) } end

lab.run{ stop = 90 * 60, shots = shots }
