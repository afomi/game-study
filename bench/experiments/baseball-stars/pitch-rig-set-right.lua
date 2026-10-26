-- Pitch rig, set-right: Right held before A (6600-6699): the pitcher moves the other way on the mound.
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6600, to = 6699, buttons = { right = true } } } }
