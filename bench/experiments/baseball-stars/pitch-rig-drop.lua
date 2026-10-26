-- Pitch rig, drop: Up held from the wind-up on, thrown on frame 6702 instead of 6700 — on this
-- frame the dice keep the Up pitch's flag ($0518 = 8), so it's a drop ball (found by trying
-- throws on 6701-6710; 6702, 6703, 6706, 6707, and 6710 keep it).
-- @include lib/pitch-rig.lua
pitch_rig.run{ throw = 6702, shots = { { frame = 6838, name = "f6838" }, { frame = 6844, name = "f6844" }, { frame = 6847, name = "f6847" }, { frame = 6849, name = "f6849" }, { frame = 6851, name = "f6851" }, { frame = 6853, name = "f6853" } }, holds = { { from = 6707, to = 6822, buttons = { up = true } } } }
