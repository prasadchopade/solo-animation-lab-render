// Which One Is Him? (lab clip 14): a real case as a test, in linocut. London, 1896: you're the witness. Remember the
// man who stole your rings (grey hair, a waxed moustache). The police show you six men; only one has grey hair and a
// moustache. You pick him, as the women did: Adolf Beck, who wasn't the swindler. The line gave them only one man to
// match. Prison twice, the real swindler caught in 1904, a court of appeal, and today's rule: every face in a fair
// lineup should fit the description. Every face here is invented (no real likeness); sources in lab/research.md.
// Black ink on bone paper, one red, re-carved on threes. Beats keyed to the placed narration (window.VO, WORDS).
(() => {
  const { W, H, clamp, lerp, seg, rnd, rs, held, drawing } = LAB;
  const { L, shape, cut, carve, gougePath, print, begin } = LINO;
  C.fonts = ['400 96px Fell'];
  const N = 3;

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const FEATURES = T0('n02'), PARADE = T0('n03') - 0.1, ASK = T0('n04'), FOUR = T0('n05'), NAME = word('n06', 'adolf');
  const NOT = word('n06', 'he'), ONLY = T0('n07'), MATCH = T0('n08'), PRISON = T0('n09') - 0.1, CAUGHT = word('n09', 'caught');
  const COURT = T0('n10') - 0.1, FAIR = T0('n11') - 0.1;

  // ------------------------------------------------------------------ type and strokes
  function type(s, x, y, size, layer = 'ink') { const g = L[layer].g; g.save(); g.fillStyle = '#000'; g.font = `400 ${size}px Fell`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
  const ink = (pts, w, layer = 'ink') => { const g = L[layer].g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(pts, 8), w); g.restore(); };
  const hole = (p) => { const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.fill(); g.restore(); };
  const oval = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

  // ------------------------------------------------------------------ a person, carved: P = { grey, mous, face, hat, hair, seed }
  function person(cx, cy, s, P, pass) {
    const X = (x) => cx + x * s, Y = (y) => cy + y * s, pts = (a) => a.map(([x, y]) => [X(x), Y(y)]), k = P.seed + '-' + pass;
    const rx = P.face === 'thin' ? 58 : P.face === 'round' ? 74 : 68, ry = P.face === 'thin' ? 86 : 80;
    // the coat, the shirt front and a dark cravat
    const cb = P.bust ? 205 : 340;
    shape('ink', pts([[-160, 150], [-70, 106], [70, 106], [160, 150], [166, cb], [-166, cb]]), `coat${k}`, 2);
    hole(pts([[-46, 108], [46, 108], [16, 230], [-16, 230]]));
    shape('ink', pts([[-20, 112], [20, 112], [12, 170], [-12, 170]]), `tie${k}`, 1.5);
    // the face: an outline, ears, the neck
    ink(pts([[-24, 70], [-26, 112]]), 5 * s); ink(pts([[24, 70], [26, 112]]), 5 * s);
    ink(pts(oval(0, 0, rx, ry, 30)), 5 * s);
    ink(pts(oval(-rx - 6, 6, 10, 18, 12, -1.6, 1.6).map(([x, y]) => [x, y])), 4 * s); ink(pts(oval(rx + 6, 6, 10, 18, 12, 1.55, 4.7)), 4 * s);
    // the hair: grey is carved with fine white cuts, dark is solid ink
    if (P.hair !== 'bald') {
      const top = pts([...oval(0, -6, rx + 6, ry + 6, 18, Math.PI * 1.02, Math.PI * 1.98), [rx + 4, -20], [rx - 10, -46], [0, -ry * 0.62], [-rx + 10, -46], [-rx - 4, -20]]);
      if (!P.grey) shape('ink', top, `hair${k}`, 2);
      else {                                                       // grey: the hair's outline and fine strands, mostly paper
        ink([...top, top[0]], 4 * s + 1);
        for (let i = 0; i < 14; i++) { const u = (i + 0.5) / 14, x = -rx + 2 * rx * u, y0 = -ry * (0.55 + 0.4 * Math.sin(Math.PI * u)); ink(pts([[x - 6, y0 + 4], [x + 4, -24 - 18 * Math.sin(Math.PI * u)]]), 2.4 * s + 0.6); }
      }
    } else for (const sx of [-1, 1]) shape('ink', pts([[sx * (rx - 4), -30], [sx * (rx + 8), -10], [sx * (rx + 6), 30], [sx * (rx - 6), 20]]), `tuft${sx}${k}`, 1.5);
    // brows, eyes, the nose
    for (const sx of [-1, 1]) {
      ink(pts([[sx * 14, -22], [sx * 40, -26]]), (P.grey ? 5 : 7) * s);
      shape('ink', pts(oval(sx * 27, -8, 8, 5, 10)), `eye${sx}${k}`, 0.6);
    }
    ink(pts([[6, -14], [10, 22], [-2, 30]]), 4 * s);
    // the moustache: waxed (thin, the points turned up) or bushy; grey is cut through with white
    const MO = P.mous === 'waxed' ? [[-6, 38], [-30, 40], [-58, 32], [-74, 18], [-56, 44], [-24, 52], [0, 46], [24, 52], [56, 44], [74, 18], [58, 32], [30, 40], [6, 38]]
      : [[-50, 52], [-44, 36], [-16, 32], [0, 36], [16, 32], [44, 36], [50, 52], [20, 58], [0, 54], [-20, 58]];
    if (P.mous !== 'none') {
      if (P.grey) {                                                // grey: an outline and bristles fanning out from the middle
        ink(pts([...MO, MO[0]]), 3 * s + 1);
        const n = 14, half = P.mous === 'waxed' ? 46 : 46;
        for (let i = 0; i < n; i++) { const u = ((i + 0.5) / n) * 2 - 1, x = u * half; ink(pts([[x * 0.8, 37], [x * 1.12, P.mous === 'waxed' ? 49 : 55]]), 2.2 * s + 0.6); }
      }
      else shape('ink', pts(MO), `mo${k}`, 1.2);
    }
    if (P.mous === 'none') ink(pts([[-16, 50], [16, 50]]), 4 * s);
    if (P.beard) shape('ink', pts([[-rx + 6, 30], [-30, ry + 6], [30, ry + 6], [rx - 6, 30], [30, 70], [-30, 70]]), `beard${k}`, 2);
    // a top hat
    if (P.hat) { shape('ink', pts([[-66, -ry + 8], [-56, -ry - 120], [56, -ry - 120], [66, -ry + 8]]), `crown${k}`, 1.5); shape('ink', pts([[-100, -ry + 14], [100, -ry + 14], [92, -ry - 2], [-92, -ry - 2]]), `brim${k}`, 1.5); cut(LAB.resample(pts([[-40, -ry - 100], [-34, -ry - 10]]), 6), 6); }
  }
  const SWINDLER = { grey: true, mous: 'waxed', face: 'thin', hat: true, seed: 1 };
  const BECK = { grey: true, mous: 'bushy', face: 'round', seed: 4, bust: true };
  const LINE = [
    { grey: false, mous: 'none', face: 'square', seed: 11, bust: true }, { grey: false, mous: 'dark', face: 'thin', seed: 12, bust: true }, { grey: false, mous: 'none', face: 'round', hair: 'bald', seed: 13, bust: true },
    BECK, { grey: false, mous: 'none', face: 'thin', beard: true, seed: 15, bust: true }, { grey: false, mous: 'none', face: 'square', seed: 16, bust: true },
  ];
  const FAIRLINE = [1, 2, 3, 4, 5, 6].map((i) => ({ grey: true, mous: i % 2 ? 'bushy' : 'waxed', face: ['thin', 'round', 'square'][i % 3], seed: 30 + i, bust: true }));
  const GRID = [[215, 780], [505, 780], [795, 780], [215, 1170], [505, 1170], [795, 1170]];   // 1-3 on top, 4-6 below

  function grid(people, pass, numbers) {                           // head-and-shoulders portraits, numbered
    people.forEach((P, i) => person(GRID[i][0], GRID[i][1], 0.9, P, pass));
    if (numbers) people.forEach((_, i) => type(String(i + 1), GRID[i][0] + 118, GRID[i][1] - 70, 56));
  }
  function ringOutline(x, y, rx, ry, pass) {                       // a red ring drawn as a stroke, not a disc
    const g = L.red.g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(oval(x, y, rx, ry, 40), 8), 12); g.restore();
  }

  LAB.film({
    draw(g, t) {
      const pass = drawing(t, N);
      begin();
      if (t < PARADE) {                                            // remember him
        person(505, 1080, 2.5, SWINDLER, pass);
        if (t < FEATURES) { type('REMEMBER HIM.', 505, 380, 94); type('LONDON, 1896', 505, 460, 54); }
        else { type('GREY HAIR.', 505, 380, 104); type('A MOUSTACHE.', 505, 480, 96); }
      } else if (t < ONLY) {                                       // the line of six
        grid(LINE, pass, true);
        if (t < FOUR) type('WHICH ONE IS HIM?', 505, 400, 84);
        else {
          ringOutline(GRID[3][0] - 6, GRID[3][1] + 12, 112, 150, pass);
          type('NUMBER FOUR.', 505, 400, 96);
          if (t >= NAME) type('ADOLF BECK', 505, 1432, 76, 'red');
          if (t >= NOT) type('NOT THE SWINDLER.', 505, 1512, 64);
        }
      } else if (t < PRISON) {                                     // the only one who fit
        grid(LINE, pass, true);
        ringOutline(GRID[3][0] - 6, GRID[3][1] + 12, 112, 150, pass);
        type('THE ONLY GREY HAIR', 505, 380, 72); type('AND MOUSTACHE.', 505, 460, 72);
        if (t >= MATCH) type('ONE MAN TO MATCH.', 505, 1430, 76, 'red');
      } else if (t < COURT) {                                      // prison twice; then the real swindler, caught
        if (t < CAUGHT) {
          person(505, 1000, 1.9, BECK, pass);                       // a bust: the coat ends at 1390, above the dates
          for (let k = 0; k < 6; k++) shape('ink', [[230 + k * 112, 600], [254 + k * 112, 600], [254 + k * 112, 1390], [230 + k * 112, 1390]], `bar${k}${pass}`, 1.5);
          type('PRISON, TWICE.', 505, 400, 96); type('1896 · 1904', 505, 1490, 72);
        } else {
          person(505, 990, 1.9, { ...SWINDLER, bust: true }, pass);
          type('THE REAL SWINDLER.', 505, 400, 76);
          const gr = L.red.g; gr.save(); gr.translate(505, 1448); gr.rotate(-0.08); gr.fillStyle = '#000'; gr.fillRect(-240, -60, 480, 9); gr.fillRect(-240, 50, 480, 9); gr.font = '400 84px Fell'; gr.textAlign = 'center'; gr.fillText('CAUGHT, 1904', 0, 29); gr.restore();
        }
      } else if (t < FAIR) {                                       // the court of appeal
        shape('ink', [[150, 880], [860, 880], [900, 940], [110, 940]], `pedi${pass}`, 2);
        shape('ink', [[505, 700], [880, 880], [130, 880]], `roof${pass}`, 2);
        for (let k = 0; k < 6; k++) { const x = 190 + k * 126; shape('ink', [[x, 950], [x + 46, 950], [x + 46, 1300], [x, 1300]], `col${k}${pass}`, 1.5); cut(LAB.resample([[x + 14, 970], [x + 14, 1280]], 12), 6); }
        shape('ink', [[100, 1300], [910, 1300], [930, 1350], [80, 1350]], `step${pass}`, 2);
        type('COURT OF', 505, 400, 96); type('CRIMINAL APPEAL', 505, 490, 84); type('1907', 505, 1450, 72);
      } else {                                                     // a fair line: every face fits
        grid(FAIRLINE, pass, false);
        type('EVERY FACE FITS', 505, 380, 88); type('THE DESCRIPTION.', 505, 470, 88);
      }
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
