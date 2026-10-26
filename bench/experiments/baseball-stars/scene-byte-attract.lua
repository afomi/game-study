-- Scene byte: watch $0484 (scene index, read by the dispatcher at $CCBF) and the
-- frame-sync flags through power-on, title, and the attract demo. No input.
lab.run{
  stop = 90 * 60,
  ram = { every = 1, addrs = { 0x0484, 0x0486, 0x002A, 0x04FD, 0x04FA } },
}
