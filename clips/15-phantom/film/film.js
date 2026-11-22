// The Woman Without a Face, part 1 of 4 (lab clip 15), version 3: re-cut on opening A, the user's pick ("A, with your
// fixes", 22 Nov). Crime-scene prints flick past with the same faceless woman in each, under "40 CRIME SCENES.": "Her
// DNA was at forty crime scenes." By 3 s, the test, A, B or C: "Killer, thief, or something else? Decide before the
// end." A clock in the corner runs from "Decide" to the last word, "man". Fewer clues (three countries, sixteen years; a
// cookie; a toy pistol), then bare paper and the officer's own still beat. "So who is she?" The police's picks are
// circled, not ticked; C keeps a red "?". The end sets the DNA (a woman) beside some witnesses (a man).
// Fixed after a fresh review of the first cut: see README, "Fixed after a fresh review".
// Every figure is invented; sources in lab/research.md, Round 3. Linocut: black ink on bone paper, one red, re-carved on
// threes. Type: IM Fell English for words; Barlow Condensed for big numbers; Fraunces for dated tags.
(() => {
  const { seg, rs, drawing } = LAB;
  const { L, shape, cut, gougePath, print, begin } = LINO;
  C.fonts = ['400 96px Fell', '700 96px Fraunces', '700 96px Barlow'];
  const N = 3;
  const ease = (k) => k * k * (3 - 2 * k);
  const OPENING = 'b';   // 'a': she stands in the same spot in every print; 'b': frame 0 is the closing print, then back through

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const SWAP = word('qa', 'killer') - 0.05, DECIDE = word('qa', 'decide');   // the claim gives way to the test on one frame
  const MAP = T0('n02') - 0.1, TITLE = word('n02', 'they') - 0.1, EVID = T0('n03') - 0.1;
  const ITEM = [T0('n05') - 0.35, T0('n06') - 0.35];                // the cookie, the toy pistol: each lands in the pause before its line
  const TAGT = [word('n05', 'breakin') - 0.05, word('n06', 'toy') - 0.05];   // and its tag on its word
  const BLANK = T1('n06') + 0.1, BADGE = T0('n08b') - 0.55, OFFTAG = word('n08b', 'police') - 0.1;   // the officer: bare paper first
  const TEST = T0('n09') - 0.1, ANS = T0('n11') - 0.05, BOTH = word('n11', 'both') - 0.05, QMARK = T1('n11') + 0.05;
  const WIT = T0('n12') - 0.1, WITR = word('n12', 'people') - 0.05, MANCUT = word('n13', 'man') - 0.04, NEXT = T1('n13') + 0.35;

  // ------------------------------------------------------------------ type, strokes, tags
  const FELL = '400 %px Fell', NUM = '700 %px Fraunces', BIG = '700 %px Barlow';
  function type(s, x, y, size, layer = 'ink', font = FELL, align = 'center') { const g = L[layer].g; g.save(); g.fillStyle = '#000'; g.font = font.replace('%', size); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
  function typeCut(s, x, y, size, font = FELL) { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = font.replace('%', size); g.textAlign = 'center'; g.fillText(s, x, y); g.restore(); }
  const ink = (pts, w, layer = 'ink') => { const g = L[layer].g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(pts, 8), w); g.restore(); };
  const hole = (p) => { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.fill(); g.restore(); };
  const oval = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const box = (x, y, w, h) => [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
  const measure = (s, size, font = FELL) => { const g = L.ink.g; g.save(); g.font = font.replace('%', size); const w = g.measureText(s).width; g.restore(); return w; };
  function tag(s, x, y, size = 50, font = FELL) {
    const w = measure(s, size, font) + 48, h = size + 28;
    shape('ink', box(x, y, w + 10, h + 10), `tag${s}`, 1.2, 10); hole(box(x, y, w, h));
    type(s, x, y + size * 0.34, size, 'ink', font);
  }
  function view(z, ax, ay, bx, by, fn) {
    for (const k of ['ink', 'red']) L[k].g.setTransform(z, 0, 0, z, bx - ax * z, by - ay * z);
    try { fn(); } finally { for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0); }
  }
  const pop = (t, t0, k = 0.08) => 1 + k * (1 - ease(seg(t, t0, t0 + 0.14)));

  // ------------------------------------------------------------------ the woman without a face, and the man
  // Her hair falls at the sides and stays open below the chin, so it reads as hair, never as a head covering. The face is
  // an outline with nothing in it; in the prints it's opaque paper, so nothing behind her shows through.
  function woman(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'w' + pass;
    shape('ink', P([[-178, 330], [-170, 178], [-126, 130], [-58, 114], [0, 182], [58, 114], [126, 130], [170, 178], [178, 330]]), `wcoat${k}`, 2);
    hole(P(oval(0, 8, 64, 86, 30))); ink(P(oval(0, 8, 64, 86, 30)), 5 * s);
    const crown = oval(0, -12, 86, 106, 22, Math.PI * 0.93, Math.PI * 2.07);
    const right = [[88, 24], [100, 92], [114, 162], [90, 180], [72, 112], [64, 40], [60, -22]];
    const left = [[-60, -22], [-64, 40], [-72, 112], [-90, 180], [-114, 162], [-100, 92], [-88, 24]];
    shape('ink', P([...crown, ...right, [40, -56], [0, -64], [-40, -56], ...left]), `whair${k}`, 2.5);
    cut(LAB.resample(P([[-16, -114], [-10, -70]]), 6), 4 * s + 1);
    for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) cut(LAB.resample(P([[sx * (66 + j * 9), -40 + j * 8], [sx * (80 + j * 8), 50], [sx * (92 + j * 6), 150]]), 6), 3 * s + 1);
  }
  function man(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'm' + pass;
    shape('ink', P([[-178, 330], [-170, 178], [-126, 130], [-58, 114], [0, 182], [58, 114], [126, 130], [170, 178], [178, 330]]), `mcoat${k}`, 2);
    for (const sx of [-1, 1]) shape('ink', P(oval(sx * 70, 14, 16, 26, 14)), `mear${sx}${k}`, 1);   // ears, solid, behind the face
    hole(P(oval(0, 8, 64, 86, 30))); ink(P(oval(0, 8, 64, 86, 30)), 5 * s);
    shape('ink', P([...oval(0, -4, 70, 94, 18, Math.PI * 1.02, Math.PI * 1.98), [70, -20], [58, -48], [0, -58], [-58, -48], [-70, -20]]), `mhair${k}`, 2);
  }

  // ------------------------------------------------------------------ evidence
  function helix(cx, cy, s, turn = 0, layer = 'red') {             // turn: how far it has rotated (radians)
    const A = [], B = [];
    for (let i = 0; i <= 48; i++) { const u = i / 48, y = cy + (u - 0.5) * 360 * s, ph = u * 4 * Math.PI + turn; A.push([cx + Math.sin(ph) * 64 * s, y]); B.push([cx - Math.sin(ph) * 64 * s, y]); }
    ink(A, 10 * s + 2, layer); ink(B, 10 * s + 2, layer);
    for (let i = 3; i < 48; i += 4) ink([A[i], B[i]], 5 * s + 1, layer);
  }
  function stamp(t, t0) {
    if (t < t0) return;
    const sc = 1 + 0.2 * (1 - seg(t, t0, t0 + 0.09)), w = measure('SAME DNA', 58), g = L.red.g;
    g.save(); g.translate(715, 640); g.rotate(-0.12); g.scale(sc, sc); g.fillStyle = '#000';
    g.fillRect(-w / 2 - 24, -56, w + 48, 8); g.fillRect(-w / 2 - 24, 30, w + 48, 8);
    g.font = FELL.replace('%', 58); g.textAlign = 'center'; g.fillText('SAME DNA', 0, 10); g.restore();
  }
  function cup(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'cup' + pass;
    shape('ink', P([[-120, -130], [120, -130], [110, 90], [80, 130], [-80, 130], [-110, 90]]), `cupb${k}`, 2);
    ink(P(oval(150, -10, 54, 66, 20, -1.35, 1.35)), 30 * s);
    cut(LAB.resample(P([[-80, -104], [-74, 84]]), 8), 10 * s);
    shape('ink', P([[-180, 140], [180, 140], [156, 170], [-156, 170]]), `sauc${k}`, 1.5);
  }
  function cookie(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'ck' + pass;
    shape('ink', P(oval(0, 0, 160, 160, 36)), `ckb${k}`, 3);
    hole(P(oval(128, -98, 76, 76, 22)));
    for (const [x, y] of [[-64, -44], [12, 34], [-34, 86], [64, 70], [-92, 30], [22, -64], [-20, -110]]) hole(P(oval(x, y, 15, 11, 10)));
  }
  function pistol(cx, cy, s, pass) {                               // a chunky toy: rounded muzzle with a plug, a closed trigger guard,
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'pi' + pass;   // moulded rivets; no red (it read as a flash)
    shape('ink', P([[-188, -60], [-176, -92], [128, -92], [150, -80], [156, -50], [150, -20], [128, -8], [-36, -8], [-50, 24], [-22, 156], [-36, 172], [-112, 172], [-128, 156], [-160, 30], [-184, 4]]), `pib${k}`, 2);
    shape('ink', P([[160, -84], [196, -84], [206, -50], [196, -16], [160, -16]]), `pip${k}`, 1.5);
    ink(P([[-46, -14], [-46, 30], [-32, 58], [20, 62], [46, 38], [46, -14]]), 10 * s);   // the trigger guard, closed by the barrel
    ink(P([[-8, -10], [-2, 18], [6, 34]]), 9 * s);
    cut(LAB.resample(P([[-150, -62], [112, -62]]), 8), 7 * s);
    for (const [x, y] of [[-96, 56], [-86, 104], [-104, 140]]) hole(P(oval(x, y, 10, 10, 10)));
  }
  function car(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'car' + pass;
    shape('ink', P([[-250, 44], [-240, -12], [-160, -34], [-96, -110], [96, -110], [160, -34], [238, -22], [250, 44], [220, 74], [-220, 74]]), `carb${k}`, 2);
    hole(P([[-84, -94], [-10, -94], [-10, -40], [-134, -40]])); hole(P([[10, -94], [84, -94], [134, -40], [10, -40]]));
    for (const x of [-150, 150]) { shape('ink', P(oval(x, 74, 52, 52, 20)), `wh${x}${k}`, 1.5); hole(P(oval(x, 74, 22, 22, 12))); }
  }
  function badge(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'bd' + pass;
    const shield = [[0, -184], [64, -164], [154, -134], [150, 30], [96, 120], [0, 182], [-96, 120], [-150, 30], [-154, -134], [-64, -164]];
    shape('ink', P(shield), `bdo${k}`, 2);
    hole(P(shield.map(([x, y]) => [x * 0.8, y * 0.8 + 4])));
    const star = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 40 : 96, a = -Math.PI / 2 + i * Math.PI / 5; return [Math.cos(a) * r, Math.sin(a) * r + 4]; });
    shape('ink', P(star), `bds${k}`, 1);
  }

  // ------------------------------------------------------------------ the opening: crime-scene prints, the same woman in each
  // The prints are kept to a similar middle tone (dark areas hatched with carved lines) so no cut flashes the whole frame.
  // Lines every 26 px, not 18: at Instagram's bitrates the finer hatching smeared.
  function hatch(x0, y0, x1, y1, key) { shape('ink', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], key, 1.5); for (let y = y0 + 13; y < y1; y += 26) cut(LAB.resample([[x0, y], [x1, y + 4]], 8), 11); }
  const SPOT = [690, 840], SS = 0.75;                              // where she stands in prints 1-3, about a third of the print's height
  const longCoat = (cx, cy, s, floor, key) => shape('ink', [[cx - 176 * s, cy + 318 * s], [cx + 176 * s, cy + 318 * s], [cx + 150 * s, floor],
    [cx + 9, floor], [cx + 5, floor - 34 * s], [cx - 5, floor - 34 * s], [cx - 9, floor], [cx - 150 * s, floor]], key, 1.5);   // a long coat to the floor, so she stands
  const SCENES = {
    1: (pass) => {                                                 // a room at night, the cup under a lamp; she stands in the doorway
      hatch(105, 470, 905, 1450, `aw1${pass}`); hole([[520, 620], [860, 620], [860, 1400], [520, 1400]]);
      shape('ink', [[305, 470], [355, 470], [385, 520], [275, 520]], `ash${pass}`, 1);
      hole([[280, 522], [380, 522], [490, 1110], [170, 1110]]);   // the lamp's light on the table, so the cup reads
      woman(SPOT[0], SPOT[1], SS, pass); longCoat(SPOT[0], SPOT[1], SS, 1400, `alc${pass}`);
      shape('ink', [[140, 1110], [540, 1110], [540, 1140], [140, 1140]], `at1${pass}`, 1.5);
      for (const x of [175, 505]) shape('ink', [[x - 12, 1140], [x + 12, 1140], [x + 12, 1440], [x - 12, 1440]], `al${x}${pass}`, 1);
      cup(340, 1035, 0.42, pass);
    },
    14: (pass) => {                                                // a forced window, the cookie on the sill; she's outside
      hatch(105, 470, 905, 1450, `aw2${pass}`); hole([[500, 600], [880, 600], [880, 1120], [500, 1120]]);
      for (let j = 0; j < 7; j++) { const a = 0.15 + j * 0.9, r = 70 + 22 * (j % 3); ink([[548, 652], [548 + Math.cos(a) * r, 652 + Math.sin(a) * r]], 5); }   // a spider-web crack in the
      for (const r of [24, 46]) ink(oval(548, 652, r, r * 0.9, 9).map(([x, y], j) => [x + (j % 2 ? 4 : -3), y]), 4);   // corner, clear of her head
      woman(SPOT[0], SPOT[1] + 20, SS, pass);
      shape('ink', [[470, 1120], [905, 1120], [905, 1150], [470, 1150]], `as2${pass}`, 1.2); cookie(560, 1085, 0.24, pass);
    },
    27: (pass) => {                                                // a car with its door open; she stands under the lamp
      hatch(105, 470, 905, 1450, `aw3${pass}`);
      hole([[640, 560], [540, 1300], [860, 1300], [760, 560]]);
      shape('ink', [[812, 480], [826, 480], [826, 1300], [812, 1300]], `apo${pass}`, 1);
      hole([[105, 1300], [905, 1300], [905, 1450], [105, 1450]]);
      woman(SPOT[0], SPOT[1] + 40, SS, pass); longCoat(SPOT[0], SPOT[1] + 40, SS, 1310, `a3lc${pass}`);
      car(300, 1270, 0.62, pass);
    },
    40: (pass) => {                                                // police tape; she's close, facing you
      hatch(105, 470, 905, 1450, `aw4${pass}`);
      woman(505, 1040, 1.45, pass);
      for (const [y, r] of [[700, -0.18], [1250, 0.14]]) { const g = L.red.g; g.save(); g.translate(505, y); g.rotate(r); g.fillStyle = '#000'; g.fillRect(-560, -34, 1120, 68); g.restore(); }
    },
  };
  function photo(n, pass, rot, zin = 1) {                          // zin: the view inside the print closing in on her face
    for (const k of ['ink', 'red']) { const g = L[k].g; g.save(); g.translate(505, 960); g.rotate(rot); g.translate(-505, -960); }
    try {
      shape('ink', box(505, 960, 840, 1020), `pe${n}`, 1.5, 12); hole(box(505, 960, 800, 980));
      for (const k of ['ink', 'red']) { const g = L[k].g; g.save(); g.beginPath(); g.rect(105, 470, 800, 980); g.clip(); g.translate(505, 1040); g.scale(zin, zin); g.translate(-505, -1040); }
      try { SCENES[n](pass); } finally { for (const k of ['ink', 'red']) L[k].g.restore(); }
      shape('ink', box(268, 1388, 336, 86), `pt${n}`, 1, 10); hole(box(268, 1388, 322, 72));
      type(`SCENE ${n} / 40`, 268, 1406, 52, 'ink', BIG);
    } finally { for (const k of ['ink', 'red']) L[k].g.restore(); }
  }
  // (b), kept: frame 0 is the closing print, her face behind the tape, held through "Her DNA"; then back through prints 1,
  // 14 and 27 on "was", "forty" and "crime", and home to 40 on "scenes". She stands in the same spot in 1, 14 and 27, so
  // the room changes around her and she doesn't. (a), tried: the same spot in every print, 1 to 40 (README).
  const CUTS = OPENING === 'a' ? [[1, 0], [14, 0.6], [27, 1.2], [40, 1.8]]
    : [[40, 0], [1, word('a01', 'was') - 0.03], [14, word('a01', 'forty') - 0.03], [27, word('a01', 'crime') - 0.03], [40, word('a01', 'scenes') - 0.03]];
  // The test's answers carry the same letters as the cards later, so comments can say "C".
  const OPTS = [['A', 'KILLER?', 'killer'], ['B', 'THIEF?', 'thief'], ['C', 'SOMETHING ELSE?', 'something']];
  function option(l, s, y, sc) {
    const g = L.ink.g, cy = y - 27;
    g.save(); g.translate(112, cy); g.scale(sc, sc); g.translate(-112, -cy);
    shape('ink', oval(146, cy, 34, 34, 20), `ol${l}`, 1); typeCut(l, 146, cy + 16, 46, BIG);
    type(s, 196, y, 76, 'ink', BIG, 'left');
    g.restore();
  }
  function opening(t, pass) {
    let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1][1]) i++;
    const [n, c] = CUTS[i], z = 0.9 * pop(t, c, 0.05) * (1 + 0.008 * (t - c));   // each print lands, then creeps in
    const zin = i === CUTS.length - 1 ? 1 + 0.3 * ease(seg(t, SWAP, MAP)) : 1;    // while the test is asked, the view closes in on her face
    view(z, 505, 960, 505, 1056, () => photo(n, pass, { 1: -0.02, 14: 0.025, 27: -0.03, 40: 0.01 }[n], zin));
    if (t < SWAP) { type('40', 505, 445, 200, 'ink', BIG); type('CRIME SCENES.', 505, 545, 92, 'ink', BIG); }   // the claim: the biggest thing on frame 0
    else OPTS.forEach(([l, s, w], k) => { const t0 = k ? word('qa', w) - 0.05 : SWAP; if (t >= t0) option(l, s, 380 + k * 88, pop(t, t0, 0.15)); });
  }

  // ------------------------------------------------------------------ the clock in the corner, from "Decide" to the last word
  // Time runs out on "man", so "Decide before the end" means the end of the reel. A red wedge fills as it runs, so it reads
  // at phone size. It stops, and goes, for the officer's beat: nothing ticks over her.
  const HUSH = [BLANK, TEST], CLOCK1 = MANCUT;
  const run = (x) => Math.max(0, Math.min(x, HUSH[0]) - DECIDE) + Math.max(0, x - HUSH[1]);   // the clock's own time, without the hush
  function clock(t) {
    if (t < DECIDE - 0.05 || t >= CLOCK1 || (t >= HUSH[0] && t < HUSH[1])) return;
    const cx = 876, cy = 330, r = 60, a = -Math.PI / 2 + Math.PI * 2 * Math.min(1, run(t) / run(CLOCK1)), gr = L.red.g;
    gr.save(); gr.fillStyle = '#000'; gr.beginPath(); gr.moveTo(cx, cy); gr.arc(cx, cy, r - 12, -Math.PI / 2, Math.max(-Math.PI / 2 + 0.01, a)); gr.closePath(); gr.fill(); gr.restore();
    for (let i = 0; i < 12; i++) { const b = i * Math.PI / 6; ink([[cx + Math.cos(b) * (r - 18), cy + Math.sin(b) * (r - 18)], [cx + Math.cos(b) * (r - 8), cy + Math.sin(b) * (r - 8)]], 5); }
    ink(oval(cx, cy, r, r, 36), 8);
    ink([[cx, cy], [cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14)]], 9);
  }

  // ------------------------------------------------------------------ the map: forty scenes, no borders
  const DOTS = Array.from({ length: 40 }, (_, i) => {              // mostly Germany, a few in Austria, one in France (Wikipedia's list; illustrative)
    const c = i % 10 === 4 ? [810, 1130, 90, 80] : i === 7 ? [250, 1150, 10, 10] : [540, 850, 230, 170];
    return [c[0] + (rs('dx', i) + rs('ex', i)) * 0.5 * c[2], c[1] + (rs('dy', i) + rs('ey', i)) * 0.5 * c[3]];
  });
  function map(t, pass) {
    const n = Math.min(40, Math.floor((t - MAP) / 0.03) + 1);       // from 1: a "0" showed for four frames
    for (let i = 0; i < n; i++) shape('red', oval(DOTS[i][0], DOTS[i][1], 14, 14, 10), `dot${i}${pass}`, 1, 6);
    type('GERMANY', 540, 620, 42); type('AUSTRIA', 810, 1270, 42); type('FRANCE', 250, 1240, 42);
    type(String(n), 505, 440, 160, 'ink', BIG); type(n === 1 ? 'CRIME SCENE' : 'CRIME SCENES', 505, 515, 56);
    type('1993 – 2009', 505, 1470, 84, 'ink', BIG);
  }

  // ------------------------------------------------------------------ the test, and the police's answer
  function testCard(letter, text, y) {
    const w = 820, h = 150;
    shape('ink', box(505, y, w + 12, h + 12), `card${letter}`, 1.2, 10); hole(box(505, y, w, h));
    shape('ink', oval(180, y, 50, 50, 22), `cl${letter}`, 1); typeCut(letter, 180, y + 21, 60, BIG);
    type(text, 264, y + 25, 72, 'ink', BIG, 'left');
  }
  // The police's picks are circled in black, the way a pen marks a choice. A tick reads as "right", and muted viewers
  // took the ticks for the answer key.
  function ring(t, t0, y) {
    if (t < t0) return;
    const f = ease(seg(t, t0, t0 + 0.28)), pts = [];
    for (let k = 0; k <= Math.round(40 * f); k++) { const a = Math.PI * 0.8 + (Math.PI * 2 + 0.5) * k / 40, w = 1 + 0.05 * Math.sin(a * 3 + y); pts.push([180 + Math.cos(a) * 64 * w, y + Math.sin(a) * 62 * w]); }
    if (pts.length > 1) ink(pts, 9);
  }

  LAB.film({
    draw(g, t) {
      const pass = drawing(t, N);
      for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0);
      begin();
      if (t < MAP) opening(t, pass);                                 // the prints, the claim, then the test
      else if (t < TITLE) map(t, pass);                              // three countries, sixteen years
      else if (t < EVID) {                                           // the title, over a close-up of her empty face
        view(pop(t, TITLE), 505, 1200, 505, 1200, () => woman(505, 1180, 3.0, pass));
        type('THE WOMAN', 505, 450, 92); type('WITHOUT A FACE', 505, 545, 92);
      } else if (t < ITEM[0]) {                                      // here's where her DNA turned up: the helix turns
        view(pop(t, EVID), 505, 920, 505, 920, () => helix(505, 920, 1.6, Math.PI * (t - EVID)));
        type('HER DNA', 505, 420, 96);
      } else if (t < BLANK) {                                        // a cookie, a toy pistol: each lands before its line, its tag on its word
        const i = t >= ITEM[1] ? 1 : 0;
        view(pop(t, ITEM[i]), 505, 940, 505, 940, () => [cookie, pistol][i](505, 940, 1.6, pass));
        if (t >= TAGT[i]) tag(['BREAK-IN', 'TOY PISTOL'][i], 505, 1330, 52);
        stamp(t, ITEM[i] + 0.12);
      } else if (t < TEST) {                                         // the officer: bare paper first, then a small badge, still, and
        if (t >= BADGE) {                                            // plain type on her words. Nothing here looks like the evidence.
          badge(505, 1000, 1.1, pass);
          if (t >= OFFTAG) type('POLICE OFFICER · 2007', 505, 1330, 46, 'ink', NUM);
        }
      } else if (t < WIT) {                                          // so who is she? the cards; then the police's picks, circled
        if (t < ANS) type('WHO IS SHE?', 505, 505, 92); else type('POLICE BELIEVED:', 505, 505, 80);
        const cards = [['A', 'KILLER', 780], ['B', 'THIEF', 980], ['C', 'SOMETHING ELSE', 1180]];
        cards.forEach(([l, s, y]) => testCard(l, s, y));
        ring(t, BOTH, 780); ring(t, BOTH + 0.12, 980);
        if (t >= QMARK) { const sc = pop(t, QMARK, 0.2); const gr = L.red.g; gr.save(); gr.translate(872, 1180); gr.scale(sc, sc); gr.fillStyle = '#000'; gr.font = FELL.replace('%', 104); gr.textAlign = 'center'; gr.fillText('?', 0, 36); gr.restore(); }
      } else {                                                       // the DNA said a woman; some witnesses said a man (on "man")
        view(1 + 0.03 * seg(t, WIT, NEXT + 1), 505, 1030, 505, 1030, () => {
          woman(280, 1030, 1.2, pass);
          if (t >= MANCUT) man(730, 1030, 1.2, pass);
        });
        type('THE DNA:', 280, 470, 50); type('A WOMAN', 280, 575, 96, 'ink', BIG);
        if (t >= WITR) type('SOME WITNESSES:', 730, 470, 46);
        if (t >= MANCUT) type('A MAN', 730, 575, 96, 'ink', BIG);
        else if (t >= WITR) { const gr = L.red.g, sc = pop(t, WITR, 0.15); gr.save(); gr.translate(730, 1180); gr.scale(sc, sc); gr.fillStyle = '#000'; gr.font = FELL.replace('%', 300); gr.textAlign = 'center'; gr.fillText('?', 0, 0); gr.restore(); }
        if (t >= NEXT) type('PART 2 · THE HUNT', 505, 372, 64, 'red', NUM);
      }
      clock(t);
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
