// It Wasn't Resonance (lab clip 13): a Root Cause File in linocut. The Tacoma Narrows Bridge, 7 November 1940: the
// textbook calls it resonance; most engineers now call it flutter. The wind was steady, so nothing pushed in rhythm; the
// deck's own twisting made the wind push it further (WSDOT; Billah & Scanlan 1991; sources in lab/research.md).
// Black ink on bone paper and one red (the wind's push), re-carved on threes. Every beat is keyed to the placed
// narration (window.VO and window.WORDS).
(() => {
  const { W, H, clamp, lerp, seg, rnd, rs, held, drawing } = LAB;
  const { L, begin, shape, cut, carve, gougePath, print } = LINO;
  C.fonts = ['400 96px Fell'];
  const N = 3;

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const SWING = T0('n03') - 0.1, STEADY = T0('n04') - 0.1, DID = T0('n06'), SECTION = T0('n07') - 0.1, PUSHES = T0('n08');
  const FLUTTER = word('n09', 'flutter'), TEAR = T0('n10') - 0.1, TORE = ln('n10').t1 - 0.3, TUNNEL = T0('n11') - 0.1;   // the deck falls as the line ends

  // ------------------------------------------------------------------ type, printed in ink (or red)
  function type(s, x, y, size, layer = 'ink', a = 1) {
    if (a <= 0) return;
    const g = L[layer].g; g.save(); g.globalAlpha = a; g.fillStyle = '#000'; g.font = `400 ${size}px Fell`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore();
  }
  // a tapered stroke in ink, and a carved line: resampled first, since a stroke tapers to nothing at both of its ends
  const ink = (pts, w, layer = 'ink') => { const g = L[layer].g; g.save(); g.fillStyle = '#000'; gougePath(g, LAB.resample(pts, 10), w); g.restore(); };
  const groove = (pts, w) => cut(LAB.resample(pts, 8), w);

  // ------------------------------------------------------------------ the sky, the water, the wind
  function sky(th, pass, wind = 0.4) {
    for (let k = 0; k < 18; k++) {                                   // the wind: long thin strokes, moving steadily right
      const y = 560 + rnd('wy', k) * 560, len = 120 + 160 * rnd('wl', k), sp = 260 + 140 * rnd('ws', k);
      const x = ((rnd('wx', k) * (W + 600) + th * sp * wind * 2) % (W + 600)) - 300;
      ink(LAB.resample([[x, y], [x + len, y + rs('wb', k, pass) * 3]], 20), 3 + 2 * rnd('ww', k));
    }
  }
  function water(pass) {
    shape('ink', [[-20, 1330], [W + 20, 1330], [W + 20, H + 20], [-20, H + 20]], `water${pass}`, 3);
    carve((g) => { g.beginPath(); g.rect(0, 1340, W, H - 1340); }, (x, y) => clamp(0.55 - (y - 1340) / 900), { angle: 0, spacing: 22, len: 90, wmax: 6, seed: 300 + pass, curve: 0.25, y0: 1330 });
  }

  // ------------------------------------------------------------------ the bridge, side on: two towers, the cables, a deck that twists
  const TA = 220, TB = 860, DECK = 1180, TOWER_TOP = 620;
  const twistAt = (x, t, A) => (x < TA || x > TB ? 0 : A * Math.sin(2 * Math.PI * (x - TA) / (TB - TA)) * Math.cos(2 * Math.PI * t / 4));   // a node at mid-span; frame 0 at full twist
  function bridge(t, th, pass, A, fall = 0) {
    for (const x of [TA, TB]) {                                      // the towers, standing in the water
      shape('ink', [[x - 22, TOWER_TOP], [x + 22, TOWER_TOP], [x + 30, 1380], [x - 30, 1380]], `tw${x}${pass}`, 2);
      for (const y of [700, 900, 1080]) groove([[x - 18, y], [x + 18, y + 26]], 6);
    }
    const sag = (x) => DECK - 70 - (DECK - 70 - TOWER_TOP) * Math.pow((x - (TA + TB) / 2) / ((TB - TA) / 2), 2);   // the main cable
    const cable = []; for (let x = TA; x <= TB; x += 16) cable.push([x, sag(x)]);
    ink(cable, 10);
    ink([[TA, TOWER_TOP], [TA - 140, 900], [-40, 1140]], 9); ink([[TB, TOWER_TOP], [TB + 140, 900], [W + 40, 1140]], 9);   // the side spans' cables
    // the deck: the far girder, the deck's face between, the near girder; the middle drops away from "tore"
    const strip = (sign, dy0) => { const top = [], bot = []; for (let x = -40; x <= W + 40; x += 12) { const d = 70 * Math.sin(twistAt(x, th, A)), y = DECK + dy0 + sign * d + (x > 380 && x < 760 ? fall * (1 + 0.6 * Math.sin(x / 40)) : 0); top.push([x, y - 13]); bot.push([x, y + 13]); } return { top, bot }; };
    const far = strip(1, -14), near = strip(-1, 0);
    for (let i = 0; i < near.top.length - 1; i += 1) {                 // suspenders, cable to deck
      const x = near.top[i][0]; if (x < TA + 20 || x > TB - 20 || i % 3) continue;
      const y1 = Math.min(near.top[i][1], far.top[i][1]); if (fall > 0 && x > 380 && x < 760) continue;
      ink([[x, sag(x) + 6], [x, y1]], 3);
    }
    shape('ink', [...far.top, ...far.bot.slice().reverse()], `df${pass}`, 1.5, 12);
    shape('ink', [...near.top, ...near.bot.slice().reverse()], `dn${pass}`, 1.5, 12);
    for (let i = 0; i < near.top.length - 1; i += 2) { const [x, y] = near.top[i]; if (rnd('dk', i, pass) > 0.35) groove([[x - 6, y + 9], [x + 6, y + 9]], 3); }   // light catching the girder's edge
  }

  // ------------------------------------------------------------------ resonance: a swing, pushed each time it comes back
  function swing(t, th, pass) {
    ink([[220, 620], [790, 620]], 16); ink([[240, 610], [170, 1250]], 12); ink([[770, 610], [840, 1250]], 12);
    const phi = 0.55 * Math.sin(2 * Math.PI * (th - SWING) / 2.2), px = 505 + Math.sin(phi) * 470, py = 620 + Math.cos(phi) * 470;
    ink([[480, 625], [px - 30, py]], 5); ink([[530, 625], [px + 30, py]], 5);
    shape('ink', [[px - 70, py], [px + 70, py], [px + 66, py + 22], [px - 66, py + 22]], `seat${pass}`, 1.5);
    // the push: a hand at the right, meeting the seat each time it swings back to it
    const near = Math.cos(2 * Math.PI * (th - SWING) / 2.2) < -0.92 ? 0 : 1, hx = 905 - 36 * (1 - near);
    shape('ink', [[hx, py - 10], [hx + 60, py - 18], [hx + 64, py + 22], [hx, py + 18]], `hand${pass}`, 2);
    if (!near) for (let k = 0; k < 3; k++) ink([[hx - 20, py - 20 + k * 20], [hx - 60, py - 30 + k * 26]], 5, 'red');
  }

  // ------------------------------------------------------------------ the deck in section: shallow, solid, rocking in the wind
  function section(t, th, pass) {
    const grow = seg(th, PUSHES, FLUTTER + 1.2), A = 0.12 + 0.42 * grow, a = A * Math.sin(2 * Math.PI * (th - SECTION) / 2.4);
    const cx = 505, cy = 1010, rot = (x, y) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)];
    shape('ink', [[-280, -58], [-238, -58], [-238, 58], [-280, 58]].map(([x, y]) => rot(x, y)), `gl${pass}`, 1.5, 10);   // the 8-foot plate girders
    shape('ink', [[238, -58], [280, -58], [280, 58], [238, 58]].map(([x, y]) => rot(x, y)), `gr${pass}`, 1.5, 10);
    shape('ink', [[-240, -14], [240, -14], [240, 20], [-240, 20]].map(([x, y]) => rot(x, y)), `gs${pass}`, 1.5, 10);    // the roadway between them
    for (let k = 0; k < 12; k++) {                                   // the wind, steady from the left, bending round the deck
      const y = 760 + k * 46, x = ((th * 700 + rnd('sx', k) * 900) % 1300) - 260, bend = (y - cy) / 200;
      ink([[x, y], [x + 120, y + bend * 14 * Math.sign(a)]], 4);
    }
    if (th >= PUSHES) {                                              // the wind's push, in step with the twist (the one red)
      const s = Math.sign(Math.sin(2 * Math.PI * (th - SECTION) / 2.4) * Math.cos(2 * Math.PI * (th - SECTION) / 2.4)) || 1;
      const k = 0.6 + 0.6 * grow, [lx, ly] = rot(-200, 0), [rx, ry] = rot(200, 0);
      shape('red', [[lx - 16, ly], [lx + 16, ly], [lx + 16, ly + s * 90 * k], [lx + 34, ly + s * 90 * k], [lx, ly + s * 140 * k], [lx - 34, ly + s * 90 * k], [lx - 16, ly + s * 90 * k]], `ra${pass}`, 1.2, 10);
      shape('red', [[rx - 16, ry], [rx + 16, ry], [rx + 16, ry - s * 90 * k], [rx + 34, ry - s * 90 * k], [rx, ry - s * 140 * k], [rx - 34, ry - s * 90 * k], [rx - 16, ry - s * 90 * k]], `rb${pass}`, 1.2, 10);
    }
  }

  // ------------------------------------------------------------------ the lesson: a model in a wind tunnel, holding still
  function tunnel(t, th, pass) {
    shape('ink', [[90, 760], [930, 760], [930, 790], [90, 790]], `tt${pass}`, 1.5); shape('ink', [[90, 1230], [930, 1230], [930, 1260], [90, 1260]], `tb${pass}`, 1.5);
    shape('ink', [[90, 760], [120, 760], [120, 1260], [90, 1260]], `tl${pass}`, 1.5);
    for (let k = 0; k < 3; k++) { const a = th * 9 + k * 2.09; ink([[105, 1010], [105 + Math.cos(a) * 10, 1010 + Math.sin(a) * 110]], 14); }   // the fan
    for (const x of [380, 640]) shape('ink', [[x - 8, 880], [x + 8, 880], [x + 10, 1160], [x - 10, 1160]], `mt${x}${pass}`, 1.2);
    ink([[300, 1100], [380, 885], [510, 1060], [640, 885], [720, 1100]], 5);
    shape('ink', [[280, 1100], [740, 1100], [740, 1114], [280, 1114]], `md${pass}`, 1);
    for (let k = 0; k < 9; k++) { const y = 820 + k * 46, x = ((th * 600 + rnd('tx', k) * 800) % 900) + 120; ink([[x, y], [x + 90, y]], 3); }
  }

  LAB.film({
    draw(g, t) {
      const pass = drawing(t, N), th = held(t, N);
      begin();
      if (t < SWING || (t >= STEADY && t < SECTION) || (t >= TEAR && t < TUNNEL)) {
        // the bridge: twisting hard at the start, calmer while the wind is shown steady, then growing to 45 degrees
        const A = t < SWING ? 0.62 : t < TEAR ? lerp(0.3, 0.72, seg(th, STEADY + 1.5, DID + 0.6)) : 0.72;
        const fall = t >= TEAR ? Math.pow(Math.max(0, th - TORE), 2) * 900 : 0;
        sky(th, pass, t >= STEADY ? 1 : 0.4);
        bridge(t, th, pass, A, Math.min(fall, 900));
        water(pass);
        if (fall > 160) for (let k = 0; k < 10; k++) ink([[400 + k * 36, 1332], [390 + k * 36 + rs('spl', k) * 30, 1250 - 80 * rnd('sph', k, pass)]], 9);   // the splash
        if (t < SWING) { type('IT WASN’T', 505, 360, 118); type('RESONANCE.', 505, 480, 118); type('TACOMA NARROWS · 1940', 505, 560, 50); }
        else if (t < DID) { type('A STEADY WIND,', 505, 380, 92); type('ABOUT 40 MPH.', 505, 480, 92); }
        else if (t < SECTION) type('THE BRIDGE DID.', 505, 430, 94);
        else { type('11:02 A.M.', 505, 400, 110); type('THE MIDDLE TORE AWAY.', 505, 500, 64); }
      } else if (t < STEADY) {
        swing(t, th, pass);
        type('RESONANCE:', 505, 380, 104); type('A PUSH IN RHYTHM.', 505, 480, 80);
      } else if (t < TEAR) {
        section(t, th, pass);
        if (t < PUSHES) { type('SHALLOW. SOLID.', 505, 380, 90); type('8 FEET DEEP', 505, 470, 64); }
        else if (t < FLUTTER) { type('EACH TWIST', 505, 380, 100); type('FEEDS THE NEXT.', 505, 480, 92); }
        else { type('FLUTTER.', 505, 440, 140, 'red'); }
      } else {
        tunnel(t, th, pass);
        type('TESTED IN A', 505, 380, 100); type('WIND TUNNEL.', 505, 480, 100);
      }
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
