-- Pitch rig, up: Up held through release (6705-6820), nothing in flight: the slow pitch.
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6705, to = 6820, buttons = { up = true } } } }
