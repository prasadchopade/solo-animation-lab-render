// The Woman Without a Face, part 1 of 4 (lab clip 15), version 3: re-cut on opening A, the user's pick ("A, with your
// fixes", 22 Nov). Four crime-scene prints flick past with the same faceless woman in each, under "40 CRIME SCENES.":
// "Her DNA was at forty crime scenes." By 3 s, the test: "Killer, thief, or something else? Decide before the end." A
// clock in the corner runs from "Decide" to the answer. Fewer clues (three countries, sixteen years; a cookie; a toy
// pistol; then the officer's own still beat), "So who is she?", the police's answer (killer and thief, labelled as
// theirs; SOMETHING ELSE left open), and the hook out: "Some said she looked like a man."
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
  const OPENQ = T0('qa'), DECIDE = word('qa', 'decide');
  const MAP = T0('n02') - 0.1, TITLE = word('n02', 'they') - 0.1, EVID = T0('n03') - 0.1;
  const ITEM = [T0('n05') - 0.35, T0('n06') - 0.35, T0('n08') - 0.8];   // the cookie, the toy pistol; the officer's in a longer, still pause
  const OFFTAG = word('n08', 'police') - 0.1;
  const TEST = T0('n09') - 0.1, ANS = T0('n11') - 0.05, TICK = [word('n11', 'killer'), word('n11', 'thief')], QMARK = T1('n11') + 0.05;
  const WIT = T0('n12') - 0.1, MANCUT = word('n13', 'man') - 0.04, NEXT = T1('n13') + 0.35;

  // ------------------------------------------------------------------ type, strokes, tags
  const FELL = '400 %px Fell', NUM = '700 %px Fraunces', BIG = '700 %px Barlow';
  function type(s, x, y, size, layer = 'ink', font = FELL, align = 'center') { const g = L[layer].g; g.save(); g.fillStyle = '#000'; g.font = font.replace('%', size); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
  function typeCut(s, x, y, size) { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = FELL.replace('%', size); g.textAlign = 'center'; g.fillText(s, x, y); g.restore(); }
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
    hole(P(oval(0, 8, 64, 86, 30))); ink(P(oval(0, 8, 64, 86, 30)), 5 * s);
    shape('ink', P([...oval(0, -4, 70, 94, 18, Math.PI * 1.02, Math.PI * 1.98), [70, -20], [58, -48], [0, -58], [-58, -48], [-70, -20]]), `mhair${k}`, 2);
    ink(P(oval(-74, 10, 10, 18, 12, -1.6, 1.6)), 4 * s); ink(P(oval(74, 10, 10, 18, 12, 1.55, 4.7)), 4 * s);
  }

  // ------------------------------------------------------------------ evidence
  function helix(cx, cy, s, layer = 'red') {
    const A = [], B = [];
    for (let i = 0; i <= 48; i++) { const u = i / 48, y = cy + (u - 0.5) * 360 * s, ph = u * 4 * Math.PI; A.push([cx + Math.sin(ph) * 64 * s, y]); B.push([cx - Math.sin(ph) * 64 * s, y]); }
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
  function pistol(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'pi' + pass;
    shape('ink', P([[-170, -70], [150, -70], [150, -14], [-40, -14], [-56, 20], [-20, 150], [-104, 160], [-150, 30], [-176, 10]]), `pib${k}`, 2);
    ink(P(oval(-6, 24, 34, 30, 16, -0.2, 3.3)), 9 * s);
    shape('red', P([[150, -74], [206, -74], [206, -10], [150, -10]]), `pit${k}`, 1.5);
    cut(LAB.resample(P([[-140, -50], [120, -50]]), 8), 6 * s);
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
  function hatch(x0, y0, x1, y1, key) { shape('ink', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], key, 1.5); for (let y = y0 + 9; y < y1; y += 18) cut(LAB.resample([[x0, y], [x1, y + 4]], 8), 8); }
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
      for (const [a, b] of [[[500, 760], [620, 700]], [[620, 700], [660, 800]], [[620, 700], [650, 600]]]) ink([a, b], 6);
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
  function photo(n, pass, rot) {
    for (const k of ['ink', 'red']) { const g = L[k].g; g.save(); g.translate(505, 960); g.rotate(rot); g.translate(-505, -960); }
    try {
      shape('ink', box(505, 960, 840, 1020), `pe${n}`, 1.5, 12); hole(box(505, 960, 800, 980));
      for (const k of ['ink', 'red']) { const g = L[k].g; g.save(); g.beginPath(); g.rect(105, 470, 800, 980); g.clip(); }
      try { SCENES[n](pass); } finally { for (const k of ['ink', 'red']) L[k].g.restore(); }
      shape('ink', box(250, 1395, 280, 70), `pt${n}`, 1, 10); hole(box(250, 1395, 266, 56));
      type(`SCENE ${n} / 40`, 250, 1412, 40, 'ink', BIG);
    } finally { for (const k of ['ink', 'red']) L[k].g.restore(); }
  }
  // (b), kept: frame 0 is the closing print, her face behind the tape, held through "Her DNA"; then back through prints 1,
  // 14 and 27 on "was", "forty" and "crime", and home to 40 on "scenes". She stands in the same spot in 1, 14 and 27, so
  // the room changes around her and she doesn't. (a), tried: the same spot in every print, 1 to 40 (README).
  const CUTS = OPENING === 'a' ? [[1, 0], [14, 0.6], [27, 1.2], [40, 1.8]]
    : [[40, 0], [1, word('a01', 'was') - 0.03], [14, word('a01', 'forty') - 0.03], [27, word('a01', 'crime') - 0.03], [40, word('a01', 'scenes') - 0.03]];
  function opening(t, pass) {
    let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1][1]) i++;
    const [n, c] = CUTS[i], z = 0.9 * pop(t, c, 0.05) * (1 + 0.008 * (t - c));   // each print lands, then creeps in
    view(z, 505, 960, 505, 1056, () => photo(n, pass, { 1: -0.02, 14: 0.025, 27: -0.03, 40: 0.01 }[n]));
    if (t < OPENQ - 0.1) { type('40', 505, 455, 200, 'ink', BIG); type('CRIME SCENES.', 505, 557, 92, 'ink', BIG); }   // the claim: the biggest thing on frame 0
    else ['KILLER?', 'THIEF?', 'SOMETHING ELSE?'].forEach((s, k) => {                 // the test, word by word
      const t0 = word('qa', ['killer', 'thief', 'something'][k]) - 0.05;
      if (t >= t0) { const g = L.ink.g, sc = pop(t, t0, 0.15), y = 372 + k * 82; g.save(); g.translate(112, y); g.scale(sc, sc); g.translate(-112, -y); type(s, 112, y, 70, 'ink', FELL, 'left'); g.restore(); }
    });
  }

  // ------------------------------------------------------------------ the clock in the corner, from "Decide" to the answer
  // It stops, and goes, for the officer's beat: nothing ticks over her.
  const HUSH = [ITEM[2], TEST];
  const run = (x) => Math.max(0, Math.min(x, HUSH[0]) - DECIDE) + Math.max(0, x - HUSH[1]);   // the clock's own time, without the hush
  function clock(t) {
    if (t < DECIDE - 0.05 || t >= ANS || (t >= HUSH[0] && t < HUSH[1])) return;
    const cx = 884, cy = 316, r = 42;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ink([[cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14)], [cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6)]], 4); }
    ink(oval(cx, cy, r, r, 30), 6);
    const a = -Math.PI / 2 + Math.PI * 2 * Math.min(1, run(t) / run(ANS));
    ink([[cx, cy], [cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10)]], 7, 'red');
  }

  // ------------------------------------------------------------------ the map: forty scenes, no borders
  const DOTS = Array.from({ length: 40 }, (_, i) => {              // mostly Germany, a few in Austria, one in France (Wikipedia's list; illustrative)
    const c = i % 10 === 4 ? [810, 1130, 90, 80] : i === 7 ? [250, 1150, 10, 10] : [540, 850, 230, 170];
    return [c[0] + (rs('dx', i) + rs('ex', i)) * 0.5 * c[2], c[1] + (rs('dy', i) + rs('ey', i)) * 0.5 * c[3]];
  });
  function map(t, pass) {
    const n = Math.min(40, Math.max(0, Math.floor((t - MAP - 0.15) / 0.03) + 1));
    for (let i = 0; i < n; i++) shape('red', oval(DOTS[i][0], DOTS[i][1], 14, 14, 10), `dot${i}${pass}`, 1, 6);
    type('GERMANY', 540, 620, 42); type('AUSTRIA', 810, 1270, 42); type('FRANCE', 250, 1240, 42);
    type(String(n), 505, 440, 160, 'ink', BIG); type(n === 1 ? 'CRIME SCENE' : 'CRIME SCENES', 505, 515, 56);
    type('1993 – 2009', 505, 1470, 84, 'ink', BIG);
  }

  // ------------------------------------------------------------------ the test, and the police's answer
  function testCard(letter, text, y) {
    const w = 820, h = 150;
    shape('ink', box(505, y, w + 12, h + 12), `card${letter}`, 1.2, 10); hole(box(505, y, w, h));
    shape('ink', oval(180, y, 50, 50, 22), `cl${letter}`, 1); typeCut(letter, 180, y + 22, 64);
    type(text, 250, y + 18, 50, 'ink', FELL, 'left');
  }
  const tick = (x, y) => ink([[x - 30, y], [x - 8, y + 24], [x + 34, y - 30]], 12, 'red');

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
      } else if (t < ITEM[0]) {                                      // here's where her DNA turned up
        view(pop(t, EVID), 505, 920, 505, 920, () => helix(505, 920, 1.6));
        type('HER DNA', 505, 420, 96);
      } else if (t < TEST) {                                         // a cookie, a toy pistol; then the officer, still and apart
        const i = ITEM.filter((x) => t >= x).length - 1, still = i === 2;
        const draw = [cookie, pistol, badge][i], label = ['BREAK-IN', 'ROBBERY · FRANCE', 'POLICE OFFICER · 2007'][i];
        view(still ? 1 : pop(t, ITEM[i]), 505, 940, 505, 940, () => draw(505, 940, 1.6, pass));
        if (!still || t >= OFFTAG) tag(label, 505, 1330, still ? 46 : 52, still ? NUM : FELL);
        if (!still) stamp(t, ITEM[i] + 0.12);
      } else if (t < WIT) {                                          // so who is she? the cards; then the police's answer
        if (t < ANS) type('WHO IS SHE?', 505, 440, 92); else type('POLICE BELIEVED:', 505, 420, 80);
        const cards = [['A', 'KILLER', 780], ['B', 'THIEF', 980], ['C', 'SOMETHING ELSE', 1180]];
        cards.forEach(([l, s, y]) => testCard(l, s, y));
        TICK.forEach((x, i) => { if (t >= x) tick(870, cards[i][2]); });
        if (t >= QMARK) { const sc = pop(t, QMARK, 0.2); const gr = L.red.g; gr.save(); gr.translate(872, 1180); gr.scale(sc, sc); gr.fillStyle = '#000'; gr.font = FELL.replace('%', 104); gr.textAlign = 'center'; gr.fillText('?', 0, 36); gr.restore(); }
      } else if (t < MANCUT) {                                       // but the people who saw her?
        view(1 + 0.08 * seg(t, WIT, MANCUT), 505, 1000, 505, 1000, () => woman(505, 1120, 2.3, pass));
      } else {                                                       // some said she looked like a man: the cut lands on "man"
        view(1.08, 505, 1000, 505, 1000, () => man(505, 1120, 2.3, pass));
        if (t >= NEXT) { type('PART 2', 505, 420, 84, 'red', NUM); type('THE HUNT', 505, 505, 64); }
      }
      clock(t);
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
