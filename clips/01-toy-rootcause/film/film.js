// Who Started This? (lab clip 01, the toy diorama). Frame 0 is the aftermath with four numbered suspects; the chain
// rewinds to the cause (the fly), freezes on it, then plays forward into frame 0 again (a 16 s loop).
// Everything that moves in the chain is a lookup into the baked physics (film/bake.js from physics.mjs); the cat, the
// fly, the clock and the toaster are keyed on the same clock. Pure function of t: no state between frames.
(() => {
  const { W, H, key, seg, clamp, lerp, E, rnd, rs, n1, tex } = LAB;
  const { P: C0, shade, rrect, block, body, ball, words } = TOY;
  const B = window.BAKE, L = window.LAYOUT;
  C.fonts = ['700 100px Fredoka', '600 60px Fredoka'];

  // ------------------------------------------------------------------ the clock: film time → chain time
  // 0–2.4 the aftermath (frame 0) · 2.4–7.0 the rewind · 7.0–8.6 freeze on the cause · 8.6–15.25 the chain forward, the
  // cake's flight at 0.35x · 15.25–16 the aftermath again, and the loop
  const LOOP = 16.0, REW0 = 2.4, REW1 = 7.0, FWD0 = 8.6, SLO0 = 4.50, SLO1 = 5.00, SLOW = 0.35;
  const FWD1 = FWD0 + (SLO0 - 1.0) + (SLO1 - SLO0) / SLOW + (7.0 - SLO1);
  const rewE = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  function chain(t) {
    if (t < REW0) return 7.0;
    if (t < REW1) return 7.0 - 6.0 * rewE((t - REW0) / (REW1 - REW0));
    if (t < FWD0) return 1.0;
    let s = t - FWD0;
    if (s < SLO0 - 1.0) return 1.0 + s;
    s -= SLO0 - 1.0;
    if (s < (SLO1 - SLO0) / SLOW) return SLO0 + s * SLOW;
    s -= (SLO1 - SLO0) / SLOW;
    return Math.min(7.0, SLO1 + s);
  }
  // the world's idle clock (pendulum, blinks, the fly's rubbing): it runs in the holds, follows the chain when the chain
  // moves (so the rewind runs it backwards) and stops in the freeze. It is 3.15 s further on at the loop's end than at
  // frame 0, so every idle cycle is 3.15 s divided by a whole number.
  const phi = (t) => (t < REW0 ? 7.0 + t : t < FWD1 ? chain(t) + REW0 : 7.0 + REW0 + (t - FWD1));
  const CYC = 3.15;

  // ------------------------------------------------------------------ the set (static: painted once into a texture)
  const FLOOR = L.floorY, CEIL = L.ceilY, CT = L.counter[1];
  function paintSet(g) {
    // wall with soft painted panels
    g.fillStyle = C0.wall; g.fillRect(0, CEIL, W, FLOOR - CEIL);
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? 'rgba(214,170,110,0.10)' : 'rgba(255,255,255,0.12)'; g.fillRect(i * 160 - 20, CEIL, 80, FLOOR - CEIL); }
    // a band of tiles behind the counter
    for (let y = CT - 240; y < CT; y += 60) for (let x = L.counter[0]; x < W; x += 60) {
      g.fillStyle = ((x / 60 + y / 60) & 1) ? '#cfe3ec' : '#e3f0f4'; g.fillRect(x, y, 60, 60);
    }
    g.fillStyle = 'rgba(40,60,70,0.12)'; for (let x = L.counter[0]; x < W; x += 60) g.fillRect(x, CT - 240, 2, 240);
    for (let y = CT - 240; y < CT; y += 60) g.fillRect(L.counter[0], y, W - L.counter[0], 2);
    // a dark wooden ceiling (planks and a beam), so the pink cake on it is the first thing you see
    g.fillStyle = '#8a5a34'; g.fillRect(0, 0, W, CEIL);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#93623a' : '#82542f'; g.fillRect(i * 124, 0, 124, CEIL); g.fillStyle = 'rgba(30,15,5,0.35)'; g.fillRect(i * 124, 0, 3, CEIL); }
    g.fillStyle = '#6b4226'; g.fillRect(0, CEIL - 22, W, 22);
    g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(0, CEIL - 22, W, 4);
    g.fillStyle = 'rgba(80,45,15,0.18)'; g.fillRect(0, CEIL, W, 26);
    // floorboards
    g.fillStyle = C0.floor; g.fillRect(0, FLOOR, W, H - FLOOR);
    for (let k = 0; k < 7; k++) { g.fillStyle = shade(C0.floor, k % 2 ? -0.07 : 0.04); g.fillRect(0, FLOOR + 30 + k * 66, W, 66); g.fillStyle = C0.floorDark; g.fillRect(0, FLOOR + 30 + k * 66, W, 3); }
    for (let k = 0; k < 14; k++) { g.fillStyle = 'rgba(90,50,20,0.3)'; g.fillRect((k * 173 + (k % 2) * 60) % W, FLOOR + 33 + (k % 7) * 66, 3, 63); }
    g.fillStyle = shade(C0.floor, 0.18); g.fillRect(0, FLOOR, W, 10);
    // skirting
    g.fillStyle = C0.cream; g.fillRect(0, FLOOR - 34, L.counter[0], 34); g.fillStyle = shade(C0.cream, -0.12); g.fillRect(0, FLOOR - 8, L.counter[0], 8);
    // the counter: cabinets, doors, knobs, then the worktop
    const [cx0, cy0, cx1] = L.counter;
    g.fillStyle = 'rgba(60,32,10,0.25)'; g.fillRect(cx0 - 10, cy0 + 20, 14, FLOOR - cy0 - 20);
    block(g, cx0, cy0 + 16, cx1 - cx0 + 20, FLOOR - cy0 - 16, '#7fb3a3', { r: 6, shadow: false, lit: 0.12, dark: 0.12, band: 0.03 });
    for (let i = 0; i < 4; i++) {
      const dx = cx0 + 24 + i * 170;
      block(g, dx, cy0 + 50, 150, FLOOR - cy0 - 92, '#8cc2b1', { r: 10, shadow: false, band: 0.04, lit: 0.18, dark: 0.1 });
      ball(g, dx + (i % 2 ? 22 : 128), cy0 + 210, 9, C0.yellow, 0, { shadow: false });
    }
    block(g, cx0 - 14, cy0, cx1 - cx0 + 40, 18, C0.woodLight, { r: 6, shadow: false, lit: 0.2, dark: 0.25, band: 0.3 });
    g.fillStyle = 'rgba(60,32,10,0.3)'; g.fillRect(cx0 - 14, cy0 + 18, cx1 - cx0 + 40, 6);
    // the shelf on its two brackets
    const [sx0, sy0, sx1, sy1] = L.shelf;
    for (const bx of [sx0 + 40, sx0 + 190]) { g.fillStyle = C0.woodDark; g.beginPath(); g.moveTo(bx, sy1); g.lineTo(bx + 14, sy1); g.lineTo(bx + 14, sy1 + 60); g.closePath(); g.fill(); }
    block(g, sx0 - 6, sy0, sx1 - sx0 + 30, sy1 - sy0, C0.wood, { r: 5, lit: 0.25, dark: 0.25, band: 0.3 });
    // a framed drawing, for life on the wall
    block(g, 640, 600, 130, 104, C0.woodDark, { r: 6, band: 0.1 });
    g.fillStyle = '#bfe0f0'; g.fillRect(654, 614, 102, 76);
    g.fillStyle = C0.green; g.beginPath(); g.moveTo(654, 690); g.lineTo(690, 648); g.lineTo(720, 676); g.lineTo(740, 660); g.lineTo(756, 690); g.closePath(); g.fill();
    g.fillStyle = C0.yellow; g.beginPath(); g.arc(730, 634, 10, 0, Math.PI * 2); g.fill();
  }

  // ------------------------------------------------------------------ the chain's toys (poses from the bake)
  const pose = (id, b) => B.at(id, b);
  const BOXCOL = [['#e2412f', '#f5c026'], ['#2f6fd0', '#fffdf8'], ['#3a9a5b', '#f5c026']];
  function cereal(g, b, i) {
    const [x, y, a] = pose('d' + (i + 1), b), [w, h] = L.doms[i];
    body(g, x, y, a, w + 2, h + 2, BOXCOL[i][0], { r: 4, band: 0.06, paint: (g, w, h) => {
      g.fillStyle = BOXCOL[i][1]; g.beginPath(); g.arc(0, -h * 0.18, w * 0.32, 0, Math.PI * 2); g.fill();
      g.fillRect(-w / 2 + 3, h * 0.12, w - 6, 5); g.fillRect(-w / 2 + 3, h * 0.22, w - 6, 5);
    } });
  }
  function marble(g, b) {
    const [x, y, a] = pose('marble', b), r = L.marble.r;
    ball(g, x, y, r, '#3a7be0', a, { stripe: 'rgba(255,255,255,0.75)' });
  }
  function melon(g, b) {
    const [x, y, a] = pose('melon', b), r = L.melon.r;
    g.fillStyle = C0.shadow; g.beginPath(); g.arc(x + 6, y + 8, r, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = '#4aa24e'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#25703a'; for (let k = -3; k <= 3; k++) { g.beginPath(); g.ellipse(k * 13, 0, 4.5, r * 1.1, k * 0.08, 0, Math.PI * 2); g.fill(); }
    g.restore(); g.restore();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
    g.fillStyle = 'rgba(0,40,10,0.22)'; g.beginPath(); g.arc(x + r * 0.4, y + r * 0.45, r, 0, Math.PI * 2); g.arc(x, y, r * 1.6, 0, Math.PI * 2, true); g.fill();
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2); g.fill();
  }
  function track(g) {
    const [[x0, y0], [x1, y1], th] = L.ramp, a = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0);
    const nx = Math.sin(a), ny = -Math.cos(a);
    body(g, (x0 + x1) / 2 - nx * th / 2, (y0 + y1) / 2 - ny * th / 2, a, len + 6, th, C0.yellow, { r: 5, band: 0.3 });
    const [bx0, by0, bx1, by1] = L.rampBlock; block(g, bx0, by0, bx1 - bx0, by1 - by0, C0.blue, { r: 5 });
  }
  function pin(g) {
    const [x, y, r] = L.pin;
    g.fillStyle = C0.shadow; g.beginPath(); g.ellipse(x + 4, FLOOR + 2, r + 10, 7, 0, 0, Math.PI * 2); g.fill();
    ball(g, x, y, r, C0.woodLight, 0, { shadow: false });
    g.fillStyle = C0.woodDark; g.beginPath(); g.arc(x, y, r * 0.35, 0, Math.PI * 2); g.fill();
  }
  function plank(g, b) {
    const [x, y, a] = pose('plank', b);
    body(g, x, y, a, L.plank.len + 2, L.plank.th + 2, C0.wood, { r: 6, band: 0.3, paint: (g, w, h) => {
      g.fillStyle = 'rgba(120,70,30,0.35)'; for (let k = -2; k <= 2; k++) g.fillRect(k * 56 - 18, -1, 36, 2);
    } });
  }
  // the cake: sponge, cream layer, pink icing with a cherry; once stuck, the icing is squashed flat on the ceiling and drips
  const STUCK = B.info.stuckAt, PLATE_LANDS = 5.81;   // from the bake: the icing touches the ceiling; the plate lands
  function cake(g, b) {
    const [x, y, a] = pose('cake', b), w = L.cake.w, h = L.cake.h;
    const stuck = b >= STUCK, k = clamp((b - STUCK) / 1.2), squash = stuck ? Math.min(1, (b - STUCK) * 8) : 0;
    g.save(); g.translate(x, y);
    if (!stuck) { g.save(); g.translate(5, 7); g.rotate(a); g.fillStyle = C0.shadow; rrect(g, -w / 2, -h / 2, w, h, 12); g.fill(); g.restore(); }
    g.rotate(a);
    const top = -h / 2, sp = '#f7c25e', cr = '#fffaf0';
    // two sponge layers with cream between them
    g.fillStyle = sp; rrect(g, -w / 2, top + 16, w, h - 16, 9); g.fill();
    g.fillStyle = shade(sp, -0.16); g.fillRect(-w / 2 + 4, h / 2 - 10, w - 8, 8);
    g.fillStyle = cr; g.fillRect(-w / 2, top + 16 + (h - 16) * 0.42, w, 13);
    g.fillStyle = '#e8708a'; g.fillRect(-w / 2, top + 16 + (h - 16) * 0.42 + 13, w, 4);
    g.fillStyle = 'rgba(160,90,40,0.18)'; for (let i = 0; i < 9; i++) g.fillRect(-w / 2 + 8 + i * 13, top + 26 + (i % 3) * 7, 3, 3);
    // icing: thick on top, squashed flat and wider once it hits the ceiling, with drips down the sides
    const iw = w + 8 + 30 * squash, ih = 26 - 8 * squash;
    g.fillStyle = C0.pink; rrect(g, -iw / 2, top - (stuck ? 2 : 8), iw, ih, 12); g.fill();
    for (let i = 0; i < 7; i++) {
      const dx = -w / 2 + 9 + i * ((w - 18) / 6), len = 6 + 8 * rnd('d0', i) + (stuck ? 8 * k * rnd('drip', i) : 0);
      g.beginPath(); g.moveTo(dx - 7, top + 10); g.lineTo(dx + 7, top + 10); g.lineTo(dx + 5, top + 12 + len); g.arc(dx, top + 12 + len, 5, 0, Math.PI); g.closePath(); g.fill();
    }
    g.fillStyle = shade(C0.pink, 0.28); g.fillRect(-iw / 2 + 10, top - (stuck ? 0 : 5), iw - 20, 5);
    if (!stuck) {
      ball(g, 0, top - 18, 13, C0.red, 0, { shadow: false });
      g.strokeStyle = C0.greenDark; g.lineWidth = 3; g.beginPath(); g.moveTo(2, top - 30); g.quadraticCurveTo(10, top - 44, 18, top - 42); g.stroke();
    }
    g.restore();
    if (stuck) {   // icing flicked onto the ceiling around it, and the cherry, stuck beside it
      const u = clamp((b - STUCK) / 0.25);
      for (let i = 0; i < 8; i++) {
        const side = i % 2 ? 1 : -1, d = 80 + 140 * rnd('blob', i), r = 7 + 10 * rnd('blobr', i);
        const bx = x + side * d * E.out(u), by = CEIL + r * 0.8 + 6 * rnd('blobv', i) + (1 - u) * 30;
        g.fillStyle = C0.pink; g.beginPath(); g.ellipse(bx, by, r * 1.3, r * 0.75, 0, 0, Math.PI * 2); g.fill();
      }
      ball(g, x + 132 * E.out(u), CEIL + 14, 13, C0.red, 0, { shadow: false });
    }
  }
  // the icing splat on the ceiling, drawn behind the stuck cake
  function splat(g, b) {
    if (b < STUCK) return;
    const [x] = pose('cake', b), u = clamp((b - STUCK) / 0.2), grow = clamp((b - STUCK) / 1.4);
    g.fillStyle = C0.pink;
    g.beginPath(); g.moveTo(x - 120 * E.out(u), CEIL);
    for (let i = 0; i <= 16; i++) { const xx = x + (-120 + 240 * i / 16) * E.out(u); g.lineTo(xx, CEIL + (i % 2 ? 9 : 17) * E.out(u)); }
    g.lineTo(x + 120 * E.out(u), CEIL); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) {
      const dx = x + (-108 + 216 * i / 5) * E.out(u); if (Math.abs(dx - x) < 64) continue;
      const len = (16 + 40 * rnd('sd', i)) * grow;
      g.beginPath(); g.moveTo(dx - 6, CEIL + 6); g.lineTo(dx + 6, CEIL + 6); g.lineTo(dx + 4, CEIL + 10 + len); g.arc(dx, CEIL + 10 + len, 5, 0, Math.PI); g.closePath(); g.fill();
    }
  }
  function plate(g, b) {
    const [x, y, a] = pose('plate', b), w = L.plate.w;
    const broken = b >= PLATE_LANDS;
    if (!broken) { body(g, x, y, a, w, L.plate.h + 2, '#f6f9fb', { r: 5, band: 0.3 }); return; }
    const s = clamp((b - PLATE_LANDS) / 0.15);   // it lands and cracks in two
    body(g, x - 34 - 10 * s, y + 2, a - 0.12 * s, w / 2, L.plate.h + 2, '#f6f9fb', { r: 4, band: 0.3 });
    body(g, x + 32 + 12 * s, y + 3, a + 0.18 * s, w / 2 - 6, L.plate.h + 2, '#f6f9fb', { r: 4, band: 0.3 });
  }

  // ------------------------------------------------------------------ the cat (keyed on the chain's clock)
  const NOSE0 = [876, 726];
  function catPose(b, p) {
    const sleep = b < 1.82;
    let head = 0;
    head += key(b, [[1.35, 0], [1.75, -0.32, 'inOut'], [1.8, 0.2, 'in2'], [1.95, 0.0, 'out']]);
    head += key(b, [[4.52, 0], [4.75, -0.42, 'out'], [5.2, -0.38], [5.6, 0, 'inOut']]);   // watches the cake go up
    const jolt = key(b, [[1.78, 0], [1.82, 1, 'in2'], [2.05, 0, 'out']]) + key(b, [[STUCK - 0.01, 0], [STUCK + 0.04, 0.8, 'in2'], [STUCK + 0.3, 0, 'out']]) + key(b, [[PLATE_LANDS - 0.01, 0], [PLATE_LANDS + 0.04, 0.6], [PLATE_LANDS + 0.25, 0, 'out']]);
    // where the eyes look: the marble, the boxes, the melon, the cake, the plate, then you
    const tgt = b < 2.6 ? pose('marble', b) : b < 3.4 ? [560, 920] : b < 4.55 ? pose('melon', b) : b < 5.2 ? pose('cake', b) : b < 5.9 ? pose('plate', b) : [640, 1100];
    const ear = sleep ? key(b, [[1.15, 0], [1.2, 1], [1.28, 0], [1.5, 0], [1.55, 1], [1.62, 0]]) : (b > STUCK && b < 6.3 ? -1 : 0.2);
    const breathe = sleep ? Math.sin(p / CYC * 2 * Math.PI * 2) * 0.5 + 0.5 : 0;
    const blink = !sleep && ((p % (CYC / 2)) < 0.12);
    return { head, jolt, tgt, ear, breathe, sleep, blink };
  }
  function cat(g, b, p) {
    const c = catPose(b, p), sy = L.shelf[1];
    const orange = '#f08a24', dark = '#c4651a';
    g.save();
    g.translate(0, -c.jolt * 8);
    // body lying on the shelf, rear off-frame right; a tail hanging over the shelf's edge
    g.fillStyle = C0.shadow; rrect(g, 940, sy - 48, 200, 52, 26); g.fill();
    g.fillStyle = orange; rrect(g, 930, sy - 56 - c.breathe * 3, 200, 58 + c.breathe * 3, 28); g.fill();
    g.fillStyle = dark; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(975 + k * 34, sy - 40, 7, 16, 0.2, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = orange; g.lineWidth = 16; g.lineCap = 'round';
    const sw = Math.sin(p / CYC * 2 * Math.PI * 3) * (c.sleep ? 4 : 10);
    g.beginPath(); g.moveTo(1050, sy + 4); g.quadraticCurveTo(1060 + sw, sy + 70, 1030 + sw * 1.5, sy + 120); g.stroke();
    // paws in front
    g.fillStyle = shade(orange, 0.15); rrect(g, 878, sy - 18, 40, 18, 9); g.fill(); rrect(g, 912, sy - 16, 34, 16, 8); g.fill();
    // head, pivoting on the neck
    g.translate(936, sy - 34); g.rotate(c.head);
    const hx = -32, hy = -16;
    // ears
    for (const [ex, flip] of [[-14, -1], [18, 1]]) {
      const tilt = c.ear * 0.25 * flip;
      g.save(); g.translate(hx + ex, hy - 34); g.rotate(tilt + flip * 0.15);
      g.fillStyle = orange; g.beginPath(); g.moveTo(-15, 8); g.lineTo(0, -26); g.lineTo(15, 8); g.closePath(); g.fill();
      g.fillStyle = '#f7a1b5'; g.beginPath(); g.moveTo(-7, 5); g.lineTo(0, -14); g.lineTo(7, 5); g.closePath(); g.fill();
      g.restore();
    }
    g.fillStyle = orange; g.beginPath(); g.ellipse(hx, hy, 44, 38, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(orange, 0.22); g.beginPath(); g.ellipse(hx - 26, hy + 12, 22, 17, 0, 0, Math.PI * 2); g.fill();   // muzzle
    g.fillStyle = dark; g.beginPath(); g.ellipse(hx + 2, hy - 30, 6, 10, 0, 0, Math.PI * 2); g.fill();
    // eyes
    const ex = hx - 14, ey = hy - 6;
    g.strokeStyle = '#3a2416'; g.lineWidth = 4; g.lineCap = 'round';
    if (c.sleep) {
      const squeeze = key(b, [[1.4, 0], [1.75, 1]]);
      for (const ox of [-12, 12]) { g.beginPath(); g.arc(ex + ox, ey - 2 * squeeze, 7, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    } else {
      const wide = b > STUCK - 0.05 && b < 6.4 ? 1.15 : 1;
      for (const ox of [-12, 12]) {
        g.fillStyle = C0.white; g.beginPath(); g.ellipse(ex + ox, ey, 11 * wide, (c.blink ? 2 : 13) * wide, 0, 0, Math.PI * 2); g.fill();
        if (!c.blink) {
          // pupils toward the target, in the head's own frame
          const wx = 936 + Math.cos(c.head) * (ex + ox) - Math.sin(c.head) * ey, wy = sy - 34 + Math.sin(c.head) * (ex + ox) + Math.cos(c.head) * ey;
          const ang = Math.atan2(c.tgt[1] - wy, c.tgt[0] - wx) - c.head;
          g.fillStyle = '#2b1d14'; g.beginPath(); g.ellipse(ex + ox + Math.cos(ang) * 4, ey + Math.sin(ang) * 5, 5, 8, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = C0.white; g.beginPath(); g.arc(ex + ox + Math.cos(ang) * 4 - 2, ey + Math.sin(ang) * 5 - 3, 2, 0, Math.PI * 2); g.fill();
        }
      }
    }
    // nose, mouth (open for the sneeze), whiskers
    const open = key(b, [[1.45, 0], [1.75, 0.6], [1.8, 1], [1.9, 0.2], [2.0, 0]]);
    g.fillStyle = '#e8708a'; g.beginPath(); g.moveTo(hx - 46, hy + 2); g.lineTo(hx - 36, hy + 2); g.lineTo(hx - 41, hy + 9); g.closePath(); g.fill();
    g.fillStyle = '#7a2a2a'; g.beginPath(); g.ellipse(hx - 38, hy + 18, 7, 2 + 9 * open, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(60,35,20,0.8)'; g.lineWidth = 2;
    const tw = c.sleep && b > 1.0 ? Math.sin(b * 60) * 0.12 : 0;
    for (const [dy, d] of [[4, -0.12], [10, 0.05], [16, 0.2]]) { g.beginPath(); g.moveTo(hx - 30, hy + dy); g.lineTo(hx - 70, hy + dy + (d + tw) * 40); g.stroke(); }
    g.restore();
  }
  // the nose in the screen's frame (for the fly and the sneeze), from the same transforms as cat()
  function noseAt(b, p) {
    const c = catPose(b, p), sy = L.shelf[1], hx = -32 - 44, hy = -16 + 4;
    return [936 + Math.cos(c.head) * hx - Math.sin(c.head) * hy, sy - 34 - c.jolt * 8 + Math.sin(c.head) * hx + Math.cos(c.head) * hy];
  }
  function sneezePuff(g, b) {
    if (b < 1.8 || b > 2.35) return;
    const u = (b - 1.8) / 0.55, [nx, ny] = [858, 720];
    for (let i = 0; i < 9; i++) {
      const d = E.out(u) * (60 + 130 * rnd('puff', i)), ang = Math.PI + rs('pang', i) * 0.45, r = (10 + 16 * rnd('pr', i)) * (0.6 + u);
      g.fillStyle = `rgba(255,255,255,${0.85 * (1 - u)})`; g.beginPath(); g.arc(nx + Math.cos(ang) * d, ny + Math.sin(ang) * d, r, 0, Math.PI * 2); g.fill();
    }
  }

  // ------------------------------------------------------------------ the fly: a path on the chain's clock
  const wob = n1('flyw'), wob2 = n1('flyw2');
  function flyAt(b, p) {
    const nose = noseAt(Math.min(b, 1.79), p);
    const ON_CAKE = [pose('cake', 7)[0] + 22, CEIL + 2 * L.cake.h / 2 + 8];
    if (b < 1.0) {                       // flies in from the left, zig-zagging, and lands on the nose
      const u = E.inOut(b / 1.0);
      return [lerp(-40, nose[0] + 10, u) + wob(b * 6) * 40 * (1 - u), lerp(560, nose[1] - 26, u) + wob2(b * 7) * 50 * (1 - u), 1];
    }
    if (b < 1.8) return [nose[0] + 10 + Math.sin(b * 9) * 2, nose[1] - 26, 0];   // on top of the snout, stepping about
    if (b < 2.3) {                       // blown off by the sneeze, tumbling
      const u = (b - 1.8) / 0.5;
      return [nose[0] + 10 - 240 * E.out(u), nose[1] - 26 - 60 * Math.sin(u * Math.PI) + 40 * u, 2];
    }
    if (b < 6.0) {                       // buzzing around the room
      const s = b - 2.3, cx = 640 + 120 * Math.sin(s * 1.3), cy = 620 + 90 * Math.cos(s * 1.7);
      const fade = clamp((b - 5.4) / 0.6);
      return [lerp(cx + wob(s * 5) * 60, ON_CAKE[0], E.inOut(fade)), lerp(cy + wob2(s * 5) * 60, ON_CAKE[1], E.inOut(fade)), 1];
    }
    return [ON_CAKE[0], ON_CAKE[1], 3];   // on the cake, under it (upside down), rubbing its front legs
  }
  function fly(g, b, p, scale = 1) {
    const [x, y, mode] = flyAt(b, p);
    g.save(); g.translate(x, y); g.scale(scale, scale);
    if (mode === 3) g.scale(1, -1);
    if (mode === 2) g.rotate((b - 1.8) * 30);
    const flap = mode === 1 || mode === 2 ? (Math.floor(p * 30) % 2) : 0;
    g.fillStyle = 'rgba(210,235,255,0.85)';
    g.beginPath(); g.ellipse(-3, -9 - flap * 3, 8, 4 + flap * 2, -0.5 - flap * 0.6, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(5, -9 - flap * 3, 8, 4 + flap * 2, 0.5 + flap * 0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d1b1f'; g.beginPath(); g.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(-10, -1, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c0362c'; g.beginPath(); g.arc(-13, -3, 3.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(-9, -5, 3.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#1d1b1f'; g.lineWidth = 2;
    const rub = mode === 3 ? Math.sin(p / (CYC / 7) * 2 * Math.PI) * 3 : 0;
    for (const [lx, d] of [[-6, rub], [0, 0], [6, 0]]) { g.beginPath(); g.moveTo(lx, 5); g.lineTo(lx - 3 + d, 12); g.stroke(); }
    g.restore();
    return [x, y];
  }

  // ------------------------------------------------------------------ the other suspects: the cuckoo clock and the toaster
  function clock(g, b, p) {
    const x = 170, y = 640;
    // pendulum swings on the world's idle clock
    const sw = Math.sin(p / (CYC / 2) * 2 * Math.PI) * 0.35;
    g.save(); g.translate(x, y + 70); g.rotate(sw);
    g.strokeStyle = C0.woodDark; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 120); g.stroke();
    ball(g, 0, 128, 16, C0.yellow, 0, { shadow: false }); g.restore();
    // the house
    g.fillStyle = C0.shadow; g.beginPath(); g.moveTo(x - 80 + 8, y - 30 + 10); g.lineTo(x + 8, y - 110 + 10); g.lineTo(x + 80 + 8, y - 30 + 10); g.lineTo(x + 70 + 8, y + 90 + 10); g.lineTo(x - 70 + 8, y + 90 + 10); g.closePath(); g.fill();
    block(g, x - 70, y - 40, 140, 130, C0.woodDark, { r: 8, shadow: false });
    g.fillStyle = C0.redDark; g.beginPath(); g.moveTo(x - 86, y - 30); g.lineTo(x, y - 112); g.lineTo(x + 86, y - 30); g.closePath(); g.fill();
    g.fillStyle = C0.red; g.beginPath(); g.moveTo(x - 76, y - 34); g.lineTo(x, y - 104); g.lineTo(x + 76, y - 34); g.closePath(); g.fill();
    ball(g, x, y + 22, 40, C0.cream, 0, { shadow: false });
    g.strokeStyle = C0.ink; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y + 22); g.lineTo(x + 18, y + 10); g.stroke(); g.beginPath(); g.moveTo(x, y + 22); g.lineTo(x - 4, y - 6); g.stroke();
    // the little door and the bird, which shoots out at the splat and stays out, bobbing
    const out = key(b, [[STUCK, 0], [STUCK + 0.11, 1.15, 'out'], [STUCK + 0.23, 1, 'inOut']]);
    const bob = out > 0.9 ? Math.sin(p / (CYC / 5) * 2 * Math.PI) * 4 : 0;
    g.fillStyle = '#3a2416'; rrect(g, x - 20, y - 74, 40, 34, 6); g.fill();
    if (out > 0) {
      const bx = x - 4 - 52 * out, by = y - 58 + bob;
      g.strokeStyle = C0.grey; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 6; k++) g.lineTo(x - 6 - 52 * out * k / 6, y - 58 + (k % 2 ? -5 : 5)); g.stroke();
      ball(g, bx, by, 15, C0.yellow, 0, { shadow: false });
      g.fillStyle = '#e8701a'; g.beginPath(); g.moveTo(bx - 14, by - 3); g.lineTo(bx - 28, by + 2); g.lineTo(bx - 14, by + 5); g.closePath(); g.fill();
      g.fillStyle = C0.ink; g.beginPath(); g.arc(bx - 5, by - 5, 3, 0, Math.PI * 2); g.fill();
    } else { g.fillStyle = C0.woodLight; rrect(g, x - 16, y - 70, 32, 26, 4); g.fill(); }
  }
  function toaster(g, b) {
    const x = 846, y = CT - 70;
    const pop = key(b, [[3.38, 0], [3.5, 70, 'out'], [3.62, 54, 'in2'], [3.72, 58, 'out']]);
    g.save(); g.beginPath(); g.rect(x, y - 200, 110, 220); g.rect(x - 400, y + 10, 900, 300); g.clip('evenodd');
    block(g, x + 22, y - 18 - pop, 66, 64, '#d9a066', { r: 12, band: 0.25 });
    block(g, x + 28, y - 12 - pop, 54, 52, '#eabd86', { r: 10, shadow: false, band: 0.15 });
    g.restore();
    block(g, x, y, 100, 70, C0.red, { r: 18, band: 0.22 });
    g.fillStyle = shade(C0.red, -0.4); rrect(g, x + 18, y + 2, 74, 9, 4); g.fill();
    g.fillStyle = C0.greyDark; rrect(g, x + 100, y + 22, 10, 20, 3); g.fill();
  }

  // ------------------------------------------------------------------ the words, the numbered suspects, the rewind sign
  function token(g, x, y, n, s = 1, hi = false) {
    if (s <= 0.01) return;
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = C0.shadow; g.beginPath(); g.arc(4, 6, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = hi ? C0.red : C0.yellowDark; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = hi ? shade(C0.red, 0.15) : C0.yellow; g.beginPath(); g.arc(0, -2, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = hi ? C0.white : C0.ink; g.font = '700 40px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 0, 0);
    g.restore();
  }
  function lead(g, x0, y0, x1, y1, s) {   // a thin string from the token to its suspect
    if (s <= 0.01) return;
    g.save(); g.globalAlpha = s; g.strokeStyle = 'rgba(43,33,24,0.55)'; g.lineWidth = 3; g.setLineDash([2, 8]); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, s), lerp(y0, y1, s)); g.stroke(); g.restore();
  }
  // the suspects show at frame 0 and come back at the loop's end
  const showQ = (t) => (t < REW0 ? 1 - seg(t, REW0 - 0.18, REW0, 'in2') : seg(t, FWD1 + 0.05, FWD1 + 0.45, 'overshoot'));
  function suspects(g, t, flyXY) {
    const s = showQ(t);
    const T4 = [[1, 812, 610, 900, 690], [2, 300, 470, 220, 560], [3, flyXY[0] + 92, flyXY[1] + 66, flyXY[0] + 12, flyXY[1] + 8], [4, 905, 850, 920, 925]];
    for (const [n, x, y, tx, ty] of T4) { lead(g, x, y, tx, ty, s); token(g, x, y, n, s); }
    if (s > 0.01) {
      g.save(); g.globalAlpha = Math.min(1, s * 1.4);
      const lift = (1 - Math.min(1, s)) * 30;
      words(g, 'WHO STARTED', 72, 1120 + lift, { size: 104, col: C0.red });
      words(g, 'THIS?', 72, 1228 + lift, { size: 104, col: C0.red });
      g.restore();
    }
  }
  function rewindSign(g, t) {
    const on = t >= REW0 && t < REW1 + 0.1 ? 1 : 0;
    if (!on) return;
    const s = seg(t, REW0, REW0 + 0.2, 'overshoot') * (1 - seg(t, REW1 - 0.1, REW1 + 0.1));
    if (s <= 0.01) return;
    const pulse = 1 + 0.06 * Math.sin((t - REW0) * 18);
    g.save(); g.translate(170, 1180); g.scale(s * pulse, s * pulse);
    block(g, -110, -64, 220, 128, C0.blue, { r: 24, band: 0.2 });
    g.fillStyle = C0.white;
    for (const ox of [-38, 22]) { g.beginPath(); g.moveTo(ox + 34, -36); g.lineTo(ox - 14, 0); g.lineTo(ox + 34, 36); g.closePath(); g.fill(); }
    g.restore();
  }
  function reveal(g, t, b, p, cam) {
    if (t < REW1 - 0.05 || t >= FWD0) return;
    const s = seg(t, REW1, REW1 + 0.25, 'overshoot'), out = seg(t, FWD0 - 0.2, FWD0, 'in2');
    const [fx0, fy0] = flyAt(b, p), [fx, fy] = cam.to(fx0, fy0 - 4);
    g.save(); g.globalAlpha = 1 - out;
    // a ring round the fly on the cat's nose (in the close-up, so it's big)
    g.strokeStyle = C0.red; g.lineWidth = 12; g.beginPath(); g.arc(fx, fy, 70 * s + 6, 0, Math.PI * 2); g.stroke();
    token(g, fx - 96, fy - 120, 3, s * 1.5, true);
    words(g, 'THE FLY.', 72, 1120 + (1 - s) * 40, { size: 132, col: C0.red });
    words(g, 'NOT THE CAT.', 76, 1222 + (1 - s) * 40, { size: 70, col: C0.blue, depth: 5 });
    g.restore();
  }

  // ------------------------------------------------------------------ the camera: cuts, no drift
  // The wide shot holds the whole chain. At the freeze it cuts to a close-up on the cat's nose (the cause, big), stays
  // there for the sneeze, and cuts back to the wide as the marble leaves the shelf.
  const CLOSE = { s: 2.0, cx: 810, cy: 730 }, CUT_IN = REW1, CUT_OUT = FWD0 + 1.02;
  function camera(t) {
    const c = t >= CUT_IN && t < CUT_OUT ? CLOSE : { s: 1, cx: W / 2, cy: H / 2 };
    return { ...c, apply(g) { g.translate(W / 2, H / 2); g.scale(c.s, c.s); g.translate(-c.cx, -c.cy); },
      to: (x, y) => [W / 2 + (x - c.cx) * c.s, H / 2 + (y - c.cy) * c.s] };
  }

  // ------------------------------------------------------------------ the frame
  LAB.film({
    draw(g, t0) {
      const t = LAB.loopT(t0, LOOP), b = chain(t), p = phi(t), cam = camera(t);
      g.save(); cam.apply(g);
      if (cam.s === 1) g.drawImage(tex('set', W, H, paintSet), 0, 0); else paintSet(g);   // crisp in the close-up
      clock(g, b, p);
      toaster(g, b);
      track(g);
      for (let i = 0; i < 3; i++) cereal(g, b, i);
      marble(g, b);
      plate(g, b);
      melon(g, b);
      pin(g);
      plank(g, b);
      splat(g, b);
      cake(g, b);
      cat(g, b, p);
      sneezePuff(g, b);
      const flyXY = fly(g, b, p);
      g.restore();
      suspects(g, t, flyXY);
      rewindSign(g, t);
      reveal(g, t, b, p, cam);
      LAB.safeOverlay(g);
    },
  });
})();
