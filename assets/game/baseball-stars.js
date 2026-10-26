const P = ["up", "down", "left", "right", "A", "B", "X", "Y", "start", "select"];
function v() {
  const i = {};
  for (const t of P) i[t] = !1;
  return i;
}
class Y {
  constructor() {
    this.sources = [], this.players = [
      { state: v(), prev: v() },
      { state: v(), prev: v() }
    ];
  }
  addSource(t) {
    this.sources.push(t);
  }
  /** Call once per frame before update. */
  poll() {
    for (let t = 0; t < 2; t++) {
      const e = this.players[t];
      for (const s of P) e.prev[s] = e.state[s];
      for (const s of P) e.state[s] = !1;
      for (const s of this.sources) {
        const r = s.getState(t);
        for (const n of P)
          r[n] && (e.state[n] = !0);
      }
    }
  }
  /** True on the frame the button was pressed. */
  pressed(t, e) {
    const s = this.players[t];
    return s.state[e] && !s.prev[e];
  }
  /** True while the button is held. */
  held(t, e) {
    return this.players[t].state[e];
  }
  /** True on the frame the button was released. */
  released(t, e) {
    const s = this.players[t];
    return !s.state[e] && s.prev[e];
  }
}
const B = 256, k = 240;
class W {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} [opts]
   * @param {'window'|'none'} [opts.fit='window'] - 'window' scales the canvas
   *   to fill the viewport; 'none' leaves sizing to the host page's CSS
   *   (used when embedded in an article).
   */
  constructor(t, { fit: e = "window" } = {}) {
    this.canvas = t, this.ctx = t.getContext("2d"), t.width = B, t.height = k, this.ctx.imageSmoothingEnabled = !1, this.phase = null, this.lastTime = 0, e === "window" && (this.resize(), window.addEventListener("resize", () => this.resize()));
  }
  /** Add an input source (keyboard, phone controller) — see InputManager. */
  addInputSource(t) {
    this.input || (this.input = new Y()), this.input.addSource(t);
  }
  /**
   * Scale the canvas element to fill the viewport while preserving
   * the NES aspect ratio. The internal resolution stays 256x240 —
   * CSS sizing + image-rendering: pixelated does the scaling.
   */
  resize() {
    const t = B / k, e = window.innerWidth / window.innerHeight;
    let s, r;
    e > t ? (r = window.innerHeight, s = r * t) : (s = window.innerWidth, r = s / t), this.canvas.style.width = `${Math.floor(s)}px`, this.canvas.style.height = `${Math.floor(r)}px`;
  }
  /**
   * Set the active game phase.
   * Each phase implements: enter(), update(dt, game), render(ctx, game), exit()
   */
  setPhase(t) {
    this.phase && this.phase.exit && this.phase.exit(this), this.phase = t, this.phase && this.phase.enter && this.phase.enter(this);
  }
  /** Start the game loop. */
  start() {
    this.lastTime = performance.now(), requestAnimationFrame((t) => this.loop(t));
  }
  /** @private */
  loop(t) {
    const e = (t - this.lastTime) / 1e3;
    this.lastTime = t;
    const s = Math.min(e, 1 / 30);
    this.input && this.input.poll(), this.phase && this.phase.update && this.phase.update(s, this), this.ctx.clearRect(0, 0, B, k), this.phase && this.phase.render && this.phase.render(this.ctx, this), requestAnimationFrame((r) => this.loop(r));
  }
}
const H = {
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  KeyJ: "A",
  KeyK: "B",
  KeyU: "X",
  KeyI: "Y",
  Enter: "start",
  ShiftLeft: "select"
}, K = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Numpad1: "A",
  Numpad2: "B",
  Numpad4: "X",
  Numpad5: "Y",
  NumpadEnter: "start",
  Numpad0: "select"
}, C = [H, K], U = new Set(C.flatMap((i) => Object.keys(i)));
class _ {
  /**
   * @param {EventTarget} [target=window] - where to listen. Pass a focusable
   *   canvas when embedded in a page so keys only drive the game while it
   *   has focus (and arrows/Enter don't hijack page scrolling elsewhere).
   */
  constructor(t = window) {
    this.keys = {}, t.addEventListener("keydown", (e) => {
      this.keys[e.code] = !0, U.has(e.code) && e.preventDefault();
    }), t.addEventListener("keyup", (e) => {
      this.keys[e.code] = !1;
    }), t.addEventListener("blur", () => {
      this.keys = {};
    });
  }
  /** Returns button state for the given player index. */
  getState(t) {
    const e = C[t];
    if (!e) return {};
    const s = {};
    for (const [r, n] of Object.entries(e))
      s[n] = !!this.keys[r];
    return s;
  }
}
const y = {
  grass: "#30a020",
  grassDark: "#208018",
  dirt: "#c09050",
  foulLine: "#fcfcfc",
  base: "#fcfcfc",
  mound: "#c09050",
  warning: "#a07840",
  wall: "#404040",
  sky: "#6888c8"
}, a = {
  home: { x: 128, y: 200 },
  first: { x: 188, y: 140 },
  second: { x: 128, y: 80 },
  third: { x: 68, y: 140 },
  mound: { x: 128, y: 148 },
  // Default fielder positions
  fielders: {
    pitcher: { x: 128, y: 148 },
    catcher: { x: 128, y: 210 },
    first: { x: 195, y: 145 },
    second: { x: 155, y: 115 },
    shortstop: { x: 100, y: 115 },
    third: { x: 60, y: 145 },
    left: { x: 50, y: 55 },
    center: { x: 128, y: 35 },
    right: { x: 206, y: 55 }
  }
}, h = {
  mound: { x: 128, y: 60 },
  plate: { x: 128, y: 195 },
  batterL: { x: 108, y: 192 },
  batterR: { x: 142, y: 192 },
  catcher: { x: 128, y: 215 },
  // Strike zone (for rendering the zone overlay)
  zone: { x: 112, y: 175, w: 32, h: 32 }
};
let x = null, I = null;
function V() {
  if (x) return x;
  const i = document.createElement("canvas");
  i.width = 256, i.height = 240;
  const t = i.getContext("2d");
  t.fillStyle = y.sky, t.fillRect(0, 0, 256, 20), t.fillStyle = y.wall, t.fillRect(0, 18, 256, 6), t.fillStyle = y.warning, t.fillRect(0, 22, 256, 10), t.fillStyle = y.grass, t.fillRect(0, 30, 256, 210), t.fillStyle = y.grassDark;
  for (let e = 30; e < 240; e += 12)
    t.fillRect(0, e, 256, 6);
  return q(t, a.home, a.first, a.second, a.third, y.dirt), t.strokeStyle = y.dirt, t.lineWidth = 8, t.beginPath(), t.moveTo(a.home.x, a.home.y), t.lineTo(a.first.x, a.first.y), t.lineTo(a.second.x, a.second.y), t.lineTo(a.third.x, a.third.y), t.closePath(), t.stroke(), t.fillStyle = y.mound, t.beginPath(), t.arc(a.mound.x, a.mound.y, 8, 0, Math.PI * 2), t.fill(), t.strokeStyle = y.foulLine, t.lineWidth = 1, t.beginPath(), t.moveTo(a.home.x, a.home.y), t.lineTo(0, 20), t.stroke(), t.beginPath(), t.moveTo(a.home.x, a.home.y), t.lineTo(256, 20), t.stroke(), z(t, a.first.x, a.first.y, 4), z(t, a.second.x, a.second.y, 4), z(t, a.third.x, a.third.y, 4), t.fillStyle = y.base, t.beginPath(), t.moveTo(a.home.x, a.home.y + 3), t.lineTo(a.home.x + 3, a.home.y), t.lineTo(a.home.x + 3, a.home.y - 2), t.lineTo(a.home.x - 3, a.home.y - 2), t.lineTo(a.home.x - 3, a.home.y), t.closePath(), t.fill(), x = i, i;
}
function G() {
  if (I) return I;
  const i = document.createElement("canvas");
  i.width = 256, i.height = 240;
  const t = i.getContext("2d");
  t.fillStyle = y.grass, t.fillRect(0, 0, 256, 240), t.fillStyle = y.grassDark;
  for (let e = 0; e < 240; e += 16)
    t.fillRect(0, e, 256, 8);
  return t.fillStyle = y.dirt, t.beginPath(), t.arc(h.plate.x, h.plate.y + 5, 30, 0, Math.PI * 2), t.fill(), t.strokeStyle = y.foulLine, t.lineWidth = 1, t.strokeRect(h.batterL.x - 8, h.batterL.y - 14, 16, 28), t.strokeRect(h.batterR.x - 8, h.batterR.y - 14, 16, 28), t.fillStyle = y.base, t.beginPath(), t.moveTo(h.plate.x, h.plate.y + 3), t.lineTo(h.plate.x + 4, h.plate.y), t.lineTo(h.plate.x + 4, h.plate.y - 3), t.lineTo(h.plate.x - 4, h.plate.y - 3), t.lineTo(h.plate.x - 4, h.plate.y), t.closePath(), t.fill(), t.fillStyle = y.mound, t.beginPath(), t.arc(h.mound.x, h.mound.y, 10, 0, Math.PI * 2), t.fill(), t.fillStyle = y.base, t.fillRect(h.mound.x - 4, h.mound.y - 1, 8, 2), t.fillStyle = y.dirt, t.fillRect(h.plate.x - 3, h.mound.y + 10, 6, h.plate.y - h.mound.y - 30), I = i, i;
}
function q(i, t, e, s, r, n) {
  i.fillStyle = n, i.beginPath(), i.moveTo(t.x, t.y), i.lineTo(e.x, e.y), i.lineTo(s.x, s.y), i.lineTo(r.x, r.y), i.closePath(), i.fill();
}
function z(i, t, e, s) {
  i.fillStyle = y.base, i.save(), i.translate(t, e), i.rotate(Math.PI / 4), i.fillRect(-s / 2, -s / 2, s, s), i.restore();
}
function J(i) {
  i.drawImage(V(), 0, 0);
}
function F(i) {
  i.drawImage(G(), 0, 0);
}
function f(i, t, e, s, r = "#fcfcfc", n = "left") {
  i.fillStyle = r, i.font = "8px monospace", i.textAlign = n, i.textBaseline = "top", i.fillText(t, e, s);
}
function w(i, t, e, s, r, n = "#202020", l = "#fcfcfc") {
  i.fillStyle = n, i.fillRect(t, e, s, r), i.strokeStyle = l, i.lineWidth = 1, i.strokeRect(t + 0.5, e + 0.5, s - 1, r - 1);
}
function M(i, t) {
  w(i, 4, 4, 120, 28);
  const r = t.awayRuns.reduce((p, d) => p + d, 0), n = t.homeRuns.reduce((p, d) => p + d, 0), l = t.isBottom ? " " : "▶", o = t.isBottom ? "▶" : " ";
  f(i, `${l}${t.awayName}  ${r}`, 8, 8), f(i, `${o}${t.homeName}  ${n}`, 8, 20), f(i, `${t.inning}`, 104, 8);
  const c = t.isBottom ? "▼" : "▲";
  f(i, c, 96, 8);
  const u = 132;
  w(i, u, 4, 60, 28), f(i, `B ${t.balls}`, u + 4, 8, "#40c040"), f(i, `S ${t.strikes}`, u + 28, 8, "#e04040"), f(i, `O ${t.outs}`, u + 4, 20, "#e0e040"), Z(i, 200, 6, t.runners || [!1, !1, !1]);
}
function Z(i, t, e, s) {
  const n = t + 12, l = e + 12, o = [
    { bx: n + 10, by: l, occupied: s[0] },
    // first
    { bx: n, by: l - 10, occupied: s[1] },
    // second
    { bx: n - 10, by: l, occupied: s[2] }
    // third
  ];
  for (const c of o)
    i.save(), i.translate(c.bx, c.by), i.rotate(Math.PI / 4), c.occupied ? (i.fillStyle = "#e0e040", i.fillRect(-6 / 2, -6 / 2, 6, 6)) : (i.strokeStyle = "#606060", i.lineWidth = 1, i.strokeRect(-6 / 2, -6 / 2, 6, 6)), i.restore();
}
class j {
  constructor() {
    this.x = 0, this.y = 0, this.z = 0, this.vx = 0, this.vy = 0, this.vz = 0, this.active = !1, this.breakX = 0, this.breakPhase = 0;
  }
  reset() {
    this.x = 0, this.y = 0, this.z = 0, this.vx = 0, this.vy = 0, this.vz = 0, this.active = !1, this.breakX = 0, this.breakPhase = 0;
  }
  update(t) {
    if (this.active) {
      if (this.x += this.vx * t, this.y += this.vy * t, this.z += this.vz * t, this.vz -= 400 * t, this.breakX !== 0) {
        this.breakPhase = Math.min(this.breakPhase + t * 3, 1);
        const e = this.breakPhase * this.breakPhase * this.breakPhase;
        this.vx += this.breakX * e * t * 60;
      }
      this.z < 0 && (this.z = 0, this.vz = Math.abs(this.vz) * 0.3, this.vx *= 0.8, this.vy *= 0.8, this.vz < 5 && (this.vz = 0));
    }
  }
  /** Screen x position. */
  get screenX() {
    return this.x;
  }
  /** Screen y position (height shifts ball up). */
  get screenY() {
    return this.y - this.z * 0.5;
  }
  /** Shadow y position (on the ground). */
  get shadowY() {
    return this.y;
  }
}
const N = {
  fastball: {
    name: "FAST",
    speed: 200,
    breakX: 0,
    vz: 20
  },
  curve: {
    name: "CURVE",
    speed: 140,
    breakX: 0,
    vz: 50
    // high arc
  },
  slider: {
    name: "SLIDE",
    speed: 170,
    breakX: 80,
    // breaks right (from pitcher's perspective)
    vz: 10
  },
  changeup: {
    name: "CHANGE",
    speed: 120,
    breakX: 0,
    vz: 15
  }
};
function Q(i, t, e, s, r) {
  const n = N[t];
  if (!n) return;
  i.reset(), i.active = !0, i.x = s.x, i.y = s.y, i.z = 12, i.vy = n.speed;
  const c = r.x + (e - 0.5) * 32, u = (r.y - s.y) / n.speed;
  i.vx = (c - s.x) / u, i.vz = n.vz, i.breakX = n.breakX, i.breakPhase = 0;
}
function tt(i, t) {
  const { timing: e, contactY: s, power: r, platePos: n } = t;
  i.reset(), i.active = !0, i.x = n.x, i.y = n.y, i.z = 4;
  const l = Math.abs(e);
  if (l > 0.7) {
    const b = e > 0 ? 1 : -1;
    return i.vx = b * (100 + Math.random() * 80), i.vy = -(40 + Math.random() * 60), i.vz = 60 + Math.random() * 80, "foul";
  }
  const o = 1 - l, c = 100 + r * 200;
  let u;
  s < -0.3 ? u = "ground" : s < 0.3 ? u = "line" : s < 0.7 ? u = "fly" : u = "popup";
  const p = -e * 0.8, d = c * o;
  switch (u) {
    case "ground":
      i.vx = p * d * 0.6, i.vy = -d * 0.8, i.vz = 5;
      break;
    case "line":
      i.vx = p * d * 0.5, i.vy = -d * 0.9, i.vz = d * 0.3;
      break;
    case "fly":
      i.vx = p * d * 0.4, i.vy = -d * 0.6, i.vz = d * 0.7;
      break;
    case "popup":
      i.vx = p * d * 0.2, i.vy = -d * 0.2, i.vz = d * 0.9;
      break;
  }
  return u;
}
const O = [
  {
    id: "stars",
    name: "STARS",
    abbr: "STR",
    colors: { primary: "#4040e0", secondary: "#e0e0e0" },
    roster: [
      { name: "SWIFT", pos: "CF", bat: 0.7, power: 0.5, speed: 0.9, field: 0.7 },
      { name: "BLAZE", pos: "SS", bat: 0.6, power: 0.4, speed: 0.8, field: 0.8 },
      { name: "THUNDER", pos: "1B", bat: 0.8, power: 0.9, speed: 0.3, field: 0.5 },
      { name: "ACE", pos: "P", bat: 0.4, power: 0.3, speed: 0.5, field: 0.6 },
      { name: "HAWK", pos: "RF", bat: 0.6, power: 0.6, speed: 0.7, field: 0.7 },
      { name: "ROCKY", pos: "3B", bat: 0.7, power: 0.7, speed: 0.4, field: 0.6 },
      { name: "FLASH", pos: "2B", bat: 0.5, power: 0.3, speed: 0.9, field: 0.8 },
      { name: "WALL", pos: "C", bat: 0.5, power: 0.6, speed: 0.3, field: 0.7 },
      { name: "SCOUT", pos: "LF", bat: 0.6, power: 0.5, speed: 0.8, field: 0.6 }
    ]
  },
  {
    id: "comets",
    name: "COMETS",
    abbr: "CMT",
    colors: { primary: "#e04040", secondary: "#e0e0e0" },
    roster: [
      { name: "JET", pos: "CF", bat: 0.8, power: 0.4, speed: 0.9, field: 0.7 },
      { name: "VIPER", pos: "SS", bat: 0.7, power: 0.5, speed: 0.7, field: 0.9 },
      { name: "TITAN", pos: "1B", bat: 0.7, power: 0.9, speed: 0.2, field: 0.5 },
      { name: "FLAME", pos: "P", bat: 0.3, power: 0.2, speed: 0.5, field: 0.6 },
      { name: "BOLT", pos: "RF", bat: 0.6, power: 0.7, speed: 0.6, field: 0.6 },
      { name: "SPIKE", pos: "3B", bat: 0.6, power: 0.8, speed: 0.4, field: 0.7 },
      { name: "DASH", pos: "2B", bat: 0.5, power: 0.3, speed: 0.8, field: 0.8 },
      { name: "SHIELD", pos: "C", bat: 0.4, power: 0.5, speed: 0.3, field: 0.8 },
      { name: "COMET", pos: "LF", bat: 0.7, power: 0.6, speed: 0.7, field: 0.6 }
    ]
  }
];
function L(i, t) {
  return i.roster[t % i.roster.length];
}
function g(i, t, e) {
  if (!t || !t.active) return;
  const s = Math.round(t.x), r = Math.round(t.y), n = Math.round(t.y - t.z * 0.5);
  t.z > 1 && (i.fillStyle = "rgba(0, 0, 0, 0.3)", i.fillRect(s - 2, r - 1, 4, 2)), i.fillStyle = "#fcfcfc", i.fillRect(s - 1, n - 1, 3, 3);
}
class et {
  constructor() {
    this.timer = 0;
  }
  enter() {
    this.timer = 0;
  }
  update(t, e) {
    this.timer += t, this.timer > 2 && e.input && (e.input.pressed(0, "start") || e.input.pressed(1, "start")) && e.setPhase(new X());
  }
  render(t, e) {
    t.fillStyle = "#0f0f23", t.fillRect(0, 0, 256, 240), f(t, "GAME OVER", 128, 40, "#e04040", "center"), w(t, 40, 70, 176, 50), f(t, `${e.awayTeam.name}`, 56, 82), f(t, `${e.inning.awayTotal}`, 190, 82, "#fcfcfc", "right"), f(t, `${e.homeTeam.name}`, 56, 100), f(t, `${e.inning.homeTotal}`, 190, 100, "#fcfcfc", "right");
    const s = e.inning.awayTotal > e.inning.homeTotal ? e.awayTeam.name : e.homeTeam.name;
    f(t, `${s} WIN!`, 128, 150, "#e0e040", "center"), this.timer > 2 && f(t, "PRESS START", 128, 200, "#808080", "center");
  }
  exit() {
  }
}
class $ {
  constructor() {
    this.timer = 0, this.duration = 2.5;
  }
  enter(t) {
    this.timer = 0, t.runners = [null, null, null];
  }
  update(t, e) {
    this.timer += t, e.input && (e.input.pressed(0, "start") || e.input.pressed(1, "start")) && (this.timer = this.duration), this.timer >= this.duration && (e.inning.nextHalf() ? e.setPhase(new et()) : e.setPhase(new T()));
  }
  render(t, e) {
    t.fillStyle = "#0f0f23", t.fillRect(0, 0, 256, 240);
    const s = e.inning.isBottom ? "BOTTOM" : "TOP";
    f(t, `END OF ${s}`, 128, 40, "#808080", "center"), f(t, `INNING ${e.inning.inning}`, 128, 56, "#fcfcfc", "center"), w(t, 20, 80, 216, 50), f(t, "       ", 28, 88);
    for (let o = 0; o < Math.max(e.inning.awayRuns.length, 9); o++)
      f(t, `${o + 1}`, 80 + o * 14, 88, "#808080");
    f(t, "R", 210, 88, "#808080"), f(t, e.awayTeam.abbr, 28, 100);
    for (let o = 0; o < e.inning.awayRuns.length; o++)
      f(t, `${e.inning.awayRuns[o]}`, 80 + o * 14, 100);
    f(t, `${e.inning.awayTotal}`, 210, 100), f(t, e.homeTeam.abbr, 28, 112);
    for (let o = 0; o < e.inning.homeRuns.length; o++)
      f(t, `${e.inning.homeRuns[o]}`, 80 + o * 14, 112);
    f(t, `${e.inning.homeTotal}`, 210, 112);
    const r = e.inning.isBottom ? "BOTTOM" : "TOP", n = e.inning.isBottom ? e.inning.inning : e.inning.inning + 1;
    f(t, `${r} ${n}`, 128, 160, "#e0e040", "center");
    const l = e.inning.isBottom ? e.homeTeam.name : e.awayTeam.name;
    f(t, `${l} AT BAT`, 128, 180, "#808080", "center");
  }
  exit() {
  }
}
const S = 60, it = 180;
class st {
  constructor(t) {
    this.hitType = t, this.fielders = [], this.activeFielder = 0, this.ballCaught = !1, this.throwTarget = null, this.playTimer = 0, this.playDead = !1, this.playDeadTimer = 0, this.resultText = null, this.runnersAdvancing = !1, this.batterRunning = !0, this.batterPos = { ...a.home }, this.batterTarget = { ...a.first };
  }
  enter(t) {
    const e = a.fielders;
    this.fielders = [
      { pos: "P", ...e.pitcher },
      { pos: "C", ...e.catcher },
      { pos: "1B", ...e.first },
      { pos: "2B", ...e.second },
      { pos: "SS", ...e.shortstop },
      { pos: "3B", ...e.third },
      { pos: "LF", ...e.left },
      { pos: "CF", ...e.center },
      { pos: "RF", ...e.right }
    ], this.activeFielder = this.findClosestFielder(t.ball), this.remapBallToFieldView(t);
  }
  /** Remap ball position from pitch view coordinates to field view coordinates. */
  remapBallToFieldView(t) {
    const e = t.ball;
    e.x = a.home.x + (e.x - 128) * 0.5, e.y = a.home.y;
  }
  findClosestFielder(t) {
    let e = t.x + t.vx * 1.5, s = t.y + t.vy * 1.5, r = 0, n = 1 / 0;
    for (let l = 0; l < this.fielders.length; l++) {
      const o = this.fielders[l], c = o.x - e, u = o.y - s, p = Math.sqrt(c * c + u * u);
      p < n && (n = p, r = l);
    }
    return r;
  }
  update(t, e) {
    if (this.playTimer += t, e.ball.update(t), this.playDead) {
      this.playDeadTimer += t, this.playDeadTimer > 1.5 && this.endPlay(e);
      return;
    }
    const s = e.inning.fieldingTeam, r = this.fielders[this.activeFielder];
    e.input.held(s, "up") && (r.y -= S * t), e.input.held(s, "down") && (r.y += S * t), e.input.held(s, "left") && (r.x -= S * t), e.input.held(s, "right") && (r.x += S * t);
    for (let n = 0; n < this.fielders.length; n++)
      n !== this.activeFielder && this.moveFielderTowardBall(this.fielders[n], e.ball, t);
    if (!this.ballCaught)
      for (const n of this.fielders) {
        const l = n.x - e.ball.x, o = n.y - e.ball.y;
        if (Math.sqrt(l * l + o * o) < 8 && e.ball.z < 15) {
          if (this.ballCaught = !0, e.ball.active = !1, (this.hitType === "fly" || this.hitType === "popup") && e.ball.z > 2) {
            this.resultText = "OUT!", e.inning.recordOut(), this.playDead = !0, this.playDeadTimer = 0;
            return;
          }
          break;
        }
      }
    if (this.ballCaught && !this.throwTarget && e.input.pressed(s, "A")) {
      e.input.held(s, "right") ? this.throwTarget = { ...a.first, base: 0 } : e.input.held(s, "up") ? this.throwTarget = { ...a.second, base: 1 } : e.input.held(s, "left") ? this.throwTarget = { ...a.third, base: 2 } : this.throwTarget = { ...a.first, base: 0 }, e.ball.active = !0, e.ball.x = r.x, e.ball.y = r.y, e.ball.z = 8;
      const n = this.throwTarget.x - r.x, l = this.throwTarget.y - r.y, c = Math.sqrt(n * n + l * l) / it;
      e.ball.vx = n / c, e.ball.vy = l / c, e.ball.vz = 20, this.ballCaught = !1;
    }
    if (this.throwTarget && e.ball.active) {
      const n = e.ball.x - this.throwTarget.x, l = e.ball.y - this.throwTarget.y;
      Math.sqrt(n * n + l * l) < 8 && (e.ball.active = !1, this.ballCaught = !0, this.throwTarget.base === 0 && this.hitType === "ground" ? (this.resultText = "OUT!", e.inning.recordOut()) : (this.resultText = "SAFE!", this.putBatterOn(e, this.throwTarget.base)), this.playDead = !0, this.playDeadTimer = 0);
    }
    if (this.batterRunning) {
      const n = this.batterTarget.x - this.batterPos.x, l = this.batterTarget.y - this.batterPos.y, o = Math.sqrt(n * n + l * l);
      o > 2 && (this.batterPos.x += n / o * 50 * t, this.batterPos.y += l / o * 50 * t);
    }
    if (e.ball.active && e.ball.z === 0 && Math.abs(e.ball.vz) < 1 && Math.abs(e.ball.vx) < 5 && Math.abs(e.ball.vy) < 5 && this.playTimer > 3) {
      this.resultText = this.hitType === "ground" ? "SINGLE" : "DOUBLE";
      const n = this.hitType === "ground" ? 0 : 1;
      this.putBatterOn(e, n), this.playDead = !0, this.playDeadTimer = 0;
    }
    this.playTimer > 10 && !this.playDead && (this.resultText = "SINGLE", this.putBatterOn(e, 0), this.playDead = !0, this.playDeadTimer = 0);
  }
  moveFielderTowardBall(t, e, s) {
    const r = e.x - t.x, n = e.y - t.y, l = Math.sqrt(r * r + n * n);
    if (l > 4) {
      const o = S * 0.8;
      t.x += r / l * o * s, t.y += n / l * o * s;
    }
  }
  putBatterOn(t, e) {
    for (let s = 2; s >= 0; s--)
      t.runners[s] && (s + e + 1 >= 3 ? (t.inning.scoreRun(), t.runners[s] = null) : (t.runners[s + e + 1] = t.runners[s], t.runners[s] = null));
    e < 3 ? t.runners[e] = { name: "RUNNER" } : t.inning.scoreRun();
  }
  endPlay(t) {
    t.inning.battingTeam === 0 ? t.awayBatterIndex = (t.awayBatterIndex + 1) % t.awayTeam.roster.length : t.homeBatterIndex = (t.homeBatterIndex + 1) % t.homeTeam.roster.length, t.atBat.reset(), t.inning.outs >= 3 ? t.setPhase(new $()) : t.setPhase(new T());
  }
  render(t, e) {
    J(t), M(t, {
      awayName: e.awayTeam.abbr,
      homeName: e.homeTeam.abbr,
      awayRuns: e.inning.awayRuns,
      homeRuns: e.inning.homeRuns,
      inning: e.inning.inning,
      isBottom: e.inning.isBottom,
      outs: e.inning.outs,
      balls: e.atBat.balls,
      strikes: e.atBat.strikes,
      runners: e.runners.map((l) => l !== null)
    });
    const s = e.inning.fieldingTeam === 0 ? e.awayTeam : e.homeTeam;
    for (let l = 0; l < this.fielders.length; l++) {
      const o = this.fielders[l], c = l === this.activeFielder;
      t.fillStyle = s.colors.primary, t.fillRect(o.x - 4, o.y - 6, 8, 10), t.fillStyle = s.colors.secondary, t.fillRect(o.x - 3, o.y - 9, 6, 4), c && (t.strokeStyle = "#fcfcfc", t.lineWidth = 1, t.strokeRect(o.x - 5, o.y - 10, 10, 16));
    }
    if (this.batterRunning) {
      const l = e.inning.battingTeam === 0 ? e.awayTeam : e.homeTeam;
      t.fillStyle = l.colors.primary, t.fillRect(this.batterPos.x - 4, this.batterPos.y - 6, 8, 10), t.fillStyle = l.colors.secondary, t.fillRect(this.batterPos.x - 3, this.batterPos.y - 9, 6, 4);
    }
    const r = e.inning.battingTeam === 0 ? e.awayTeam : e.homeTeam, n = [a.first, a.second, a.third];
    for (let l = 0; l < 3; l++)
      e.runners[l] && (t.fillStyle = r.colors.primary, t.fillRect(n[l].x - 3, n[l].y - 5, 6, 8));
    if (g(t, e.ball), this.resultText) {
      w(t, 88, 110, 80, 20);
      const l = this.resultText === "OUT!" ? "#e04040" : "#40c040";
      f(t, this.resultText, 128, 116, l, "center");
    }
  }
  exit() {
  }
}
class nt {
  constructor(t) {
    this.pitchType = t, this.swung = !1, this.swingTimer = 0, this.result = null, this.resultTimer = 0, this.resultDuration = 1, this.batContactY = 0;
  }
  enter(t) {
    this.swung = !1, this.result = null;
  }
  update(t, e) {
    const s = e.inning.battingTeam;
    if (e.ball.update(t), this.result) {
      this.resultTimer += t, this.resultTimer >= this.resultDuration && this.resolveResult(e);
      return;
    }
    this.swung ? this.swingTimer += t : (e.input.held(s, "up") && (this.batContactY = Math.min(1, this.batContactY + 2 * t)), e.input.held(s, "down") && (this.batContactY = Math.max(-1, this.batContactY - 2 * t)), e.input.pressed(s, "A") && (this.swung = !0, this.swingTimer = 0, this.evaluateSwing(e))), !this.result && e.ball.y >= h.plate.y && (this.swung || this.evaluateTake(e)), e.ball.y > 250 && !this.result && (this.result = "ball", this.resultTimer = 0);
  }
  evaluateSwing(t) {
    const e = t.ball, s = h.plate, n = (s.y - e.y) / 40;
    if (Math.abs(n) > 0.8) {
      this.result = "strike", this.resultTimer = 0;
      return;
    }
    if (Math.abs(e.x - s.x) > 20) {
      this.result = "strike", this.resultTimer = 0;
      return;
    }
    const o = t.inning.battingTeam === 0 ? t.awayTeam : t.homeTeam, c = t.inning.battingTeam === 0 ? t.awayBatterIndex : t.homeBatterIndex, u = L(o, c);
    this.result = tt(t.ball, {
      timing: Math.max(-1, Math.min(1, n)),
      contactY: this.batContactY,
      power: u.power,
      platePos: s
    }), this.resultTimer = 0, this.result !== "foul" && (this.resultDuration = 0.5);
  }
  evaluateTake(t) {
    const e = t.ball, s = h.zone, r = e.x >= s.x && e.x <= s.x + s.w, n = e.screenY >= s.y && e.screenY <= s.y + s.h;
    r && n ? this.result = "strike" : this.result = "ball", this.resultTimer = 0;
  }
  resolveResult(t) {
    switch (this.result) {
      case "strike": {
        t.atBat.addStrike() ? t.inning.recordOut() ? t.setPhase(new $()) : (this.advanceBatter(t), t.setPhase(new T())) : t.setPhase(new T());
        break;
      }
      case "ball": {
        t.atBat.addBall() ? (this.advanceRunners(t), this.putRunnerOnFirst(t), this.advanceBatter(t), t.setPhase(new T())) : t.setPhase(new T());
        break;
      }
      case "foul":
        t.atBat.addFoul(), t.setPhase(new T());
        break;
      case "ground":
      case "line":
      case "fly":
      case "popup":
        t.setPhase(new st(this.result));
        break;
    }
  }
  advanceBatter(t) {
    t.inning.battingTeam === 0 ? t.awayBatterIndex = (t.awayBatterIndex + 1) % t.awayTeam.roster.length : t.homeBatterIndex = (t.homeBatterIndex + 1) % t.homeTeam.roster.length, t.atBat.reset();
  }
  advanceRunners(t) {
    t.runners[0] && t.runners[1] && t.runners[2] && (t.inning.scoreRun(), t.runners[2] = null), t.runners[1] && (t.runners[2] = t.runners[1]), t.runners[0] && (t.runners[1] = t.runners[0]), t.runners[0] = null;
  }
  putRunnerOnFirst(t) {
    t.runners[0] = { name: "RUNNER" };
  }
  render(t, e) {
    F(t), M(t, {
      awayName: e.awayTeam.abbr,
      homeName: e.homeTeam.abbr,
      awayRuns: e.inning.awayRuns,
      homeRuns: e.inning.homeRuns,
      inning: e.inning.inning,
      isBottom: e.inning.isBottom,
      outs: e.inning.outs,
      balls: e.atBat.balls,
      strikes: e.atBat.strikes,
      runners: e.runners.map((u) => u !== null)
    });
    const s = e.inning.fieldingTeam === 0 ? e.awayTeam : e.homeTeam, r = h.mound.x, n = h.mound.y;
    t.fillStyle = s.colors.primary, t.fillRect(r - 5, n - 8, 10, 12), t.fillStyle = s.colors.secondary, t.fillRect(r - 4, n - 12, 8, 5), t.fillStyle = s.colors.secondary, t.fillRect(r + 3, n - 8, 4, 3);
    const l = e.inning.battingTeam === 0 ? e.awayTeam : e.homeTeam, o = h.batterR.x, c = h.batterR.y;
    if (t.fillStyle = l.colors.primary, t.fillRect(o - 5, c - 8, 10, 12), t.fillStyle = l.colors.secondary, t.fillRect(o - 4, c - 12, 8, 5), this.swung)
      t.fillStyle = "#c08040", t.fillRect(o - 8, c - 4, 12, 2);
    else {
      t.fillStyle = "#c08040", t.fillRect(o + 5, c - 10, 2, 12);
      const u = c - 4 + this.batContactY * -6;
      t.fillStyle = "#fcfcfc44", t.fillRect(o - 8, u - 1, 12, 2);
    }
    if (t.fillStyle = s.colors.primary, t.fillRect(h.catcher.x - 5, h.catcher.y - 4, 10, 8), g(t, e.ball), this.result) {
      const u = this.result.toUpperCase(), p = this.result === "ball" ? "#40c040" : this.result === "strike" ? "#e04040" : this.result === "foul" ? "#e0e040" : "#fcfcfc";
      w(t, 88, 110, 80, 20), f(t, u, 128, 116, p, "center");
    }
  }
  exit() {
  }
}
const m = ["fastball", "curve", "slider", "changeup"];
class T {
  constructor() {
    this.selectedPitch = 0, this.aimX = 0.5, this.thrown = !1, this.windupTimer = 0, this.windupDuration = 0.6;
  }
  enter(t) {
    this.selectedPitch = 0, this.aimX = 0.5, this.thrown = !1, this.windupTimer = 0, t.ball.reset();
  }
  update(t, e) {
    const s = e.inning.fieldingTeam;
    if (!this.thrown)
      e.input.pressed(s, "up") && (this.selectedPitch = (this.selectedPitch - 1 + m.length) % m.length), e.input.pressed(s, "down") && (this.selectedPitch = (this.selectedPitch + 1) % m.length), e.input.held(s, "left") && (this.aimX = Math.max(0, this.aimX - 1.5 * t)), e.input.held(s, "right") && (this.aimX = Math.min(1, this.aimX + 1.5 * t)), e.input.pressed(s, "A") && (this.thrown = !0, this.windupTimer = 0);
    else if (this.windupTimer += t, this.windupTimer >= this.windupDuration) {
      const r = m[this.selectedPitch];
      Q(e.ball, r, this.aimX, h.mound, h.plate), e.setPhase(new nt(r));
    }
  }
  render(t, e) {
    F(t);
    const s = e.inning.fieldingTeam === 0 ? e.awayTeam : e.homeTeam, r = e.inning.battingTeam === 0 ? e.awayTeam : e.homeTeam;
    M(t, {
      awayName: e.awayTeam.abbr,
      homeName: e.homeTeam.abbr,
      awayRuns: e.inning.awayRuns,
      homeRuns: e.inning.homeRuns,
      inning: e.inning.inning,
      isBottom: e.inning.isBottom,
      outs: e.inning.outs,
      balls: e.atBat.balls,
      strikes: e.atBat.strikes,
      runners: e.runners.map((d) => d !== null)
    });
    const n = h.mound.x, l = h.mound.y;
    if (t.fillStyle = s.colors.primary, t.fillRect(n - 5, l - 8, 10, 12), t.fillStyle = s.colors.secondary, t.fillRect(n - 4, l - 12, 8, 5), this.thrown && this.windupTimer < this.windupDuration) {
      const d = this.windupTimer / this.windupDuration, b = l - 12 - Math.sin(d * Math.PI) * 6;
      t.fillStyle = s.colors.secondary, t.fillRect(n + 3, b, 4, 3);
    }
    const o = e.inning.battingTeam === 0 ? e.awayBatterIndex : e.homeBatterIndex, c = L(r, o), u = h.batterR.x, p = h.batterR.y;
    if (t.fillStyle = r.colors.primary, t.fillRect(u - 5, p - 8, 10, 12), t.fillStyle = r.colors.secondary, t.fillRect(u - 4, p - 12, 8, 5), t.fillStyle = "#c08040", t.fillRect(u + 5, p - 10, 2, 12), t.fillStyle = s.colors.primary, t.fillRect(h.catcher.x - 5, h.catcher.y - 4, 10, 8), !this.thrown) {
      w(t, 200, 60, 52, 50);
      for (let R = 0; R < m.length; R++) {
        const A = N[m[R]].name, D = R === this.selectedPitch;
        f(t, D ? `>${A}` : ` ${A}`, 204, 64 + R * 10, D ? "#fcfcfc" : "#808080");
      }
      const d = h.zone;
      t.strokeStyle = "#fcfcfc44", t.lineWidth = 1, t.strokeRect(d.x, d.y, d.w, d.h);
      const b = d.x + this.aimX * d.w, E = d.y + d.h / 2;
      t.fillStyle = "#fcfcfc", t.fillRect(b - 1, E - 4, 2, 8), t.fillRect(b - 4, E - 1, 8, 2);
    }
    f(t, c.name, 128, 230, "#fcfcfc", "center");
  }
  exit() {
  }
}
class rt {
  constructor() {
    this.inning = 1, this.isBottom = !1, this.outs = 0, this.awayRuns = [], this.homeRuns = [], this.totalInnings = 9;
  }
  reset() {
    this.inning = 1, this.isBottom = !1, this.outs = 0, this.awayRuns = [0], this.homeRuns = [0];
  }
  /** Record an out. Returns true if the half-inning is over (3 outs). */
  recordOut() {
    return this.outs++, this.outs >= 3;
  }
  /** Score a run for the batting team. */
  scoreRun() {
    const t = this.isBottom ? this.homeRuns : this.awayRuns;
    t[t.length - 1]++;
  }
  /** Advance to the next half-inning. Returns true if the game is over. */
  nextHalf() {
    if (this.outs = 0, this.isBottom) {
      const t = this.awayTotal, e = this.homeTotal;
      if (this.inning >= this.totalInnings && e > t || (this.inning++, this.isBottom = !1, this.awayRuns.push(0), this.inning > this.totalInnings && t !== e))
        return !0;
    } else if (this.isBottom = !0, this.homeRuns.push(0), this.inning >= this.totalInnings && this.homeTotal > this.awayTotal)
      return !0;
    return !1;
  }
  get awayTotal() {
    return this.awayRuns.reduce((t, e) => t + e, 0);
  }
  get homeTotal() {
    return this.homeRuns.reduce((t, e) => t + e, 0);
  }
  /** Which team is currently batting? 0 = away, 1 = home. */
  get battingTeam() {
    return this.isBottom ? 1 : 0;
  }
  /** Which team is currently fielding? */
  get fieldingTeam() {
    return this.isBottom ? 0 : 1;
  }
}
class lt {
  constructor() {
    this.balls = 0, this.strikes = 0, this.batterIndex = 0;
  }
  reset() {
    this.balls = 0, this.strikes = 0;
  }
  /** Record a ball. Returns true if walk (4 balls). */
  addBall() {
    return this.balls++, this.balls >= 4;
  }
  /** Record a strike. Returns true if strikeout (3 strikes). */
  addStrike() {
    return this.strikes++, this.strikes >= 3;
  }
  /** Record a foul ball. Adds a strike if count < 2 strikes. */
  addFoul() {
    this.strikes < 2 && this.strikes++;
  }
  /** Advance to next batter. */
  nextBatter(t = 9) {
    this.balls = 0, this.strikes = 0, this.batterIndex = (this.batterIndex + 1) % t;
  }
}
class X {
  constructor() {
    this.blinkTimer = 0, this.showText = !0;
  }
  enter(t) {
    this.blinkTimer = 0, this.showText = !0;
  }
  update(t, e) {
    this.blinkTimer += t, this.blinkTimer > 0.5 && (this.blinkTimer = 0, this.showText = !this.showText), e.input && (e.input.pressed(0, "start") || e.input.pressed(1, "start")) && this.startGame(e);
  }
  render(t) {
    t.fillStyle = "#0f0f23", t.fillRect(0, 0, 256, 240), f(t, "BASEBALL", 128, 60, "#fcfcfc", "center"), f(t, "STARS", 128, 76, "#e04040", "center"), f(t, "COMMONS EDITION", 128, 100, "#808080", "center"), this.showText && f(t, "PRESS START", 128, 150, "#fcfcfc", "center"), f(t, "P1: WASD + J/K", 128, 200, "#606060", "center"), f(t, "P2: ARROWS + NUM1/2", 128, 212, "#606060", "center");
  }
  exit() {
  }
  startGame(t) {
    t.inning = new rt(), t.inning.reset(), t.atBat = new lt(), t.ball = new j(), t.awayTeam = O[0], t.homeTeam = O[1], t.awayOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8], t.homeOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8], t.awayBatterIndex = 0, t.homeBatterIndex = 0, t.runners = [null, null, null], t.setPhase(new T());
  }
}
function ot(i, { fit: t = "window", keyTarget: e = window } = {}) {
  const s = new W(i, { fit: t });
  return s.addInputSource(new _(e)), s.setPhase(new X()), s.start(), s;
}
export {
  W as Game,
  Y as InputManager,
  _ as KeyboardAdapter,
  X as TitlePhase,
  ot as mount
};
