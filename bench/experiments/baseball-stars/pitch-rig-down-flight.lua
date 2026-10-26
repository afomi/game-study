-- Pitch rig, down-flight: Down held only after release (6821-6880).
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6821, to = 6880, buttons = { down = true } } } }
