-- Pitch rig, steer-left: Left held only after release (6821-6880): steering in flight.
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6821, to = 6880, buttons = { left = true } } } }
