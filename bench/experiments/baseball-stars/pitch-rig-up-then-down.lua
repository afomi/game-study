-- Pitch rig, up-then-down: Up through release, then Down in flight (6821-6880): the fan wiki's hold-Down.
-- @include lib/pitch-rig.lua
pitch_rig.run{ holds = { { from = 6705, to = 6820, buttons = { up = true } }, { from = 6821, to = 6880, buttons = { down = true } } } }
