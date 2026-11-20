// Level 1: Which Glass Fills First? (lab clip 04). 16-bit pixel art on a 180 x 320 canvas, scaled 6x.
// A tank feeds five glasses through pipes. Glass 1's pipe has a plug (the decoy every regular looks for). Glass 2's
// pipe climbs above the tank's water line, and water can't rise above its own level, so it never gets there. Glass 4
// wins a close race with glass 3. Everything the answer needs is visible on frame 0. Pure function of t.
(() => {
  const { seg, clamp, lerp, E, rnd } = LAB;
  const { g, P, clear, px, rect, line, text, present, PW, PH } = PIX;
  const GO = 3.2, V = 26, FILL = 1.4, WL = 108;           // valve opens; flow speed px/s; seconds to fill a glass; the tank's water line
  const GX = [19, 49, 79, 109, 139], GY0 = 210, GY1 = 240;   // glasses: centres, top and bottom (y)

  // the paths, from the valve: polylines in whole pixels. 'plug' = distance along the path where the plug sits
  const VALVE = [34, 124];
  const PATHS = [
    { n: 1, pts: [VALVE, [34, 134], [19, 134], [19, GY0 - 2]], plug: 10 + 15 + 26 },
    { n: 2, pts: [VALVE, [34, 134], [64, 134], [64, 100], [72, 100], [72, 164], [49, 164], [49, GY0 - 2]] },   // the hump, just right of the tank
    { n: 3, pts: [VALVE, [34, 134], [79, 134], [79, 144], [99, 144], [99, 198], [79, 198], [79, GY0 - 2]] },
    { n: 4, pts: [VALVE, [34, 134], [109, 134], [109, GY0 - 2]] },
    { n: 5, pts: [VALVE, [34, 134], [139, 134], [139, 160], [125, 160], [125, 184], [139, 184], [139, GY0 - 2]] },
  ];
  const len = (pts) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  // where the water stops: at a plug, or where an upward run reaches the tank's water line
  for (const p of PATHS) {
    p.L = len(p.pts); p.stop = p.L;
    if (p.plug) p.stop = p.plug;
    let d = 0;
    for (let i = 1; i < p.pts.length; i++) {
      const [x0, y0] = p.pts[i - 1], [x1, y1] = p.pts[i], sl = Math.hypot(x1 - x0, y1 - y0);
      if (y1 < WL && y0 >= WL) { p.stop = Math.min(p.stop, d + sl * (y0 - WL) / (y0 - y1)); break; }
      d += sl;
    }
    p.arrive = p.stop >= p.L ? GO + p.L / V : Infinity;
  }
  const WIN = PATHS.filter((p) => p.arrive < Infinity).sort((a, b) => a.arrive - b.arrive)[0];   // glass 4
  const T_WIN = WIN.arrive + FILL;

  // a point at distance s along a polyline
  function along(pts, s) {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], sl = Math.hypot(x1 - x0, y1 - y0);
      if (s <= sl) return [x0 + (x1 - x0) * s / sl, y0 + (y1 - y0) * s / sl];
      s -= sl;
    }
    return pts[pts.length - 1];
  }
  function polyline(pts, c, upto = Infinity) {   // whole-pixel line along the path up to distance `upto`
    let d = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], sl = Math.hypot(x1 - x0, y1 - y0);
      if (d >= upto) break;
      const k = Math.min(1, (upto - d) / sl);
      line(x0, y0, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, c);
      d += sl;
    }
  }

  // ------------------------------------------------------------------ the set
  function wall() {
    rect(0, 0, PW, PH, P.d);
    for (let y = 0; y < PH; y += 8) for (let x = -((y / 8) % 2) * 8; x < PW; x += 16) {
      rect(x + 1, y + 1, 14, 6, (rnd('br', x, y) > 0.5) ? '#2f2a4a' : '#2c2646');
    }
    rect(0, 256, PW, PH - 256, P.k);                     // the floor shelf
    rect(0, 254, PW, 2, P.d2);
  }
  function tank(t) {
    rect(12, 90, 44, 32, P.pipeD); rect(13, 91, 42, 30, P.pipe); rect(13, 91, 42, 2, P.pipeL);
    for (const [x, y] of [[15, 93], [52, 93], [15, 118], [52, 118]]) px(x, y, P.pipeL);
    // the window: water up to the water line, air above, a ripple on the surface (a big tank: the level holds)
    rect(18, 96, 32, 22, P.d);
    rect(18, WL, 32, 118 - WL, P.water);
    for (let x = 18; x < 50; x++) px(x, WL + ((x + Math.floor(t * 8)) % 6 === 0 ? 1 : 0), P.waterL);
    rect(18, WL + 1, 32, 1, P.waterL);
  }
  function valve(t) {
    // a wheel on the outlet: it turns a quarter turn at GO
    const a = seg(t, GO - 0.35, GO, 'out') * Math.PI / 2, [cx, cy] = VALVE;
    rect(cx - 2, cy - 2, 5, 5, P.pipeD);
    for (let k = 0; k < 4; k++) { const aa = a + k * Math.PI / 2; line(cx, cy, cx + Math.cos(aa) * 4, cy + Math.sin(aa) * 4, P.red); }
    px(cx, cy, P.gold);
  }
  function pipes() {
    for (const p of PATHS) {        // a 3-px pipe: dark edge, body, light top
      polyline(p.pts.map(([x, y]) => [x - 1, y - 1]), P.pipeD); polyline(p.pts.map(([x, y]) => [x + 1, y + 1]), P.pipeD);
      polyline(p.pts.map(([x, y]) => [x + 1, y - 1]), P.pipeD); polyline(p.pts.map(([x, y]) => [x - 1, y + 1]), P.pipeD);
      polyline(p.pts.map(([x, y]) => [x, y - 1]), P.pipe); polyline(p.pts.map(([x, y]) => [x - 1, y]), P.pipe);
      polyline(p.pts.map(([x, y]) => [x + 1, y]), P.pipe); polyline(p.pts.map(([x, y]) => [x, y + 1]), P.pipe);
      polyline(p.pts, P.d2);       // the empty channel
    }
    // glass 1's plug: a red cap clamped across the pipe
    const [qx, qy] = along(PATHS[0].pts, PATHS[0].plug);
    rect(qx - 3, qy, 7, 3, P.red); rect(qx - 3, qy, 7, 1, '#ff8a7a'); rect(qx - 4, qy + 1, 1, 1, P.k); rect(qx + 4, qy + 1, 1, 1, P.k);
  }
  function water(t) {
    const s = Math.max(0, (t - GO) * V);
    for (const p of PATHS) {
      const upto = Math.min(s, p.stop);
      if (upto <= 0) continue;
      polyline(p.pts, P.water, upto);
      const [fx, fy] = along(p.pts, upto); px(fx, fy, P.waterL);   // the front glints
    }
  }
  function glasses(t) {
    for (let i = 0; i < 5; i++) {
      const p = PATHS[i], x = GX[i], fill = p.arrive < Infinity ? clamp((t - p.arrive) / FILL) : 0;
      // water inside, from the bottom up, then the glass itself over it
      const h = Math.round((GY1 - GY0 - 3) * fill);
      if (h > 0) { rect(x - 7, GY1 - 1 - h, 15, h, P.water); rect(x - 7, GY1 - 1 - h, 15, 1, P.waterL); }
      // a falling stream while it fills
      if (fill > 0 && fill < 1) for (let y = GY0 - 2; y < GY1 - 1 - h; y++) if ((y + Math.floor(t * 30)) % 3) px(x, y, P.waterL);
      line(x - 8, GY0, x - 7, GY1, P.glass); line(x + 8, GY0, x + 7, GY1, P.glass); line(x - 7, GY1, x + 7, GY1, P.glass);
      px(x - 6, GY0 + 3, P.w); px(x - 6, GY0 + 4, P.w);
      // the number sign
      const won = p === WIN && t >= T_WIN;
      rect(x - 6, 244, 13, 11, won ? P.goldD : P.woodD); rect(x - 5, 245, 11, 9, won ? P.gold : P.wood);
      text(String(p.n), x - 2, 246, won ? P.k : P.w);
    }
  }

  // ------------------------------------------------------------------ words, the win, the explanations
  const CX = 84;                 // the middle of the safe column (x 60-950 on the frame), where centred titles go
  function hud(t) {
    text('LEVEL 1', CX, 47, P.gold, 1, P.k, 'center');
    if (t < T_WIN + 0.2) {
      text('WHICH GLASS', CX, 56, P.w, 2, P.k, 'center');
      text('FILLS FIRST?', CX, 72, P.w, 2, P.k, 'center');
    }
    if (t >= GO - 0.1 && t < GO + 0.9) text('GO!', 118, 100, P.green, 3, P.k, 'center');
    if (t >= T_WIN) {   // glass 4: a gold star burst, whole pixels, eight frames of sparkle then steady
      const k = Math.min(1, (t - T_WIN) / 0.25), x = GX[WIN.n - 1];
      for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4, r = 4 + k * 10; px(x + Math.cos(ang) * r, GY0 - 6 + Math.sin(ang) * r, a % 2 ? P.gold : P.w); }
      text(`GLASS ${WIN.n}!`, CX, 56, P.gold, 2, P.k, 'center');
    }
    // why: glass 1 was plugged (the decoy), glass 2's pipe climbs above the water line
    if (t >= T_WIN + 1.0) {
      const [qx, qy] = along(PATHS[0].pts, PATHS[0].plug);
      text('PLUGGED', 4, qy + 8, P.red, 1, P.k);
    }
    if (t >= T_WIN + 1.8) {
      // the water line, carried across as a dashed line to the hump: the pipe goes above it
      for (let x = 50; x < 70; x += 2) px(x, WL, P.waterL);
      text("WATER CAN'T", 72, 96, P.waterL, 1, P.k);
      text('CLIMB ABOVE', 72, 105, P.waterL, 1, P.k);
      text('ITS OWN LEVEL.', 72, 114, P.waterL, 1, P.k);
    }
    if (t >= T_WIN + 3.2) text('CLEAR!', CX, 72, P.green, 2, P.k, 'center');
  }

  LAB.film({
    draw(dst, t) {
      clear(); wall(); tank(t); pipes(); water(t); valve(t); glasses(t); hud(t);
      present(dst);
      LAB.safeOverlay(dst);
    },
  });
})();
