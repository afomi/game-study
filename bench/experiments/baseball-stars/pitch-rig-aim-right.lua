-- Pitch rig, aim-right: Right held through the wind-up up to release (6705-6820), then let go.
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6705, to = 6820, buttons = { right = true } } } }
