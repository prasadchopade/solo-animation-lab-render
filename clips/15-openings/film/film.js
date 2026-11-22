// The Woman Without a Face: three openings for part 1 (lab clip 15's prototypes, 22 Nov). The user, through HQ: "Make the
// first 2-3 seconds something special." Each opening must show something impossible from frame 0, with movement, and
// put the test question inside 3 s. One film, three segments with blank paper between; cut apart after the render.
//   A · She's in every picture: four crime-scene snapshots, the same faceless woman in each, the last one close.
//   B · The stamp storm: evidence cards slam down, each stamped SAME DNA, ending on her blank face.
//   C · The face that won't carve: a gouge cuts eyes and a mouth into her face; the ink fills back in, twice.
// Then the shared test: KILLER? THIEF? SOMETHING ELSE? and a clock that starts on "Decide".
// Every figure is invented; the lines keep to the sources ("her DNA was"). Linocut, as clip 15.
(() => {
  const { lerp, seg, rs, drawing } = LAB;
  const { L, shape, cut, gougePath, print, begin } = LINO;
  C.fonts = ['400 96px Fell', '700 96px Barlow'];
  const N = 3;
  const ease = (k) => k * k * (3 - 2 * k);

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const SEGS = [['a01', 'qa'], ['b01', 'qb'], ['c01', 'qc']].map(([o, q]) => ({ o, q, t0: T0(o) - 0.12, end: T1(q) + 0.9 }));

  // ------------------------------------------------------------------ type, strokes (as clip 15)
  const FELL = '400 %px Fell', BIG = '700 %px Barlow';
  function type(s, x, y, size, layer = 'ink', font = FELL, align = 'center') { const g = L[layer].g; g.save(); g.fillStyle = '#000'; g.font = font.replace('%', size); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
  const ink = (pts, w, layer = 'ink') => { const g = L[layer].g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(pts, 8), w); g.restore(); };
  const hole = (p) => { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.fill(); g.restore(); };
  const oval = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const box = (x, y, w, h) => [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
  const measure = (s, size, font = FELL) => { const g = L.ink.g; g.save(); g.font = font.replace('%', size); const w = g.measureText(s).width; g.restore(); return w; };
  function view(z, ax, ay, bx, by, fn, rot = 0) {
    const c = Math.cos(rot) * z, s = Math.sin(rot) * z;
    for (const k of ['ink', 'red']) L[k].g.setTransform(c, s, -s, c, bx - (c * ax - s * ay), by - (s * ax + c * ay));
    try { fn(); } finally { for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0); }
  }
  const pop = (t, t0, k = 0.1) => 1 + k * (1 - ease(seg(t, t0, t0 + 0.12)));
  function stampText(text, x, y, t0, t, size = 56, rot = -0.12) {   // a red rubber stamp, slammed on
    if (t < t0) return;
    const sc = 1 + 0.2 * (1 - seg(t, t0, t0 + 0.08)), w = measure(text, size), g = L.red.g;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.fillStyle = '#000';
    g.fillRect(-w / 2 - 22, -size * 0.95, w + 44, 8); g.fillRect(-w / 2 - 22, size * 0.5, w + 44, 8);
    g.font = FELL.replace('%', size); g.textAlign = 'center'; g.fillText(text, 0, size * 0.18); g.restore();
  }

  // ------------------------------------------------------------------ the woman (as clip 15); face: 'paper' or 'block'
  function woman(cx, cy, s, pass, face = 'paper') {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'w' + pass;
    shape('ink', P([[-178, 330], [-170, 178], [-126, 130], [-58, 114], [0, 182], [58, 114], [126, 130], [170, 178], [178, 330]]), `wcoat${k}`, 2);
    const crown = oval(0, -12, 86, 106, 22, Math.PI * 0.93, Math.PI * 2.07);
    const right = [[88, 24], [100, 92], [114, 162], [90, 180], [72, 112], [64, 40], [60, -22]];
    const left = [[-60, -22], [-64, 40], [-72, 112], [-90, 180], [-114, 162], [-100, 92], [-88, 24]];
    if (face === 'block') shape('ink', P(oval(0, 8, 64, 86, 30)), `wface${k}`, 1.2);   // the uncarved block: a face of solid ink
    else ink(P(oval(0, 8, 64, 86, 30)), 5 * s);
    shape('ink', P([...crown, ...right, [40, -56], [0, -64], [-40, -56], ...left]), `whair${k}`, 2.5);
    cut(LAB.resample(P([[-16, -114], [-10, -70]]), 6), 4 * s + 1);
    for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) cut(LAB.resample(P([[sx * (66 + j * 9), -40 + j * 8], [sx * (80 + j * 8), 50], [sx * (92 + j * 6), 150]]), 6), 3 * s + 1);
  }

  // ------------------------------------------------------------------ evidence objects (as clip 15)
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
  }
  function syringe(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'sy' + pass;
    shape('ink', P(box(-20, 0, 300, 96)), `syo${k}`, 1.2); hole(P(box(-20, 0, 276, 72)));
    shape('ink', P(box(-60, 0, 196, 72)), `syl${k}`, 1);
    shape('ink', P(box(-200, 0, 60, 24)), `syr${k}`, 1); shape('ink', P(box(-236, 0, 16, 110)), `syt${k}`, 1);
    shape('ink', P(box(150, 0, 40, 40)), `syh${k}`, 1); ink(P([[170, 0], [330, 0]]), 6 * s);
  }
  function car(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'car' + pass;
    shape('ink', P([[-250, 44], [-240, -12], [-160, -34], [-96, -110], [96, -110], [160, -34], [238, -22], [250, 44], [220, 74], [-220, 74]]), `carb${k}`, 2);
    hole(P([[-84, -94], [-10, -94], [-10, -40], [-134, -40]])); hole(P([[10, -94], [84, -94], [134, -40], [10, -40]]));
    for (const x of [-150, 150]) { shape('ink', P(oval(x, 74, 52, 52, 20)), `wh${x}${k}`, 1.5); hole(P(oval(x, 74, 22, 22, 12))); }
  }

  // ------------------------------------------------------------------ the shared test: the options, then a clock from "Decide"
  function question(t, S, pass) {
    const opts = [['KILLER?', word(S.q, 'killer')], ['THIEF?', word(S.q, 'thief')], ['SOMETHING ELSE?', word(S.q, 'something')]];
    opts.forEach(([s, t0], i) => { if (t >= t0 - 0.05) { const g = L.ink.g, sc = pop(t, t0 - 0.05, 0.15); g.save(); g.translate(112, 372 + i * 82); g.scale(sc, sc); g.translate(-112, -(372 + i * 82)); type(s, 112, 372 + i * 82, 70, 'ink', FELL, 'left'); g.restore(); } });
    const go = word(S.q, 'decide');
    if (t >= T0(S.q) - 0.05) {                                      // the clock: there from the question, running from "Decide"
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ink([[850 + Math.cos(a) * 46, 450 + Math.sin(a) * 46], [850 + Math.cos(a) * 54, 450 + Math.sin(a) * 54]], 4); }
      ink(oval(850, 450, 64, 64, 32), 7);
      const a = -Math.PI / 2 + Math.PI * 2 * Math.max(0, t - go) / 8;
      ink([[850, 450], [850 + Math.cos(a) * 48, 450 + Math.sin(a) * 48]], 8, 'red');
    }
  }

  // ------------------------------------------------------------------ A · she's in every picture
  function photo(n, pass, scene, rot) {                            // a crime-scene print: paper, an inked edge, a tag (tilted on top of any outer view)
    for (const k of ['ink', 'red']) { const g = L[k].g; g.save(); g.translate(505, 960); g.rotate(rot); g.translate(-505, -960); }
    try {
      shape('ink', box(505, 960, 840, 1020), `pe${n}`, 1.5, 12); hole(box(505, 960, 800, 980));
      for (const k of ['ink', 'red']) { const g = L[k].g; g.save(); g.beginPath(); g.rect(105, 470, 800, 980); g.clip(); }   // the scene stays inside the print
      try { scene(); } finally { for (const k of ['ink', 'red']) L[k].g.restore(); }
      shape('ink', box(250, 1395, 280, 70), `pt${n}`, 1, 10); hole(box(250, 1395, 266, 56));
      type(`SCENE ${[1, 14, 27, 40][n]} / 40`, 250, 1412, 40, 'ink', BIG);
    } finally { for (const k of ['ink', 'red']) L[k].g.restore(); }
  }
  function drawA(t, S, pass) {
    const u = t - S.t0, n = Math.min(3, Math.floor(u / 0.62));
    const q = ease(seg(t, T0(S.q) - 0.15, T0(S.q) + 0.2)), sc = pop(t, S.t0 + n * 0.62, 0.06) * (1 - 0.26 * q);
    view(sc, 505, 960, 505, 960 + 230 * q, () => photo(n, pass, [
      () => {                                                      // 1: a room, a cup on the table; she stands in the doorway
        shape('ink', [[105, 470], [905, 470], [905, 900], [105, 900]], `aw1${pass}`, 1.5); hole([[600, 520], [780, 520], [780, 900], [600, 900]]);
        woman(690, 760, 0.62, pass);
        shape('ink', [[150, 1090], [860, 1090], [860, 1120], [150, 1120]], `at1${pass}`, 1.5);
        for (const x of [190, 820]) shape('ink', [[x - 12, 1120], [x + 12, 1120], [x + 12, 1440], [x - 12, 1440]], `al${x}${pass}`, 1);
        cup(420, 1010, 0.45, pass);
      },
      () => {                                                      // 2: a forced door, the cookie; she's outside, far off
        shape('ink', [[105, 470], [905, 470], [905, 1450], [105, 1450]], `aw2${pass}`, 1.5); hole([[250, 560], [760, 560], [760, 1180], [250, 1180]]);
        for (const [a, b] of [[[250, 760], [430, 700]], [[430, 700], [520, 820]], [[430, 700], [470, 560]]]) ink([a, b], 6);
        woman(560, 1010, 0.5, pass);
        shape('ink', [[200, 1180], [810, 1180], [810, 1215], [200, 1215]], `as2${pass}`, 1.2); cookie(330, 1140, 0.28, pass);
      },
      () => {                                                      // 3: a car, its door open; she stands under the lamp
        shape('ink', [[105, 470], [905, 470], [905, 1450], [105, 1450]], `aw3${pass}`, 1.5);
        hole([[700, 560], [600, 1300], [880, 1300], [800, 560]]);                                         // the lamp's light
        shape('ink', [[742, 480], [758, 480], [758, 1300], [742, 1300]], `apo${pass}`, 1);
        woman(750, 1060, 0.48, pass);
        hole([[105, 1300], [905, 1300], [905, 1450], [105, 1450]]);
        car(360, 1280, 0.7, pass);
      },
      () => {                                                      // 4: police tape; she's close, facing you
        woman(505, 1000, 1.7, pass);
        for (const [y, r] of [[700, -0.18], [1250, 0.14]]) { const g = L.red.g; g.save(); g.translate(505, y); g.rotate(r); g.fillStyle = '#000'; g.fillRect(-560, -34, 1120, 68); g.restore(); }
      },
    ][n], [-0.02, 0.025, -0.03, 0.01][n]));
    if (t >= T0(S.q) - 0.1) question(t, S, pass);
  }

  // ------------------------------------------------------------------ B · the stamp storm
  function drawB(t, S, pass) {
    const at = [S.t0 + 0.1, word(S.o, 'cookie'), word(S.o, 'toy'), word(S.o, 'toy') + 0.38, word(S.o, 'toy') + 0.7, word(S.o, 'same')].map((x) => x - 0.1);
    const cards = [
      [cup, 'MURDER', 330, 860, -0.12, 0.42], [cookie, 'BREAK-IN', 690, 820, 0.1, 0.55], [pistol, 'TOY GUN', 340, 1250, 0.08, 0.5],
      [syringe, 'SYRINGE', 680, 1240, -0.09, 0.45], [car, 'STOLEN CAR', 505, 1050, 0.04, 0.42],
    ];
    cards.forEach(([draw, label, x, y, r, s], i) => {
      if (t < at[i]) return;
      view(pop(t, at[i], 0.25), x, y, x, y, () => {
        shape('ink', box(x, y, 440, 380), `bc${i}`, 1.2, 10); hole(box(x, y, 412, 352));
        draw(x, y - 30, s, pass); type(label, x, y + 150, 40);
      }, r);
      stampText('SAME DNA', x + 70, y - 110, at[i] + 0.1, t, 40, r - 0.1);
    });
    if (t >= at[5]) {                                              // last: her face, on top of the pile
      view(pop(t, at[5], 0.25), 505, 1120, 505, 1120, () => {
        shape('ink', box(505, 1120, 560, 640), 'bface', 1.2, 10); hole(box(505, 1120, 532, 612));
        woman(505, 1120, 0.95, pass);
      }, -0.03);
    }
    if (t >= T0(S.q) - 0.1) question(t, S, pass);
  }

  // ------------------------------------------------------------------ C · the face that won't carve
  function drawC(t, S, pass) {
    const u = t - S.t0, cx = 505, cy = 1150, s = 2.3;
    woman(cx, cy, s, pass, 'block');
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]);
    const passes = [[0.0, 1.0, 1.3], [1.35, 1.85, 2.15]];          // carve from a, carved by b, filled back by c
    let gx = null;
    for (const [a, b, c] of passes) {
      if (u < a || u >= c + 0.05) continue;
      const k = seg(u, a, b), w = 1 - seg(u, b, c);                 // how much is cut, and how much the ink has let it be
      const feats = [[[-44, -8], [-30, -16], [-14, -8], [-30, -2], [-44, -8]], [[14, -8], [30, -16], [44, -8], [30, -2], [14, -8]], [[-26, 46], [0, 54], [26, 46]]];
      feats.forEach((f, i) => {
        const kk = seg(k, i / 3, (i + 1) / 3); if (kk <= 0 || w <= 0) return;
        const pts = P(f).slice(0, Math.max(2, Math.ceil(f.length * kk)));
        cut(LAB.resample(pts, 4), (i === 2 ? 9 : 11) * w + 0.5);
        if (kk < 1) gx = pts[pts.length - 1];
      });
    }
    if (gx) {                                                      // the gouge, cutting
      const R = (pts) => pts.map(([x, y]) => [gx[0] + x * Math.cos(-0.7) - y * Math.sin(-0.7), gx[1] + x * Math.sin(-0.7) + y * Math.cos(-0.7)]);
      const handle = R([...oval(0, -150, 24, 72, 24), [7, -78], [7, -32], [12, -32], [0, 0], [-12, -32], [-7, -32], [-7, -78]]);
      hole(handle); ink([...handle, handle[0]], 5, 'red');           // a pale wooden gouge, outlined in red, so it shows over the ink
    }
    if (t < T0(S.q) - 0.1) {
      type('40 CRIMES.', 505, 400, 90, 'ink', BIG);
      if (t >= word(S.o, 'her') - 0.05) type('HER DNA.', 505, 490, 76);
      if (t >= word(S.o, 'no') - 0.05) type('NO FACE.', 505, 575, 76, 'red');
    } else question(t, S, pass);
  }

  LAB.film({
    draw(g, t) {
      const pass = drawing(t, N);
      for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0);
      begin();
      SEGS.forEach((S, i) => { if (t >= S.t0 && t < S.end) [drawA, drawB, drawC][i](t, S, pass); });
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
