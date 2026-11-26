// Linden Row (lab clip 16): a 20 s test of a new style. Flat paper cut-out characters stand in a lit 3D street, and the
// camera travels it in one continuous shot. On the story's turn ("Every morning") the light turns from night to a low
// sun: long shadows, blue shade, haze. Our own story and cast; from the references we borrow only the grammar: a strange
// premise first, a clue in every line, a travelling camera with no cuts, light that changes when the story turns, one
// feeling per face per line, figures dead still once they land, one-word captions.
// The story's root cause (for the full film): a new street-sweeping machine that collects whatever is left outside,
// washes it, and leaves it at the nearest door. It arrived the same week as the man with the mole, so he got the blame.
// Its amber light is already blinking at the end of the street in the first frame.
import { stage, canvasTex, seeded, envGradient, THREE } from 'stage3d';
import { kettleWoman, girl, dog, paperMan, moleMan, paper } from './chars.js';

const { W, H } = window.C;
C.fonts = ['700 118px Fredoka'];
const DUR = C.DUR;

// ------------------------------------------------------------------ the narration's clock
const VO = window.VO || [], WORDS = window.WORDS || [];
const EST = { l01: [0.12, 2.6], l02: [2.9, 5.6], l03: [5.9, 8.6], l04: [8.9, 10.5], l05: [10.8, 13.4], l06: [13.7, 15.6], l07: [15.9, 18.8] };   // until the voice is in
const ln = (id) => VO.find((v) => v.id === id) || { t0: EST[id][0], t1: EST[id][1] };
const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const word = (id, w, frac) => { const x = WORDS.find((q) => q.p === id && norm(q.w) === w); return x ? x.t0 : T0(id) + (T1(id) - T0(id)) * frac; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = (k) => k * k * (3 - 2 * k);
const DAWN0 = T0('l03') - 0.7, DAWN1 = DAWN0 + 1.6;               // the light turns on the story's turn (a beat early: it fills the dark of the turn, which flashed)
const BLAME = word('l05', 'blames', 0.3), PAST = word('l06', 'past', 0.85);

// a smooth, monotone curve through (xs, ys) (Fritsch-Carlson); it comes to rest at the last point
function monotone(xs, ys) {
  const n = xs.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m.push(d[0]); for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(0);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return (x) => { let i = 0; while (i < n - 2 && x > xs[i + 1]) i++; const h = xs[i + 1] - xs[i], u = clamp((x - xs[i]) / h), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1]; };
}

// ------------------------------------------------------------------ the street: houses 1, 3, 5... on the right, 2, 4, 6... on the left
// x across the street (road |x| < 3.5, pavements to |x| = 6, house fronts at |x| = 6), z down it (the cross street at z -41)
const PAL = ['#c4705b', '#e5d6b4', '#9db497', '#a9c1d4', '#d89a6a', '#efe6d6', '#b6a2c6', '#d6c070', '#c98f8f', '#b9c9a6'];
const DOORS = ['#2f4a7a', '#a8323a', '#2f6b4f', '#d9a531', '#1f2a33', '#6d3f7a', '#3c7c8c'];
const HW = 5;                                                                  // each house 5 m along the street
const HOUSE = (side, i) => ({ n: side > 0 ? 2 * i + 1 : 2 * i + 2, zc: -3.5 - HW * i, door: -3.5 - HW * i + 1.1 });

let st, cam, sun, hemi, skyMat, capG, ENV, clouds = [], lamps = [], lanterns = [], panes = [], beacon, glow, beam, trail, NIGHT = [], MORNING = [], CARDS = [];
const look = new THREE.Vector3();

function build(root) {
  st = stage(root, { bg: 0x101a36, fog: { color: 0x101a36, density: 0.02 }, fov: 60, exposure: 1.1, bloom: { strength: 0.42, radius: 0.5, threshold: 0.9 }, finish: true });
  const { renderer, scene, camera } = st;
  cam = camera;
  ENV = envGradient(renderer, '#9cc3f2', '#e9c9a0', [[0.36, 0.46, 0.07, '#fff3d6']]);   // a morning sky, only for wet things to reflect
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const add = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; scene.add(m); return m; };
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, ...o });
  const box = (w, h, d, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return add(m, cast); };

  // textures painted in code: brick, slabs, asphalt, roof tiles
  const brick = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9c4bd'; for (let r = 0; r < 8; r++) { g.fillRect(0, r * 32, w, 3); for (let c = 0; c < 4; c++) g.fillRect(((c + (r % 2) * 0.5) * 64) % w, r * 32, 3, 32); }
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${0.02 + 0.04 * ((k * 37) % 7) / 7})`; g.fillRect((k * 97) % w, (k * 61) % h, 3, 2); }
  }, { repeat: true }); brick.repeat.set(4, 6);
  const slab = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e6e3dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#bdb8ae'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(0, 128, w, 2); g.fillRect(128, 0, 2, h); }, { repeat: true });
  slab.repeat.set(2, 40);
  const R = seeded(16);
  const tar = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5c5f66'; g.fillRect(0, 0, w, h); for (let k = 0; k < 5000; k++) { const v = R() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${0.025 + 0.03 * R()})`; g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2.5); } }, { repeat: true });
  tar.repeat.set(4, 40);
  const tiles = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#5a5e68'; g.fillRect(0, 0, w, h); g.fillStyle = '#474a53'; for (let r = 0; r < 8; r++) g.fillRect(0, r * 16, w, 2); }, { repeat: true });
  tiles.repeat.set(6, 3);

  // ground: the road, two pavements with kerbs, and the cross street at the end
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 80), std('#ffffff', { map: tar, roughness: 0.92 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -25); add(road, false);
  const cross = new THREE.Mesh(new THREE.PlaneGeometry(60, 10), std('#ffffff', { map: tar, roughness: 0.92 })); cross.rotation.x = -Math.PI / 2; cross.position.set(0, 0.002, -41); add(cross, false);
  for (const s of [-1, 1]) {
    box(2.5, 0.15, 52, std('#ffffff', { map: slab }), s * 4.75, 0.075, -11, false);
    box(0.16, 0.16, 52, std('#cfcac0'), s * 3.55, 0.08, -11, false);
  }
  trail = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 31), new THREE.MeshStandardMaterial({ color: '#1d2129', roughness: 0.06, metalness: 0.2, envMap: ENV, envMapIntensity: 0.9, transparent: true, opacity: 0 }));
  trail.rotation.x = -Math.PI / 2; trail.position.set(2.9, 0.004, -22.5); scene.add(trail); trail.receiveShadow = true;   // the sweeper's wet track, by morning

  // the houses: a terrace on each side, each its own colour, door and number
  const paneLit = new THREE.MeshStandardMaterial({ color: '#2a3447', roughness: 0.12, metalness: 0.5, emissive: '#ffbf74', emissiveIntensity: 0.65 });
  const paneDark = new THREE.MeshStandardMaterial({ color: '#232c3c', roughness: 0.12, metalness: 0.5 });
  panes.push(paneLit);
  const white = std('#f3efe6'), slate = std('#ffffff', { map: tiles }), pot = std('#b4643f');
  const numTex = (n) => canvasTex(128, 96, (g, w, h) => { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.font = '700 72px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), w / 2, h / 2 + 4); });
  for (const side of [1, -1]) for (let i = 0; i < 7; i++) {
    const { n, zc, door } = HOUSE(side, i), col = PAL[(i * 3 + (side > 0 ? 0 : 5)) % PAL.length], fx = side * 6;
    const face = side > 0 ? -Math.PI / 2 : Math.PI / 2;                          // a plane facing the street
    box(9, 7.2, HW, std(col, { map: brick }), side * 10.5, 3.6, zc);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(9.4, 0), new THREE.Vector2(4.7, 2.7)]), { depth: HW + 0.02, bevelEnabled: false }), slate);
    roof.position.set(side > 0 ? 5.8 : -15.2, 7.2, zc - HW / 2 - 0.01); add(roof);
    box(0.7, 1.5, 1.0, std(col, { map: brick }), side * 10.5, 8.9, zc - 2.0);   // chimney and pots
    for (const dz of [-0.2, 0.2]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.4, 10), pot); c.position.set(side * 10.5, 9.85, zc - 2.0 + dz); add(c); }
    box(0.08, 7.0, 0.08, std('#3a3d44'), fx - side * 0.06, 3.5, zc - HW / 2 + 0.04);   // the drainpipe between houses
    box(0.1, 0.18, HW, white, fx - side * 0.05, 3.3, zc);                         // a string course
    // the door, its step, its number
    box(0.14, 2.2, 1.12, white, fx - side * 0.03, 1.25, door);
    box(0.12, 2.05, 0.96, std(DOORS[(i + (side > 0 ? 2 : 5)) % DOORS.length], { roughness: 0.5 }), fx - side * 0.08, 1.2, door);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), std('#c9a04b', { metalness: 0.8, roughness: 0.3 })); knob.position.set(fx - side * 0.16, 1.15, door + 0.32); add(knob);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.25), new THREE.MeshStandardMaterial({ map: numTex(n), roughness: 0.6 }));
    plate.position.set(fx - side * 0.15, 2.0, door); plate.rotation.y = face; add(plate, false);
    box(0.8, 0.25, 1.6, std('#d9d4ca'), fx - side * 0.4, 0.275, door);
    // windows: one by the door, two upstairs; most are lit at night
    for (const [wz, wy, ww, wh] of [[zc - 1.1, 1.65, 1.3, 1.5], [zc + 1.1, 4.6, 1.1, 1.4], [zc - 1.1, 4.6, 1.1, 1.4]]) {
      box(0.12, wh + 0.2, ww + 0.2, white, fx - side * 0.02, wy, wz, false);
      const lit = ((n * 7 + Math.round(wy)) % 5) !== 0;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), lit ? paneLit : paneDark); p.position.set(fx - side * 0.09, wy, wz); p.rotation.y = face; add(p, false, false);
      box(0.08, 0.06, ww, white, fx - side * 0.1, wy, wz, false);                  // the glazing bar
      box(0.3, 0.07, ww + 0.3, white, fx - side * 0.15, wy - wh / 2 - 0.1, wz);   // the sill
    }
  }
  // the corners where the street begins (no numbers: their sides face the next street)
  for (const side of [1, -1]) {
    box(9, 7.2, 10, std(PAL[side > 0 ? 7 : 2], { map: brick }), side * 10.5, 3.6, 3);
    for (const wz of [0.6, 4.2]) for (const wy of [1.65, 4.6]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.4), (wz + wy) % 2 > 1 ? paneLit : paneDark); p.position.set(side * 5.94, wy, wz); p.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; add(p, false, false); }
  }
  // the end of the street: a terrace facing us across the cross street
  for (let k = -3; k <= 3; k++) {
    box(6, 7.2, 8, std(PAL[(k + 9) % PAL.length], { map: brick }), k * 6, 3.6, -50);
    const rf = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(8.4, 0), new THREE.Vector2(4.2, 2.6)]), { depth: 6.02, bevelEnabled: false }), slate);
    rf.rotation.y = Math.PI / 2; rf.position.set(k * 6 - 3.01, 7.2, -45.8); add(rf);
    box(0.12, 2.1, 1.0, std(DOORS[(k + 9) % DOORS.length], { roughness: 0.5 }), k * 6 + (k % 2 ? 1.9 : -1.9), 1.05, -45.95);
    for (const wx of [-1.4, 1.4]) for (const wy of [1.7, 4.6]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), ((k + wx + wy) | 0) % 3 ? paneLit : paneDark); p.position.set(k * 6 + wx, wy, -45.94); add(p, false, false); }
  }
  // street furniture: lamps, bins, pots, the name plate
  const green = std('#24392e', { roughness: 0.5 });
  for (const [x, z] of [[-4.3, 0.5], [4.3, -6.0], [-4.3, -15.5], [4.3, -25.5], [-4.3, -33.5]]) {
    box(0.12, 4.3, 0.12, green, x, 2.3, z);
    box(0.5, 0.12, 0.5, green, x, 4.5, z);
    const lm = new THREE.MeshStandardMaterial({ color: '#fff1d6', emissive: '#ffcf8f', emissiveIntensity: 6 }); lanterns.push(lm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.32), lm); head.position.set(x, 4.25, z); add(head, false, false);
    const pl = new THREE.PointLight('#ffb56b', 13, 0, 2); pl.position.set(x, 4.05, z); scene.add(pl); lamps.push(pl);
  }
  for (const [x, z, c] of [[-5.5, -6.0, '#2f5f3a'], [5.5, -15.9, '#3b4a5e'], [-5.4, -27.4, '#2f5f3a']]) box(0.62, 1.05, 0.7, std(c, { roughness: 0.6 }), x, 0.67, z);
  for (const [x, z] of [[5.5, -0.9], [-5.5, -20.6], [5.5, -26.9]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.38, 14), pot); c.position.set(x, 0.34, z); add(c);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), std('#4f7d43')); b.position.set(x, 0.75, z); add(b);
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), new THREE.MeshStandardMaterial({ map: canvasTex(512, 144, (g, w, h) => {
    g.fillStyle = '#f7f3ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1b1b1b'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#1b1b1b'; g.font = '700 84px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LINDEN ROW', w / 2, h / 2 + 4);
  }), roughness: 0.6 }));
  sign.position.set(-3.95, 0.9, 1.3); sign.rotation.y = 0.12; add(sign);
  for (const dx of [-0.62, 0.62]) box(0.06, 0.75, 0.06, std('#1f2328'), -3.95 + dx * 0.99, 0.45, 1.3 - dx * 0.12);

  // the things that go missing: a bike, a kettle, a dog's ball. At night where they were left; by morning on a doorstep, wet
  const bike = (wet) => {
    const wm = wet ? { envMap: ENV, envMapIntensity: 0.8 } : {};
    const g = new THREE.Group(), frameM = std('#c23b30', { roughness: wet ? 0.12 : 0.45, metalness: 0.3, ...wm }), tyre = std('#1d1f22', { roughness: wet ? 0.2 : 0.8, ...wm });
    for (const z of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 8, 28), tyre); w.position.set(0, 0.36, z); w.rotation.y = Math.PI / 2; g.add(w); }
    const tube = (a, b, r = 0.025) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 8), frameM); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); g.add(m); };
    tube([0, 0.36, -0.55], [0, 0.42, 0.0]); tube([0, 0.42, 0.0], [0, 0.78, -0.12]); tube([0, 0.78, -0.12], [0, 0.82, 0.42]); tube([0, 0.82, 0.42], [0, 0.36, 0.55]);
    tube([0, 0.42, 0.0], [0, 0.82, 0.42]); tube([0, 0.36, -0.55], [0, 0.78, -0.12]); tube([0, 0.82, 0.42], [0, 1.0, 0.5]); tube([-0.26, 1.0, 0.5], [0.26, 1.0, 0.5], 0.02);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.24), std('#202225')); seat.position.set(0, 0.84, -0.16); g.add(seat);
    g.traverse((o) => { o.castShadow = true; });
    return g;
  };
  const kettle = (wet) => {
    const g = new THREE.Group(), m = std('#efe8d8', { roughness: wet ? 0.1 : 0.35, metalness: 0.4, ...(wet ? { envMap: ENV, envMapIntensity: 0.9 } : {}) });
    const body = new THREE.Mesh(new THREE.LatheGeometry([0, 0.11, 0.125, 0.12, 0.09, 0.03, 0].map((r, k) => new THREE.Vector2(r, [0, 0, 0.05, 0.13, 0.19, 0.22, 0.23][k])), 20), m); g.add(body);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.15, 8), m); sp.position.set(0.13, 0.12, 0); sp.rotation.z = -0.9; g.add(sp);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 6, 16, Math.PI), std('#2a2a2a')); hd.position.set(0, 0.22, 0); g.add(hd);
    g.traverse((o) => { o.castShadow = true; });
    return g;
  };
  const ballTex = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#d4e157'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4f7e6'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= w; x += 4) g.lineTo(x, h / 2 + Math.sin(x / w * Math.PI * 4) * 14); g.stroke(); });
  const ball = (wet) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), std('#ffffff', { map: ballTex, roughness: wet ? 0.2 : 0.7, ...(wet ? { envMap: ENV, envMapIntensity: 0.7 } : {}) })); m.castShadow = true; return m; };
  const puddle = (x, y, z, r) => { const p = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshStandardMaterial({ color: '#2a3038', roughness: 0.04, metalness: 0.3, envMap: ENV, envMapIntensity: 1.0, transparent: true, opacity: 0.6 })); p.rotation.x = -Math.PI / 2; p.position.set(x, y + 0.004, z); p.receiveShadow = true; return p; };
  const put = (list, o) => { scene.add(o); list.push(o); return o; };
  { const b = put(NIGHT, bike(false)); b.position.set(5.62, 0.15, -0.3); b.rotation.z = 0.12; }                 // against the corner wall
  { const k = put(NIGHT, kettle(false)); k.position.set(5.8, 0.835, -4.35); }                                   // on number 1's sill
  { const b = put(NIGHT, ball(false)); b.position.set(5.55, 0.51, -7.0); }                                     // on number 3's step
  { const b = put(MORNING, bike(true)); b.position.set(-5.62, 0.15, -9.0); b.rotation.z = -0.12; put(MORNING, puddle(-5.4, 0.15, -9.0, 0.5)); }      // at number 4's door
  { const k = put(MORNING, kettle(true)); k.position.set(-5.6, 0.4, -13.0); put(MORNING, puddle(-5.6, 0.4, -13.0, 0.2)); }                           // number 6's step: not hers
  { const b = put(MORNING, ball(true)); b.position.set(-5.55, 0.51, -17.0); put(MORNING, puddle(-5.55, 0.4, -17.0, 0.16)); }                         // number 8

  // the sweeper, parked at the end of the street; its amber light blinks from the first frame
  {
    const g = new THREE.Group(), body = std('#35544b', { roughness: 0.55 }), dark = std('#22262c', { roughness: 0.7 });
    const b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); };
    b(3.8, 1.3, 1.9, body, 0, 1.0, 0); b(1.3, 1.1, 1.8, body, 1.4, 2.2, 0); b(0.05, 0.7, 1.5, dark, 2.06, 2.3, 0); b(1.0, 0.7, 0.05, dark, 1.4, 2.3, 0.92);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.0, 20), std('#c9cfd6', { roughness: 0.35, metalness: 0.5 })); tank.rotation.z = Math.PI / 2; tank.position.set(-0.8, 2.25, 0); tank.castShadow = true; g.add(tank);
    for (const x of [-1.3, 1.2]) for (const z of [-0.95, 0.95]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 18), dark); w.rotation.x = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); }
    for (const z of [-0.75, 0.75]) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20), std('#3b3530', { roughness: 0.95 })); br.position.set(2.05, 0.08, z); g.add(br); }
    beacon = new THREE.MeshStandardMaterial({ color: '#ffb347', emissive: '#ff9a1a', emissiveIntensity: 6 });
    const bc = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), beacon); bc.position.set(1.4, 2.95, 0); g.add(bc);
    glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (q, w, h) => { const r = q.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,190,90,1)'); r.addColorStop(0.25, 'rgba(255,150,40,0.45)'); r.addColorStop(1, 'rgba(255,120,20,0)'); q.fillStyle = r; q.fillRect(0, 0, w, h); }), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    glow.scale.set(1.6, 1.6, 1); glow.position.set(1.4, 2.95, 0); g.add(glow);
    beam = new THREE.PointLight('#ff9a2a', 0, 14, 2); beam.position.set(1.4, 3.1, 0); g.add(beam);   // its amber pulse on the walls
    b(3.82, 0.12, 1.92, std('#e9e4d8'), 0, 1.3, 0);                               // a pale band
    g.position.set(0.8, 0, -40.5); g.rotation.y = 0.18; scene.add(g);
  }

  // the cast: paper cards standing in the street. They appear with the morning, popping up like a pop-up book
  const card = (canvases, h, x, y, z, side, pop) => {
    const texs = canvases.map((c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; });
    const asp = canvases[0].width / canvases[0].height;
    const geo = new THREE.PlaneGeometry(h * asp, h); geo.translate(0, h / 2, 0);   // pivot at the feet
    const mat = new THREE.MeshStandardMaterial({ map: texs[0], alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, emissive: '#ffffff', emissiveMap: texs[0], emissiveIntensity: 0.22 });
    const m = new THREE.Mesh(geo, mat); m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: texs[0], alphaTest: 0.5 });
    const pivot = new THREE.Group(); pivot.position.set(x, y, z); pivot.add(m); scene.add(pivot);
    const C1 = { pivot, m, mat, texs, side, pop, show: (i) => { mat.map = mat.emissiveMap = texs[i]; m.customDepthMaterial.map = texs[i]; } };
    CARDS.push(C1); return C1;
  };
  const P = DAWN0 + 0.5;
  card([kettleWoman()], 1.62, -4.72, 0.15, -11.3, -1, P + 0.15);                    // number 6: the kettle on her step isn't hers
  card([girl()], 1.25, -4.7, 0.15, -17.8, -1, P);                                   // number 8, and her dog
  card([dog()], 0.55, -4.55, 0.15, -17.0, -1, P + 0.08);
  card([paperMan(false), paperMan(true)], 1.76, -4.78, 0.15, -22.6, -1, P + 0.3).swap = BLAME;   // number 10, across from 9
  card([moleMan(false), moleMan(true)], 1.8, 5.5, 0.4, -22.4, 1, P + 0.4).swap = PAST;          // number 9

  // light: a hemisphere for sky and ground, one directional light (the moon, then the sun) with soft shadows
  hemi = new THREE.HemisphereLight('#4058a0', '#0c0f1c', 0.55); scene.add(hemi);
  sun = new THREE.DirectionalLight('#9db4ff', 0.3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 140 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.04;
  scene.add(sun); scene.add(sun.target);

  // the sky: a gradient dome with a soft sun (or moon) disc; it follows the camera
  skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uDir: { value: new THREE.Vector3() }, uCol: { value: new THREE.Color() }, uAmt: { value: 0 }, uDisc: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uTop, uHor, uDir, uCol; uniform float uAmt, uDisc; varying vec3 vD;
      void main(){ float h = clamp(vD.y, 0.0, 1.0); vec3 c = mix(uHor, uTop, pow(h, 0.55)); float s = max(dot(normalize(vD), normalize(uDir)), 0.0);
        c += uCol * (smoothstep(0.9993, 0.99965, s) * uDisc + pow(s, 24.0) * 0.4 * uAmt + pow(s, 5.0) * 0.07 * uAmt); gl_FragColor = vec4(c, 1.0); }` });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), skyMat); sky.frustumCulled = false; sky.renderOrder = -1; scene.add(sky); st.sky = sky;

  // paper clouds, cut out like the cast, hung far off over the end of the street
  for (const [x, y, z, w, sd] of [[-22, 24, -105, 18, 3], [14, 30, -120, 22, 4], [34, 20, -100, 14, 5], [-4, 36, -130, 16, 6]]) {
    const c = paper(512, 256, (g) => { const r = seeded(sd); for (let k = 0; k < 7; k++) { g.fillStyle = '#e4eaf2'; g.beginPath(); g.arc(90 + k * 55 + r() * 20, 150 - Math.sin(k / 6 * Math.PI) * 55 + r() * 15, 48 + r() * 30, 0, Math.PI * 2); g.fill(); } g.fillRect(70, 150, 380, 60); }, sd, 10);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({ map: tx, alphaTest: 0.5, fog: false }));
    m.position.set(x, y, z); scene.add(m); clouds.push(m);
  }
  capG = C.canvas(root);                                                         // the one-word captions, over the 3D frame
}

// ------------------------------------------------------------------ the camera: one travelling shot, no cuts
const KEYS = () => [
  [0, [-4.0, 1.3, 5.6], [-2.6, 1.2, -12]],                                       // the name plate, the street beyond it, night
  [T0('l02'), [-0.4, 1.35, 3.0], [5.4, 0.7, -0.8]],                              // a bike, left against the corner wall
  [word('l02', 'ball', 0.8), [0.4, 1.3, -1.6], [5.4, 0.7, -7.0]],               // a kettle on a sill, a ball on a step
  [T0('l03') + 0.5, [-1.4, 1.15, -5.2], [-5.3, 0.8, -9.2]],                      // morning: the bike, washed, at number 4's door
  [T1('l03') - 0.1, [-1.2, 1.15, -7.6], [-5.2, 0.85, -11.6]],
  [T0('l04') + 0.15, [-1.1, 1.15, -8.6], [-5.0, 0.9, -12.6]],                    // the kettle at number 6: not hers
  [T1('l04') + 0.1, [-1.0, 1.2, -10.2], [-5.0, 0.95, -13.0]],
  [T0('l05') + 0.2, [-0.9, 1.25, -12.4], [-4.8, 1.0, -17.2]],                    // the street, cross: the girl, her dog, the man at 10
  [word('l05', 'new', 0.5), [-0.6, 1.3, -13.6], [-4.8, 1.05, -19.4]],
  [word('l05', 'nine', 0.95) + 0.1, [1.0, 1.5, -17.6], [5.3, 1.35, -22.3]],     // number nine
  [word('l06', 'mole', 0.5), [3.75, 1.66, -20.95], [5.45, 1.72, -22.4]],        // the man with the mole, close
  [T0('l07'), [3.6, 1.68, -21.2], [5.4, 1.7, -22.45]],
  [word('l07', 'same', 0.55), [2.2, 1.6, -23.0], [0.9, 1.3, -40]],              // the same week as... the end of the street
  [DUR, [1.4, 1.35, -31.0], [0.8, 1.35, -40.5]],
];
let PATH = null;
function path() {
  const K = KEYS(), ts = K.map((k) => k[0]), us = K.map((_, i) => i / (K.length - 1));
  const curve = (i) => new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k[i])), false, 'centripetal');
  return { pos: curve(1), tgt: curve(2), u: monotone(ts, us) };
}

// ------------------------------------------------------------------ the one-word captions
function captions(g, t) {
  let cur = null;
  for (let i = 0; i < WORDS.length; i++) { const w = WORDS[i], nx = WORDS[i + 1], end = nx ? Math.min(nx.t0, w.t1 + 0.35) : w.t1 + 0.6; if (t >= w.t0 - 0.02 && t < end) cur = w; }
  if (!cur) return;
  const k = 1 + 0.12 * (1 - ss(seg(t, cur.t0 - 0.02, cur.t0 + 0.08)));
  g.save(); g.translate(540, 1330); g.scale(k, k);
  g.font = '700 118px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.lineWidth = 20; g.strokeStyle = 'rgba(16,20,38,0.9)'; g.strokeText(cur.w, 0, 0); g.fillStyle = '#fff8ec'; g.fillText(cur.w, 0, 0);
  g.restore();
}

// ------------------------------------------------------------------ one frame
const NIGHTL = { top: '#0b1430', hor: '#22305a', fog: '#141d3d', dens: 0.02, hs: '#4058a0', hg: '#0c0f1c', hi: 0.72, sc: '#9db4ff', si: 0.32, dir: [0.45, 0.85, 0.28], exp: 1.15 };
const MORNL = { top: '#6fa7ef', hor: '#ffd6a0', fog: '#efd2ad', dens: 0.016, hs: '#a7cbff', hg: '#b38c6a', hi: 1.2, sc: '#ffcf9a', si: 3.6, dir: [-0.55, 0.22, -0.8], exp: 1.18 };   // brighter than the lit night, so the turn is one rise
const cA = new THREE.Color(), cB = new THREE.Color(), dA = new THREE.Vector3(), dB = new THREE.Vector3(), tmp = new THREE.Vector3();
const mixC = (target, a, b, k) => target.copy(cA.set(a)).lerp(cB.set(b), k);

function frame(t) {
  if (!PATH) PATH = path();
  const k = ss(seg(t, DAWN0, DAWN1)), u = PATH.u(t);
  cam.position.copy(PATH.pos.getPoint(u)); look.copy(PATH.tgt.getPoint(u)); cam.lookAt(look);
  st.sky.position.copy(cam.position);

  // the light, night to morning
  const N = NIGHTL, M = MORNL, scene = st.scene;
  mixC(scene.fog.color, N.fog, M.fog, k); scene.fog.density = N.dens + (M.dens - N.dens) * k; scene.background.copy(scene.fog.color);
  mixC(hemi.color, N.hs, M.hs, k); mixC(hemi.groundColor, N.hg, M.hg, k); hemi.intensity = N.hi + (M.hi - N.hi) * k;
  mixC(sun.color, N.sc, M.sc, k); sun.intensity = N.si + (M.si - N.si) * k;
  dA.set(...N.dir).normalize(); dB.set(...M.dir).normalize(); const L = dA.lerp(dB, k).normalize();
  const centre = tmp.copy(look).sub(cam.position).setY(0).normalize().multiplyScalar(7).add(cam.position).setY(0);
  sun.target.position.copy(centre); sun.position.copy(centre).addScaledVector(L, 60); sun.target.updateMatrixWorld();
  mixC(skyMat.uniforms.uTop.value, N.top, M.top, k); mixC(skyMat.uniforms.uHor.value, N.hor, M.hor, k);
  skyMat.uniforms.uDir.value.copy(L); mixC(skyMat.uniforms.uCol.value, '#c8d6ff', '#ffe2b0', k);
  skyMat.uniforms.uAmt.value = 0.25 + 0.75 * k; skyMat.uniforms.uDisc.value = 1.2 + 4 * k;
  for (const p of lamps) p.intensity = 13 * (1 - k);
  for (const m of lanterns) m.emissiveIntensity = 0.25 + 3.25 * (1 - k);   // dimmer than they could be: passing close, they flashed the frame
  for (const m of panes) m.emissiveIntensity = 0.65 * (1 - k) + 0.05;
  const blink = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 0.9), 3);
  beacon.emissiveIntensity = 6 * blink; glow.material.opacity = blink; beam.intensity = 14 * blink;
  trail.material.opacity = 0.6 * k;
  for (const c of clouds) mixC(c.material.color, '#3a4670', '#ffffff', k);
  st.renderer.toneMappingExposure = N.exp + (M.exp - N.exp) * k;
  for (const o of NIGHT) o.visible = k < 0.5;
  for (const o of MORNING) o.visible = k >= 0.5;

  // the cast: each card turns most of the way to the camera; it pops up with the morning and is still once it lands
  for (const c of CARDS) {
    const up = ss(seg(t, c.pop, c.pop + 0.35));
    c.pivot.visible = up > 0;
    const base = c.side > 0 ? -Math.PI / 2 : Math.PI / 2, dx = cam.position.x - c.pivot.position.x, dz = cam.position.z - c.pivot.position.z;
    let toCam = Math.atan2(dx, dz) - base; toCam = Math.atan2(Math.sin(toCam), Math.cos(toCam));
    c.pivot.rotation.set(0, base + 0.72 * toCam, 0);
    c.m.rotation.x = -(1 - up) * Math.PI / 2;                                    // lying flat, then up on its feet
    if (c.swap !== undefined) c.show(t >= c.swap ? 1 : 0);
  }

  st.finish.uniforms.uFrame.value = Math.round(t * 30); st.finish.uniforms.uGrain.value = 0.02; st.finish.uniforms.uVig.value = 0.32;
  st.render();
  capG.clearRect(0, 0, W, H); captions(capG, t);
}

// built on the first frame, after the fonts have loaded (the house numbers and the name plate are painted in Fredoka)
C.scene({ name: 'street', from: 0, to: 1e6, build(root, S) { S.el = root; }, run(t, b, S) { if (!st) build(S.el); frame(t); } });
C.start();
