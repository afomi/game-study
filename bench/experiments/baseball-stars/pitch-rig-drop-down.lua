-- Pitch rig, drop-down: as pitch-rig-drop, then Down held in flight (6823-6880). The fan wiki
-- says holding Down can keep a drop ball from dropping; the in-flight code never reads Down.
-- @include lib/pitch-rig.lua
pitch_rig.run{ throw = 6702, holds = { { from = 6707, to = 6822, buttons = { up = true } }, { from = 6823, to = 6880, buttons = { down = true } } } }
