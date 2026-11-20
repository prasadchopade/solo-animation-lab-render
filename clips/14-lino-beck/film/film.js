// Which One Is Him? (lab clip 14): a real case as a test, in linocut. You're the witness: remember the man who took
// your rings (grey hair, a waxed moustache, a top hat). The police show you six men; only one has grey hair and a
// moustache, and you pick him, as the women did in Victorian London: Adolf Beck, who wasn't the swindler. The real
// line-up (about a dozen men off the street) gave them only one man to match. Prison twice, the real swindler caught in
// 1904, a court of appeal, and today's rule: in a fair line-up every face fits the description.
// Every face here is invented (no real likeness); sources in lab/research.md, section 14. Black ink on bone paper, one
// red, re-carved on threes. Beats are keyed to the placed narration (window.VO, WORDS). Words on screen are names,
// numbers, the test's question and evidence tags, not a caption of the narration (version 2, after a fresh review).
(() => {
  const { W, H, clamp, lerp, seg, rs, drawing } = LAB;
  const { L, shape, cut, gougePath, print, begin } = LINO;
  C.fonts = ['400 96px Fell'];
  const N = 3;
  const ease = (k) => k * k * (3 - 2 * k);

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const has = (id) => VO.some((v) => v.id === id);
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const N5 = has('n05b') ? 'n05b' : 'n05';
  const FEATURES = T0('n02'), PARADE = T0('n03') - 0.1, FOUR = T0(N5), RING0 = FOUR - 0.4;
  const NAME = word('n06', 'adolf'), NOT = word('n06', 'he'), ONLY = T0('n07') - 0.1;
  const MATCH1 = T0('n08') - 0.1, MATCH2 = word('n08', 'line') - 0.2;
  const PRISON = T1('n08') + 0.06, REALSW = word('n09', 'real') - 0.15, CAUGHT = word('n09', 'caught');
  const COURT = T1('n09') + 0.06, FAIR = T0('n11') - 0.1, TICKS = word('n11', 'every');

  // ------------------------------------------------------------------ type, strokes, tags
  function type(s, x, y, size, layer = 'ink') { const g = L[layer].g; g.save(); g.fillStyle = '#000'; g.font = `400 ${size}px Fell`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
  const ink = (pts, w, layer = 'ink') => { const g = L[layer].g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(pts, 8), w); g.restore(); };
  const hole = (p) => { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.fill(); g.restore(); };
  const oval = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const box = (x, y, w, h) => [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
  const measure = (s, size) => { const g = L.ink.g; g.save(); g.font = `400 ${size}px Fell`; const w = g.measureText(s).width; g.restore(); return w; };
  // an evidence tag: a paper card with an inked edge, its word, and a red string to what it marks
  function tag(s, x, y, to, size = 46) {
    const w = measure(s, size) + 44, h = size + 26;
    if (to) ink([[x, y + (to[1] > y ? h / 2 : -h / 2)], to], 6, 'red');
    shape('ink', box(x, y, w + 10, h + 10), `tag${s}`, 1.2, 10); hole(box(x, y, w, h));
    type(s, x, y + size * 0.34, size);
  }
  // a number card held at the chest, as in a line-up photograph
  function card(n, x, y, s = 1) { shape('ink', box(x, y, 88 * s, 88 * s), `card${n}`, 1, 10); hole(box(x, y, 74 * s, 74 * s)); type(String(n), x, y + 22 * s, 64 * s); }
  // draw fn() scaled by z about (ax, ay), with (ax, ay) moved to (bx, by): the print pushes in; text drawn later stays put
  function view(z, ax, ay, bx, by, fn) {
    for (const k of ['ink', 'red']) L[k].g.setTransform(z, 0, 0, z, bx - ax * z, by - ay * z);
    try { fn(); } finally { for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0); }
  }

  // ------------------------------------------------------------------ a person, carved: P = { grey, mous, face, hat, hair, beard, bust, legs, seed }
  function person(cx, cy, s, P, pass) {
    const X = (x) => cx + x * s, Y = (y) => cy + y * s, pts = (a) => a.map(([x, y]) => [X(x), Y(y)]), k = P.seed + '-' + pass;
    const rx = P.face === 'thin' ? 58 : P.face === 'round' ? 74 : 68, ry = P.face === 'thin' ? 86 : 80;
    const fine = Math.max(1.8, 2.4 * s + 0.6);                     // the thinnest line that still prints at this size
    if (P.legs) {                                                  // standing: trousers and boots below the coat
      shape('ink', pts([[-62, 330], [-6, 330], [-12, 600], [-60, 600]]), `legl${k}`, 1.5);
      shape('ink', pts([[6, 330], [62, 330], [60, 600], [12, 600]]), `legr${k}`, 1.5);
      shape('ink', pts([[-76, 594], [-6, 594], [-6, 624], [-82, 624]]), `bootl${k}`, 1.2);
      shape('ink', pts([[6, 594], [76, 594], [82, 624], [6, 624]]), `bootr${k}`, 1.2);
    }
    // the coat, the shirt front and a dark cravat
    const cb = P.bust ? 205 : 340;
    shape('ink', pts([[-160, 150], [-70, 106], [70, 106], [160, 150], [166, cb], [-166, cb]]), `coat${k}`, 2);
    hole(pts([[-46, 108], [46, 108], [16, Math.min(230, cb)], [-16, Math.min(230, cb)]]));
    shape('ink', pts([[-20, 112], [20, 112], [12, 170], [-12, 170]]), `tie${k}`, 1.5);
    // the face: an outline, ears, the neck
    ink(pts([[-24, 70], [-26, 112]]), 5 * s); ink(pts([[24, 70], [26, 112]]), 5 * s);
    ink(pts(oval(0, 0, rx, ry, 30)), 5 * s);
    ink(pts(oval(-rx - 6, 6, 10, 18, 12, -1.6, 1.6)), 4 * s); ink(pts(oval(rx + 6, 6, 10, 18, 12, 1.55, 4.7)), 4 * s);
    // the hair: dark is solid ink; grey is its outer edge and strands combed over from a parting, mostly paper
    if (P.hair === 'bald') for (const sx of [-1, 1]) shape('ink', pts([[sx * (rx - 4), -30], [sx * (rx + 8), -10], [sx * (rx + 6), 30], [sx * (rx - 6), 20]]), `tuft${sx}${k}`, 1.5);
    else if (!P.grey) shape('ink', pts([...oval(0, -6, rx + 6, ry + 6, 18, Math.PI * 1.02, Math.PI * 1.98), [rx + 4, -20], [rx - 10, -46], [0, -ry * 0.62], [-rx + 10, -46], [-rx - 4, -20]]), `hair${k}`, 2);
    else if (!P.hat) {
      ink(pts(oval(0, -6, rx + 6, ry + 6, 16, Math.PI * 1.06, Math.PI * 1.94)), 3.4 * s + 1);
      const part = -rx * 0.35;                                     // a side parting: strands sweep away from it
      for (let i = 0; i < 15; i++) {
        const u = i / 14, x0 = part + (u - 0.35) * 18, y0 = -ry * 0.98 + Math.abs(u - 0.35) * 10;
        const side = u < 0.35 ? -1 : 1, x1 = side < 0 ? lerp(-rx * 0.55, -rx - 2, (0.35 - u) / 0.35) : lerp(part + 20, rx + 2, (u - 0.35) / 0.65);
        const y1 = -ry * 0.5 + Math.abs(x1) * 0.42 + rs('hs', P.seed, i) * 5;
        ink(pts([[x0, y0], [(x0 + x1) / 2 + side * 6, Math.min(y0, y1) - 4], [x1, y1]]), fine);
      }
    }
    if (P.grey && P.hat) for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) {   // under a hat: grey at the sides, down to the ears
      const x0 = sx * (rx - 14 + i * 4);
      ink(pts([[x0, -ry + 16], [x0 + sx * 6, -ry * 0.55 + i * 6], [sx * (rx + 1), -6 + i * 4]]), fine);
    }
    // brows, eyes, the nose
    for (const sx of [-1, 1]) {
      ink(pts([[sx * 14, -22], [sx * 40, -26]]), (P.grey ? 5 : 7) * s);
      shape('ink', pts(oval(sx * 27, -8, 8, 5, 10)), `eye${sx}${k}`, 0.6);
    }
    ink(pts([[6, -14], [10, 22], [-2, 30]]), 4 * s);
    // the moustache: dark is a solid shape; grey is bristles fanning out from under the nose (a closed outline read as
    // teeth), with the waxed one's points curling up
    if (P.mous === 'none') ink(pts([[-16, 50], [16, 50]]), 4 * s);
    else if (!P.grey) shape('ink', pts([[-50, 52], [-44, 36], [-16, 32], [0, 36], [16, 32], [44, 36], [50, 52], [20, 58], [0, 54], [-20, 58]]), `mo${k}`, 1.2);
    else {
      for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6; ink(pts([[sx * (4 + 28 * u), 35 + 2 * u], [sx * (10 + 40 * u), 51 + 4 * u]]), fine + 0.4); }
      for (const sx of [-1, 1]) ink(pts(P.mous === 'waxed' ? [[sx * 46, 50], [sx * 62, 44], [sx * 72, 30], [sx * 68, 16]] : [[sx * 54, 50], [sx * 46, 36], [sx * 20, 32]]), 3 * s + 1);
    }
    if (P.beard) shape('ink', pts([[-rx + 6, 30], [-30, ry + 6], [30, ry + 6], [rx - 6, 30], [30, 70], [-30, 70]]), `beard${k}`, 2);
    // a top hat
    if (P.hat) { shape('ink', pts([[-66, -ry + 8], [-56, -ry - 120], [56, -ry - 120], [66, -ry + 8]]), `crown${k}`, 1.5); shape('ink', pts([[-100, -ry + 14], [100, -ry + 14], [92, -ry - 2], [-92, -ry - 2]]), `brim${k}`, 1.5); cut(LAB.resample(pts([[-40, -ry - 100], [-34, -ry - 10]]), 6), 6); }
  }

  // ------------------------------------------------------------------ the people
  const SWINDLER = { grey: true, mous: 'waxed', face: 'thin', hat: true, seed: 1 };
  const BECK = { grey: true, mous: 'bushy', face: 'round', seed: 4, bust: true };
  const LINE = [                                                   // your test: six men, only number four fits
    { grey: false, mous: 'none', face: 'square', seed: 11, bust: true }, { grey: false, mous: 'dark', face: 'thin', seed: 12, bust: true }, { grey: false, mous: 'none', face: 'round', hair: 'bald', seed: 13, bust: true },
    BECK, { grey: false, mous: 'none', face: 'thin', beard: true, seed: 15, bust: true }, { grey: false, mous: 'none', face: 'square', seed: 16, bust: true },
  ];
  const REAL = Array.from({ length: 12 }, (_, i) => i === 7 ? { ...BECK, bust: false, legs: true }   // the real line: a dozen men off the street
    : { grey: false, mous: ['none', 'dark', 'none', 'none'][i % 4], face: ['thin', 'square', 'round'][i % 3], beard: i === 4 || i === 10, seed: 50 + i, legs: true });
  const FAIRLINE = [1, 2, 3, 4, 5, 6].map((i) => ({ grey: true, mous: i % 2 ? 'bushy' : 'waxed', face: ['thin', 'round', 'square'][i % 3], seed: 30 + i, bust: true }));
  const GS = 1.12, GRID = [[215, 700], [505, 700], [795, 700], [215, 1120], [505, 1120], [795, 1120]];   // 1-3 on top, 4-6 below
  const RX = (i) => 120 + 150 * i, RY = 800, RS = 0.72;        // the real line: twelve standing men, wider than the frame
  const PAN = (t) => -665 * ease(seg(t, ONLY, MATCH1 - 0.3));     // the view slides along them and stops with Beck (7) in the middle

  function grid(people, pass, t, t0, only = -1) {                  // head-and-shoulders, printed in one by one, with number cards
    people.forEach((P, i) => {
      if (t < t0 + 0.1 * i) return;
      if (only >= 0 && i !== only) return;
      person(GRID[i][0], GRID[i][1], GS, P, pass); card(i + 1, GRID[i][0], GRID[i][1] + 185 * GS, 0.95);
    });
  }
  function ring(x, y, rx, ry, k, w = 12) {                         // a red ring, carved round as k goes 0 to 1
    if (k <= 0) return;
    const g = L.red.g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(oval(x, y, rx, ry, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k), 8), w); g.restore();
  }
  function realLine(pass, t, keep = -1, gone = 0) {                 // the floor, then the men, the view sliding along them
    const dx = keep >= 0 ? -665 : PAN(t);
    ink([[0, RY + 625 * RS], [W, RY + 625 * RS]], 4);
    const order = [4, 10, 5, 9, 6, 8, 3, 11, 2, 1, 0];            // who goes first when they drop away: outside in
    REAL.forEach((P, i) => {
      if (keep >= 0 && i !== keep && order.indexOf(i) < gone) return;
      if (RX(i) + dx < -150 || RX(i) + dx > W + 150) return;
      person(RX(i) + dx, RY, RS, P, pass);
    });
  }

  LAB.film({
    draw(g, t) {
      const pass = drawing(t, N);
      for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0);
      begin();
      if (t < PARADE) {                                            // remember him (frame 0: his face, big); his description, tagged
        view(1 + 0.04 * seg(t, 0, PARADE), 505, 1000, 505, 1000, () => person(505, 1080, 2.5, SWINDLER, pass));
        type('REMEMBER HIM.', 505, 380, 94); type('LONDON, 1895', 505, 460, 54);
        if (t >= FEATURES) { tag('GREY HAIR', 190, 760, [362, 958]); tag('MOUSTACHE', 790, 1196, [690, 1128]); }
      } else if (t < NOT) {                                        // your line of six; you pick; four is Adolf Beck
        const push = 1 + 0.12 * seg(t, FOUR, NAME - 0.1), kz = ease(seg(t, NAME - 0.1, NAME + 0.35));
        const z = push + 0.78 * kz, bx = lerp(GRID[3][0], 505, kz), by = lerp(GRID[3][1], 880, kz);
        view(z, GRID[3][0], GRID[3][1], bx, by, () => {
          grid(LINE, pass, t, PARADE, t >= NAME - 0.1 ? 3 : -1);
          ring(GRID[3][0] - 4, GRID[3][1] + 10, 116, 150, seg(t, RING0, FOUR - 0.08));
        });
        if (t < FOUR) type('WHICH ONE IS HIM?', 505, 400, 84); else type('NUMBER FOUR?', 505, 400, 96);
        if (t >= NAME) type('ADOLF BECK', 505, 1470, 84, 'red');
      } else if (t < ONLY) {                                       // he wasn't the swindler: the two side by side
        person(290, 840, 1.45, BECK, pass);
        person(710, 860, 1.45, { ...SWINDLER, bust: true }, pass);
        for (const dy of [-16, 16]) shape('red', box(510, 850 + dy, 76, 13), `ne${dy}${pass}`, 1, 8);
        ink([[482, 900], [538, 800]], 12, 'red');
        type('ADOLF BECK', 280, 1250, 46); type('THE SWINDLER', 720, 1250, 46);
      } else if (t < MATCH1) {                                     // the real line-up, about a dozen men: one grey, with a moustache
        realLine(pass, t);
        const bx = RX(7) + PAN(t);                                 // ringed once he's in view
        ring(bx, RY - 4, 84, 104, seg(bx, 960, 760), 10);
        type('THE REAL LINE-UP', 505, 400, 84);
      } else if (t < MATCH2) {                                     // what the women remembered
        person(505, 1080, 2.5, SWINDLER, pass);
        tag('GREY HAIR', 190, 760, [362, 958]); tag('MOUSTACHE', 790, 1196, [690, 1128]);
      } else if (t < PRISON) {                                     // the line gave them one man to match: the rest drop away
        realLine(pass, t, 7, Math.floor((t - MATCH2) / 0.06));
        ring(505, RY - 4, 84, 104, 1, 10);
        if (t >= MATCH2 + 0.7) tag('ONE MATCH', 505, 1390, [505, RY + 630 * RS]);
      } else if (t < REALSW) {                                     // prison, twice: the bars printed in with the lock
        person(505, 1000, 1.9, BECK, pass);
        for (let k = 0; k < 6; k++) if (t >= PRISON + 0.04 * k) shape('ink', [[230 + k * 112, 600], [254 + k * 112, 600], [254 + k * 112, 1390], [230 + k * 112, 1390]], `bar${k}${pass}`, 1.5);
        type('1896 · 1904', 505, 1490, 72);
      } else if (t < COURT) {                                      // the real swindler; on "caught", the stamp
        person(505, 960, 1.9, { ...SWINDLER, bust: true }, pass);
        if (t >= CAUGHT) {
          const sc = 1 + 0.3 * (1 - seg(t, CAUGHT, CAUGHT + 0.09)), w = measure('CAUGHT, 1904', 80), gr = L.red.g;
          gr.save(); gr.translate(505, 1452); gr.rotate(-0.05); gr.scale(sc, sc); gr.fillStyle = '#000';
          gr.fillRect(-w / 2 - 22, -58, w + 44, 9); gr.fillRect(-w / 2 - 22, 46, w + 44, 9);
          gr.font = '400 80px Fell'; gr.textAlign = 'center'; gr.fillText('CAUGHT, 1904', 0, 28); gr.restore();
        }
      } else if (t < FAIR) {                                       // the court of appeal, printed in with the gavel
        shape('ink', [[150, 880], [860, 880], [900, 940], [110, 940]], `pedi${pass}`, 2);
        shape('ink', [[505, 700], [880, 880], [130, 880]], `roof${pass}`, 2);
        for (let k = 0; k < 6; k++) if (t >= COURT + 0.05 * k) { const x = 190 + k * 126; shape('ink', [[x, 950], [x + 46, 950], [x + 46, 1300], [x, 1300]], `col${k}${pass}`, 1.5); cut(LAB.resample([[x + 14, 970], [x + 14, 1280]], 12), 6); }
        shape('ink', [[100, 1300], [910, 1300], [930, 1350], [80, 1350]], `step${pass}`, 2);
        type('COURT OF', 505, 400, 96); type('CRIMINAL APPEAL', 505, 490, 84); type('1907', 505, 1450, 72);
      } else {                                                     // a fair line-up: every face fits the description, ticked
        grid(FAIRLINE, pass, t, FAIR + 0.1);
        FAIRLINE.forEach((_, i) => { if (t >= TICKS + 0.15 * i) { const [x, y] = GRID[i]; ink([[x + 78, y - 92], [x + 94, y - 74], [x + 128, y - 118]], 11, 'red'); } });
        type('A FAIR LINE-UP', 505, 400, 88);
      }
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
