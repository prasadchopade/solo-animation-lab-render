// The Woman Without a Face, part 1 of 4 (lab clip 15): the Phantom of Heilbronn told as a test, in linocut. You're a
// detective: one woman's DNA has turned up at forty crime scenes in three countries over sixteen years. Here's where:
// a cup, a cookie, a toy pistol, a heroin syringe, a stolen car, a police officer's murder. Who is she? A serial
// killer, a petty thief, or more than one person? Police believed both of the first two. But the people who saw her?
// Some said she looked like a man. (Part 4 answers: more than one person. The DNA was on the swabs.)
// Every figure is invented; sources in lab/research.md, Round 3. Black ink on bone paper, one red, re-carved on threes.
// Beats are keyed to the placed narration (window.VO, WORDS). Words on screen: numbers, names, the test, evidence tags.
// Type: IM Fell English for words; Fraunces for numbers and dated tags (its numerals are lining, so 40 reads as 40).
(() => {
  const { lerp, seg, rs, drawing } = LAB;
  const { L, shape, cut, gougePath, print, begin } = LINO;
  C.fonts = ['400 96px Fell', '700 96px Fraunces'];
  const N = 3;
  const ease = (k) => k * k * (3 - 2 * k);

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const MAP = T0('n02') - 0.1, TITLE = word('n02', 'they') - 0.1, EVID = T0('n03') - 0.1;
  const ITEM = [T0('n04b') - 0.35, T0('n05') - 0.35, T0('n06') - 0.35, T0('n07') - 0.35, word('n07', 'stolen') - 0.4, T0('n08') - 0.35];   // each print lands in the pause before its word
  const TEST = T0('n09') - 0.1, CARD = [word('n10', 'serial') - 0.1, word('n10', 'petty') - 0.1, word('n10', 'or') - 0.1];
  const CLOCK0 = T1('n10') + 0.05, CLOCK1 = T0('n11') - 0.05, TICK = [word('n11', 'killer'), word('n11', 'thief')];
  const WIT = T0('n12') - 0.1, MAN = T0('n13') - 0.1, NEXT = T1('n13') + 0.35;

  // ------------------------------------------------------------------ type, strokes, tags
  const FELL = '400 %px Fell', NUM = '700 %px Fraunces';
  function type(s, x, y, size, layer = 'ink', font = FELL, align = 'center') { const g = L[layer].g; g.save(); g.fillStyle = '#000'; g.font = font.replace('%', size); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
  function typeCut(s, x, y, size) { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = FELL.replace('%', size); g.textAlign = 'center'; g.fillText(s, x, y); g.restore(); }
  const ink = (pts, w, layer = 'ink') => { const g = L[layer].g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(pts, 8), w); g.restore(); };
  const hole = (p) => { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.fill(); g.restore(); };
  const oval = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const box = (x, y, w, h) => [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
  const measure = (s, size, font = FELL) => { const g = L.ink.g; g.save(); g.font = font.replace('%', size); const w = g.measureText(s).width; g.restore(); return w; };
  function tag(s, x, y, size = 50, font = FELL) {                   // an evidence tag: a paper card with an inked edge
    const w = measure(s, size, font) + 48, h = size + 28;
    shape('ink', box(x, y, w + 10, h + 10), `tag${s}`, 1.2, 10); hole(box(x, y, w, h));
    type(s, x, y + size * 0.34, size, 'ink', font);
  }
  // draw fn() scaled by z about (ax, ay), moved to (bx, by): the print pushes in; text drawn after stays put
  function view(z, ax, ay, bx, by, fn) {
    for (const k of ['ink', 'red']) L[k].g.setTransform(z, 0, 0, z, bx - ax * z, by - ay * z);
    try { fn(); } finally { for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0); }
  }
  const pop = (t, t0) => 1 + 0.08 * (1 - ease(seg(t, t0, t0 + 0.14)));   // a print slapped down: a touch big, then settled

  // ------------------------------------------------------------------ the woman without a face, and the man
  // Her hair falls at the sides to the shoulders and stays open below the chin (the neck shows), so it reads as hair,
  // never as a head covering. The face is an outline with nothing in it (a jawline alone read as a grin).
  function woman(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'w' + pass;
    shape('ink', P([[-178, 330], [-170, 178], [-126, 130], [-58, 114], [0, 182], [58, 114], [126, 130], [170, 178], [178, 330]]), `wcoat${k}`, 2);
    const crown = oval(0, -12, 86, 106, 22, Math.PI * 0.93, Math.PI * 2.07);
    const right = [[88, 24], [100, 92], [114, 162], [90, 180], [72, 112], [64, 40], [60, -22]];
    const left = [[-60, -22], [-64, 40], [-72, 112], [-90, 180], [-114, 162], [-100, 92], [-88, 24]];
    shape('ink', P([...crown, ...right, [40, -56], [0, -64], [-40, -56], ...left]), `whair${k}`, 2.5);
    ink(P(oval(0, 8, 64, 86, 30)), 5 * s);                                                            // the face's outline, and nothing in it
    cut(LAB.resample(P([[-16, -114], [-10, -70]]), 6), 4 * s + 1);                                      // a parting
    for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) cut(LAB.resample(P([[sx * (66 + j * 9), -40 + j * 8], [sx * (80 + j * 8), 50], [sx * (92 + j * 6), 150]]), 6), 3 * s + 1);
  }
  function man(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'm' + pass;
    shape('ink', P([[-190, 330], [-180, 166], [-122, 118], [-46, 104], [46, 104], [122, 118], [180, 166], [190, 330]]), `mcoat${k}`, 2);
    hole(P([[-40, 106], [40, 106], [12, 222], [-12, 222]]));
    shape('ink', P([[-16, 110], [16, 110], [10, 172], [-10, 172]]), `mtie${k}`, 1.5);
    ink(P([[-24, 64], [-26, 106]]), 5 * s); ink(P([[24, 64], [26, 106]]), 5 * s);
    hole(P(oval(0, 0, 70, 88, 30))); ink(P(oval(0, 0, 70, 88, 30)), 5 * s);                            // a face outline, and nothing in it
    shape('ink', P([...oval(0, -6, 76, 94, 18, Math.PI * 1.02, Math.PI * 1.98), [74, -24], [62, -50], [0, -60], [-62, -50], [-74, -24]]), `mhair${k}`, 2);
    ink(P(oval(-80, 4, 10, 18, 12, -1.6, 1.6)), 4 * s); ink(P(oval(80, 4, 10, 18, 12, 1.55, 4.7)), 4 * s);
  }

  // ------------------------------------------------------------------ the evidence, carved
  function helix(cx, cy, s, layer = 'red') {                      // her DNA: two strands and their rungs
    const A = [], B = [];
    for (let i = 0; i <= 48; i++) { const u = i / 48, y = cy + (u - 0.5) * 360 * s, ph = u * 4 * Math.PI; A.push([cx + Math.sin(ph) * 64 * s, y]); B.push([cx - Math.sin(ph) * 64 * s, y]); }
    ink(A, 10 * s + 2, layer); ink(B, 10 * s + 2, layer);
    for (let i = 3; i < 48; i += 4) ink([A[i], B[i]], 5 * s + 1, layer);
  }
  function stamp(t, t0) {                                          // SAME DNA, slammed on in red
    if (t < t0) return;
    const sc = 1 + 0.35 * (1 - seg(t, t0, t0 + 0.09)), w = measure('SAME DNA', 58), g = L.red.g;
    g.save(); g.translate(735, 640); g.rotate(-0.12); g.scale(sc, sc); g.fillStyle = '#000';
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
    hole(P(oval(128, -98, 76, 76, 22)));                           // a bite out of it
    for (const [x, y] of [[-64, -44], [12, 34], [-34, 86], [64, 70], [-92, 30], [22, -64], [-20, -110]]) hole(P(oval(x, y, 15, 11, 10)));
  }
  function pistol(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'pi' + pass;
    shape('ink', P([[-170, -70], [150, -70], [150, -14], [-40, -14], [-56, 20], [-20, 150], [-104, 160], [-150, 30], [-176, 10]]), `pib${k}`, 2);
    ink(P(oval(-6, 24, 34, 30, 16, -0.2, 3.3)), 9 * s);           // the trigger guard
    shape('red', P([[150, -74], [206, -74], [206, -10], [150, -10]]), `pit${k}`, 1.5);   // the toy's coloured tip
    cut(LAB.resample(P([[-140, -50], [120, -50]]), 8), 6 * s);
  }
  function syringe(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'sy' + pass;
    const g = L.ink.g; g.save(); g.translate(cx, cy); g.rotate(-0.42); g.translate(-cx, -cy);
    shape('ink', P(box(-20, 0, 300, 96)), `syo${k}`, 1.2); hole(P(box(-20, 0, 276, 72)));   // the barrel
    shape('ink', P(box(-60, 0, 196, 72)), `syl${k}`, 1);           // what's in it
    for (let i = 0; i < 6; i++) ink(P([[-120 + i * 40, -36], [-120 + i * 40, -12]]), 4 * s);
    shape('ink', P(box(-200, 0, 60, 24)), `syr${k}`, 1); shape('ink', P(box(-236, 0, 16, 110)), `syt${k}`, 1);   // the plunger
    shape('ink', P(box(150, 0, 40, 40)), `syh${k}`, 1); ink(P([[170, 0], [330, 0]]), 6 * s);   // the needle
    g.restore();
  }
  function car(cx, cy, s, pass) {
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'car' + pass;
    shape('ink', P([[-250, 44], [-240, -12], [-160, -34], [-96, -110], [96, -110], [160, -34], [238, -22], [250, 44], [220, 74], [-220, 74]]), `carb${k}`, 2);
    hole(P([[-84, -94], [-10, -94], [-10, -40], [-134, -40]])); hole(P([[10, -94], [84, -94], [134, -40], [10, -40]]));
    for (const x of [-150, 150]) { shape('ink', P(oval(x, 74, 52, 52, 20)), `wh${x}${k}`, 1.5); hole(P(oval(x, 74, 22, 22, 12))); }
  }
  function badge(cx, cy, s, pass) {                                // a police badge: a shield, a star; no real emblem
    const P = (a) => a.map(([x, y]) => [cx + x * s, cy + y * s]), k = 'bd' + pass;
    const shield = [[0, -184], [64, -164], [154, -134], [150, 30], [96, 120], [0, 182], [-96, 120], [-150, 30], [-154, -134], [-64, -164]];
    shape('ink', P(shield), `bdo${k}`, 2);
    hole(P(shield.map(([x, y]) => [x * 0.8, y * 0.8 + 4])));
    const star = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 40 : 96, a = -Math.PI / 2 + i * Math.PI / 5; return [Math.cos(a) * r, Math.sin(a) * r + 4]; });
    shape('ink', P(star), `bds${k}`, 1);                          // ink, not red: a red star reads as a political symbol
  }

  // ------------------------------------------------------------------ the map: forty scenes, no borders
  const DOTS = Array.from({ length: 40 }, (_, i) => {              // three loose clusters, denser in the middle
    const c = [[560, 830, 190, 140], [810, 1120, 110, 110], [250, 1140, 120, 130]][i % 3];
    return [c[0] + (rs('dx', i) + rs('ex', i)) * 0.5 * c[2], c[1] + (rs('dy', i) + rs('ey', i)) * 0.5 * c[3]];
  });
  function map(t, pass) {
    const n = Math.min(40, Math.max(0, Math.floor((t - MAP - 0.2) / 0.04) + 1));
    for (let i = 0; i < n; i++) shape('red', oval(DOTS[i][0], DOTS[i][1], 14, 14, 10), `dot${i}${pass}`, 1, 6);
    type('GERMANY', 560, 640, 42); type('AUSTRIA', 810, 1300, 42); type('FRANCE', 250, 1340, 42);
    type(String(n), 505, 430, 150, 'ink', NUM); type(n === 1 ? 'CRIME SCENE' : 'CRIME SCENES', 505, 505, 56);
    if (n >= 40) type('1993 – 2009', 505, 1470, 72, 'ink', NUM);
  }

  // ------------------------------------------------------------------ the test
  function testCard(letter, text, y) {
    const w = 800, h = 150;
    shape('ink', box(505, y, w + 12, h + 12), `card${letter}`, 1.2, 10); hole(box(505, y, w, h));
    shape('ink', oval(190, y, 50, 50, 22), `cl${letter}`, 1); typeCut(letter, 190, y + 22, 64);
    type(text, 262, y + 20, text.length > 16 ? 44 : 60, 'ink', FELL, 'left');
  }
  function clockFace(t) {
    ink(oval(505, 575, 58, 58, 32), 7); ink([[505, 575], [505, 535]], 6);
    const a = -Math.PI / 2 + Math.PI * 2 * seg(t, CLOCK0, CLOCK1);
    ink([[505, 575], [505 + Math.cos(a) * 46, 575 + Math.sin(a) * 46]], 7, 'red');
  }
  const tick = (x, y) => ink([[x - 30, y], [x - 8, y + 24], [x + 34, y - 30]], 12, 'red');

  LAB.film({
    draw(g, t) {
      const pass = drawing(t, N);
      for (const k of ['ink', 'red']) L[k].g.setTransform(1, 0, 0, 1, 0, 0);
      begin();
      if (t < MAP) {                                               // frame 0: a woman with no face, and the claim
        view(1 + 0.05 * seg(t, 0, MAP), 505, 1000, 505, 1000, () => woman(505, 1120, 2.3, pass));
        type('40', 505, 440, 150, 'ink', NUM); type('CRIME SCENES.', 505, 525, 76); type('ONE WOMAN.', 505, 600, 64, 'red');
      } else if (t < TITLE) {                                      // three countries, sixteen years: the dots counted in
        map(t, pass);
      } else if (t < EVID) {                                       // the title
        view(pop(t, TITLE), 505, 1080, 505, 1080, () => woman(505, 1090, 1.6, pass));
        type('THE WOMAN', 505, 380, 92); type('WITHOUT A FACE', 505, 470, 92); type('PART 1', 505, 545, 44, 'red', NUM);
      } else if (t < ITEM[0]) {                                    // here's where her DNA turned up
        view(pop(t, EVID), 505, 920, 505, 920, () => helix(505, 920, 1.6));
        type('HER DNA', 505, 400, 96);
      } else if (t < TEST) {                                       // the evidence, one print each, all stamped the same
        const i = ITEM.filter((x) => t >= x).length - 1;
        const draw = [cup, cookie, pistol, syringe, car, badge][i], label = ['MURDER · 1993', 'BREAK-IN', 'ROBBERY · FRANCE', 'HEROIN', 'STOLEN CAR', 'POLICE OFFICER · 2007'][i];
        view(pop(t, ITEM[i]), 505, 940, 505, 940, () => draw(505, 940, i === 4 ? 1.45 : 1.6, pass));
        const dated = /\d/.test(label);
        tag(label, 505, 1330, dated ? 46 : 52, dated ? NUM : FELL);
        stamp(t, ITEM[i] + 0.12);
      } else if (t < WIT) {                                        // who is she? the cards, the clock, then the police's answer
        type('WHO IS SHE?', 505, 400, 96);
        if (t >= CLOCK0 - 0.3) clockFace(t);
        const cards = [['A', 'A SERIAL KILLER', 760], ['B', 'A PETTY THIEF', 960], ['C', 'MORE THAN ONE PERSON', 1160]];
        cards.forEach(([l, s, y], i) => { if (t >= CARD[i]) testCard(l, s, y); });
        TICK.forEach((x, i) => { if (t >= x) tick(860, cards[i][2]); });
      } else if (t < MAN) {                                        // but the people who saw her?
        view(1 + 0.04 * seg(t, WIT, MAN), 505, 1000, 505, 1000, () => woman(505, 1100, 2.0, pass));
      } else {                                                     // some said she looked like a man
        woman(300, 960, 1.2, pass);
        if (t >= MAN + 0.25) view(pop(t, MAN + 0.25), 705, 960, 705, 960, () => man(705, 960, 1.2, pass));
        if (t >= NEXT) { type('PART 2', 505, 1440, 64, 'red', NUM); type('THE PROFILE', 505, 1505, 56); }
      }
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
