// Count the Coats (lab clip 05): a linocut. "You live alone. And you own two coats. Count them." A bare bulb swings in
// a dark hallway; its pool of light sweeps the wall and lights the coats one by one as the swing dies away: 1, 2, 3.
// The light stops dead on the third, which isn't on a hook. Then two red eyes open under its hat. A hard cut to black,
// and back to frame 0, which showed three coats from the start. On threes; every drawing re-carved. No jump scare.
//
// How the light works, the linocut way: inside the pool the block is cut away to paper, leaving the wallpaper's black
// lines; at its edge a fringe of gouges thins the black out; outside it the block stays solid ink. The coats are solid
// black shapes, so in the light they read as silhouettes, and in the dark they are only their cut outlines.
(() => {
  const { W, H, seg, clamp, lerp, E, rnd, rs, drawing, held } = LAB;
  const { L, begin, cut, carve, print, poly } = LINO;
  C.fonts = ['400 96px Fell'];
  const LOOP = 12.5, N = 3, T2 = 1.5, T3 = 3.4, SWING0 = 3.6, STOP = 6.6, EYES = 10.2, BLACK = 11.7;
  const COAT = [236, 516, 800];                   // coat 1 and 2 on hooks, "coat" 3 standing
  const RAIL = 520, FLOOR = 1290, POOL_Y = 860, RX = 250, RY = 560;

  // the pool of light's centre: a gentle sway; then a swing that dies away over coat 1, coat 2, coat 3; then it stops dead
  function poolX(t) {
    if (t < SWING0) return 520 + 60 * Math.sin(t * 2.0);
    if (t >= STOP) return COAT[2];
    const amp = t < 4.2 ? lerp(60, 270, E.inOut((t - SWING0) / 0.6)) : t < 5.4 ? lerp(270, 0, (t - 4.2) / 1.2) : lerp(0, 270, (t - 5.4) / 1.2);
    // left extreme on coat 1 at 4.2, passing coat 2 (the middle) at 5.4, right extreme on coat 3 at 6.6
    return 520 - amp * Math.cos(Math.PI * (t - 4.2) / 2.4);
  }
  const inPool = (t, x, y) => { const d = Math.hypot((x - poolX(t)) / RX, (y - POOL_Y) / RY); return clamp(1.15 - d); };

  // ------------------------------------------------------------------ the wall and the floor
  function wall(t, pass) {
    const g = L.ink.g, px = poolX(t);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    // the pool: its core cut back to paper, and a fringe of radial gouges round it
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.ellipse(px, POOL_Y, RX * 0.72, RY * 0.74, 0, 0, Math.PI * 2); g.fill(); g.restore();
    for (let k = 0; k < 120; k++) {
      const a = (k / 120) * Math.PI * 2 + rs('fa', k, pass) * 0.02, r0 = 0.66 + 0.04 * rnd('f0', k, pass), r1 = 0.92 + 0.16 * rnd('f1', k, pass);
      const pts = [0, 0.5, 1].map((u) => { const r = lerp(r0, r1, u); return [px + Math.cos(a) * RX * r, POOL_Y + Math.sin(a) * RY * r]; });
      cut(pts, 12 * (0.6 + 0.6 * rnd('fw', k, pass)));
    }
    // the wallpaper, printed back in black inside the light: thin stripes with a small leaf on each
    for (let x = 30; x < W; x += 74) {
      g.fillStyle = '#000'; g.fillRect(x + rs('st', x, pass) * 1.5, 270, 3, FLOOR - 270);
      for (let y = 330 + (x % 148 ? 37 : 0); y < FLOOR; y += 74) { g.beginPath(); g.ellipse(x + 1.5, y, 5, 11, 0.5, 0, Math.PI * 2); g.fill(); }
    }
    // the ceiling edge and the skirting: solid black bands
    g.fillRect(0, 0, W, 270);
    g.fillRect(0, FLOOR, W, H - FLOOR);
    // the floor: boards cut white, lit where the pool spills onto them
    for (let k = 0; k < 6; k++) {
      const y = k === 0 ? FLOOR + 22 : 1560 + (k - 1) * 52;   // the floor's edge, then boards below the words, never through them
      if (y > H) continue;
      const pts = []; for (let i = 0; i <= 12; i++) pts.push([i * 90, y + rs('fl', k, i, pass) * 2]);
      for (let i = 0; i < 12; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, lv = clamp(1.1 - Math.abs(mx - px) / 420) * (1 - k * 0.12); if (lv > 0.05) cut(LAB.resample([pts[i], pts[i + 1]], 12), 3 + 7 * lv); }
    }
  }

  // ------------------------------------------------------------------ the coats
  // a hanging coat: a hanger's neck, wide shoulders, sleeves hanging down its sides, a hem; a standing "coat": the same
  // drape, taller, with a hat where a hook should be
  function coatPath(cx, top, standing) {
    const h = standing ? 860 : 660, sh = standing ? 112 : 100, hem = standing ? 126 : 110, neck = standing ? 44 : 24;
    return [[cx - neck, top], [cx + neck, top], [cx + sh, top + 70], [cx + sh + 16, top + 120], [cx + sh + 6, top + 430], [cx + sh - 20, top + 440],
      [cx + hem, top + h], [cx - hem, top + h], [cx - sh + 20, top + 440], [cx - sh - 6, top + 430], [cx - sh - 16, top + 120], [cx - sh, top + 70]];
  }
  function coat(t, i, pass) {
    const standing = i === 2, cx = COAT[i], top = standing ? RAIL - 60 + 30 : RAIL + 34;
    const P = LAB.resample(coatPath(cx, top, standing), 14, true).map(([x, y], k) => [x + rs('c', i, k, pass) * 2.2, y + rs('d', i, k, pass) * 2.2]);
    const g = L.ink.g;
    // the outline cut that separates it from the dark, then the coat re-inked inside it
    g.save(); g.globalCompositeOperation = 'destination-out'; poly(g, P); g.lineWidth = 8; g.stroke(); g.restore();
    g.fillStyle = '#000'; poly(g, P); g.fill();
    // its folds and the line where the sleeves hang, cut only where the light reaches
    const lt = (x, y) => inPool(t, x, y) * 0.9;
    const h = standing ? 860 : 660;
    for (const [fx, f0, f1, bend] of [[-58, 0.22, 0.97, -10], [-22, 0.3, 0.99, 6], [24, 0.28, 0.98, -6], [62, 0.2, 0.96, 10]]) {   // four long folds
      const lv = lt(cx + fx, top + h * 0.6); if (lv < 0.05) continue;
      const pts = []; for (let k = 0; k <= 10; k++) { const u = lerp(f0, f1, k / 10); pts.push([cx + fx * (0.7 + 0.5 * u) + Math.sin(u * Math.PI) * bend + rs('fd', i, fx, k, pass) * 1.5, top + h * u]); }
      cut(pts, 3 + 9 * lv);
    }
    for (const s of [-1, 1]) { const lv = lt(cx + s * 76, top + 280); if (lv > 0.05) cut([[cx + s * 80, top + 120], [cx + s * 74, top + 300], [cx + s * 78, top + 430]], 4 + 6 * lv); }   // where the sleeves hang
    if (!standing) for (let k = 0; k < 4; k++) { const by = top + 160 + k * 90, lv = lt(cx, by); if (lv > 0.1) { const gg = L.ink.g; gg.save(); gg.globalCompositeOperation = 'destination-out'; gg.beginPath(); gg.arc(cx + rs('bt', i, k, pass), by, 4 + 5 * lv, 0, Math.PI * 2); gg.fill(); gg.restore(); } }   // buttons
    const lvc = lt(cx, top + 120); if (lvc > 0.05 && !standing) cut([[cx - 22, top + 8], [cx, top + 90], [cx + 22, top + 8]], 5 + 4 * lvc);   // the collar's V
    if (standing) {
      // a head under a wide-brimmed hat: its brim cut out against the dark, the face lost in shadow
      const hy = top - 44, tilt = seg(t, EYES - 0.6, EYES + 0.4, 'inOut') * 0.1;
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(cx, hy, 44, 54, 0, 0, Math.PI * 2); g.fill();
      g.save(); g.translate(cx, hy - 30); g.rotate(-tilt);
      g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(0, 0, 118, 22, 0, 0, Math.PI * 2); g.lineWidth = 8; g.stroke(); g.beginPath(); g.roundRect(-56, -82, 112, 80, 20); g.stroke(); g.restore();
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, 0, 114, 19, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.roundRect(-52, -78, 104, 76, 18); g.fill();
      const lv = inPool(t, cx, hy - 40); if (lv > 0.1) cut([[-46, -12], [0, -16], [46, -12]].map(([x, y]) => [x, y]), 3 + 5 * lv);   // the hatband catching the light
      g.restore();
      // the eyes: red, the only colour, opening under the brim
      const open = seg(t, EYES, EYES + 0.5, 'out');
      if (open > 0) {   // cut the eyes out of the ink so the red prints on bare paper, bright
        const r = L.red.g; r.fillStyle = '#000';
        g.save(); g.globalCompositeOperation = 'destination-out';
        for (const ex of [-17, 17]) { g.beginPath(); g.ellipse(cx + ex, hy + 6, 10, 8.5 * open + 0.5, 0, 0, Math.PI * 2); g.fill(); }
        g.restore();
        for (const ex of [-17, 17]) { r.beginPath(); r.ellipse(cx + ex, hy + 6, 10, 8.5 * open + 0.5, 0, 0, Math.PI * 2); r.fill(); }
      }
    }
  }
  function rail(t, pass) {   // a wooden rail with two hooks: the coats' hangers hang from them
    const g = L.ink.g;
    g.fillStyle = '#000'; g.fillRect(110, RAIL - 18, 560, 30);
    const lv = clamp(inPool(t, 390, RAIL) + 0.25);
    cut(LAB.resample([[112, RAIL - 18], [668, RAIL - 18]], 20), 3 + 4 * lv);
    for (const cx of COAT.slice(0, 2)) { g.fillRect(cx - 4, RAIL + 10, 8, 26); g.beginPath(); g.arc(cx, RAIL + 40, 10, Math.PI, 2 * Math.PI); g.lineWidth = 7; g.strokeStyle = '#000'; g.stroke(); }
  }
  function bulb(t, pass) {      // a bare bulb on a cord, swinging toward where its light falls
    const bx = 520 + (poolX(t) - 520) * 0.25, by = 340;
    cut([[520, 270], [lerp(520, bx, 0.5), 300], [bx, by - 40]], 6);
    const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(bx, by, 30, 36, 0, 0, Math.PI * 2); g.fill(); g.restore();
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, r1 = 72 + 34 * rnd('ray', k, pass); cut([[bx + Math.cos(a) * 46, by + Math.sin(a) * 50], [bx + Math.cos(a) * r1, by + Math.sin(a) * (r1 + 6)]], 8); }
    g.fillStyle = '#000'; g.fillRect(bx - 12, by - 40, 24, 16); g.lineWidth = 4; g.strokeStyle = '#000'; g.beginPath(); g.moveTo(bx - 9, by + 6); g.lineTo(bx - 3, by - 8); g.lineTo(bx + 3, by + 6); g.lineTo(bx + 9, by - 8); g.stroke();   // the cap and the filament
  }

  // ------------------------------------------------------------------ carved words and the count
  function words(text, x, y, size, alpha = 1) {
    if (alpha <= 0) return;
    const g = L.ink.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = alpha;
    g.font = `400 ${size}px Fell`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(text, x, y); g.restore();
  }
  function count(t) {          // as the light reaches each coat, its number is cut above it, and stays
    const hits = [4.2, 5.4, 6.6];
    for (let i = 0; i < 3; i++) if (t >= hits[i] - 0.06) {
      const y = i === 2 ? RAIL - 210 : RAIL - 60, g = L.ink.g;
      g.save(); g.fillStyle = '#000'; g.beginPath(); g.arc(COAT[i], y - 34, 48, 0, Math.PI * 2); g.fill(); g.restore();   // a black disc, so the number reads in the light
      words(String(i + 1), COAT[i], y, 96, seg(t, hits[i] - 0.06, hits[i] + 0.1));
    }
  }

  LAB.film({
    draw(g, t0) {
      const t = LAB.loopT(t0, LOOP), pass = drawing(t, N), th = held(t, N);
      if (t >= BLACK) { g.fillStyle = '#0d0a08'; g.fillRect(0, 0, W, H); return; }   // the hard cut to black
      begin();
      wall(th, pass); rail(th, pass);
      for (let i = 0; i < 3; i++) coat(th, i, pass);
      bulb(th, pass);
      const a1 = 1 - seg(t, T3 - 0.2, T3), a2 = seg(t, T2, T2 + 0.2) * a1, a3 = seg(t, T3, T3 + 0.2) * (1 - seg(t, EYES - 0.8, EYES - 0.4));
      words('YOU LIVE ALONE.', 505, 1420, 88, a1);                     // centred in the safe column (x 60-950)
      words('AND YOU OWN TWO COATS.', 505, 1505, 56, a2);
      words('COUNT THEM.', 505, 1450, 102, a3 > 0 ? a3 : 0);
      count(th);
      print(g, pass);
      LAB.safeOverlay(g);
    },
  });
})();
