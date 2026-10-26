-- Pitch rig, set-left: Left held before A (6600-6699): does the pitcher move on the mound?
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6600, to = 6699, buttons = { left = true } } } }
