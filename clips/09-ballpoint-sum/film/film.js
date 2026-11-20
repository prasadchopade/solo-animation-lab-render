// The Wrong Sum (lab clip 09): blue ballpoint on lined paper. A doodle monster lives on someone's maths homework,
// chewing the margin. The teacher's shadow falls across the page; the monster panics and freezes as the empty answer:
// 7 x 8 = 54. The teacher's red pen ticks it. The shadow leaves; the "5" opens one eye and winks. The wrong answer stays
// marked right, so the correcting is left to you. Ballpoint lines boil on twos; nothing eases on a spring.
(() => {
  const { W, H, seg, clamp, lerp, E, rnd, rs, held, drawing } = LAB;
  C.fonts = ['700 80px Caveat'];
  const N = 2, SHADOW_IN = 2.3, FREEZE = 2.75, FROZEN = 3.35, PEN0 = 3.9, TICK0 = 4.6, TICK1 = 5.0, SHADOW_OUT = 6.0, WINK = 7.4;
  const INK = '#203a9e', RED = '#d42a2a', PAPER = '#fdfcf7', RULE = '#b9cdf0', MARGIN = '#e89a9a';
  const ANS = [520, 1150];                                   // where the answer goes, right after the "7 x 8 =" on the last line
  const PUNCH = WINK - 0.3, ZOOM = 2.4, ZX = 600, ZY = 1080; // the close-up for the wink: "= 54 ✓", the tick's tip at x 900

  // a ballpoint line: even width, a little blob where the pen first touched, redrawn (boiling) on each drawing
  function pen(g, pts, w, col, seed, amp = 1.3) {
    const P = pts.map(([x, y], i) => [x + rs(seed, i, 'x', boilNo) * amp, y + rs(seed, i, 'y', boilNo) * amp]);
    g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.92;
    g.beginPath(); g.moveTo(...P[0]); for (const p of P.slice(1)) g.lineTo(...p); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(P[0][0], P[0][1], w * 0.75, 0, Math.PI * 2); g.fill(); g.restore();
  }
  let boilNo = 0;
  const circle = (cx, cy, rx, ry, n = 24, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

  // ------------------------------------------------------------------ the page
  function page(g) {
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    g.strokeStyle = RULE; g.lineWidth = 3; for (let y = 430; y < H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = MARGIN; g.lineWidth = 4; g.beginPath(); g.moveTo(150, 0); g.lineTo(150, H); g.stroke();
    for (const y of [520, 960, 1400]) { g.fillStyle = '#e9e4d6'; g.beginPath(); g.arc(70, y, 26, 0, Math.PI * 2); g.fill(); }   // punched holes
    g.fillStyle = 'rgba(120,110,90,0.05)'; for (let k = 0; k < 400; k++) g.fillRect(rnd('pg', k) * W, rnd('ph', k) * H, 2, 1);
  }
  function homework(g) {
    g.save(); g.fillStyle = INK; g.font = '700 84px Caveat'; g.textBaseline = 'alphabetic';
    g.save(); g.fillStyle = '#c0262a'; g.font = '700 74px Caveat'; g.fillText('when the teacher walks past...', 190, 330); g.restore();
    g.fillText('Maths homework', 190, 430);
    g.font = '700 92px Caveat';
    for (const [s, y] of [['3 × 4 = 12', 610], ['6 × 5 = 30', 790], ['9 × 2 = 18', 970], ['7 × 8 =', 1150]]) g.fillText(s, 200, y);
    g.restore();
  }

  // ------------------------------------------------------------------ the monster
  function monster(g, t, cx, cy, s = 1, panic = 0) {
    const th = held(t, N), chew = Math.sin(th * 10) * (1 - panic), bob = Math.sin(th * 5) * 8 * (1 - panic);
    g.save(); g.translate(cx, cy + bob); g.scale(s, s);
    // fur: a fuzzy round body, its outline drawn as short spiky strokes, hatched inside
    const R = 150, fur = [];
    for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 2, r = R + (k % 2 ? 16 : -4) + rs('fur', k, boilNo) * 4; fur.push([Math.cos(a) * r * 1.05, Math.sin(a) * r * 0.92]); }
    pen(g, fur, 6, INK, 'fur');
    g.save(); g.beginPath(); g.ellipse(0, 0, R, R * 0.88, 0, 0, Math.PI * 2); g.clip();
    for (let k = -10; k <= 10; k++) pen(g, [[-200 + k * 22, 160], [k * 22 + 40, -190]], 2.5, INK, 'hatch' + k, 2);
    g.restore();
    // horns, eyes (wide in panic), a chewing mouth with teeth, stubby arms and feet
    pen(g, [[-70, -120], [-95, -190], [-50, -140]], 6, INK, 'hornL'); pen(g, [[70, -120], [95, -190], [50, -140]], 6, INK, 'hornR');
    for (const ex of [-52, 52]) {
      g.fillStyle = PAPER; g.beginPath(); g.ellipse(ex, -40, 40 + 12 * panic, 44 + 14 * panic, 0, 0, Math.PI * 2); g.fill();
      pen(g, circle(ex, -40, 40 + 12 * panic, 44 + 14 * panic, 20), 6, INK, 'eye' + ex);
      g.fillStyle = INK; g.beginPath(); g.arc(ex + 8, -34, 15 - 6 * panic, 0, Math.PI * 2); g.fill();
    }
    const my = 60, mw = 90, open = 14 + 12 * Math.abs(chew) + 30 * panic;
    g.fillStyle = PAPER; g.beginPath(); g.ellipse(0, my, mw, open, 0, 0, Math.PI * 2); g.fill();
    pen(g, circle(0, my, mw, open, 22), 6, INK, 'mouth');
    pen(g, [[-70, my - open * 0.4], [-50, my + 8], [-30, my - open * 0.4], [-10, my + 8], [10, my - open * 0.4], [30, my + 8], [50, my - open * 0.4], [70, my + 8]], 4, INK, 'teeth');
    for (const s2 of [-1, 1]) { pen(g, [[s2 * 140, 20], [s2 * 200, -20 + chew * 20], [s2 * 215, -50]], 6, INK, 'arm' + s2); pen(g, [[s2 * 60, 130], [s2 * 70, 190], [s2 * 100, 196]], 6, INK, 'leg' + s2); }
    g.restore();
  }

  // the answer, in the monster's own ballpoint: "54", written in place as it freezes. The 5 can open an eye.
  function answer(g, t, k, wink = 0) {
    if (k <= 0) return;
    const [x0, base] = ANS, th = held(t, N), S = 0.55, x = x0, y = base - 112 * S;
    // the 5: a flag, a back, a belly (drawn at handwriting size, sitting on the line)
    const sc = (pts) => pts.map(([px, py]) => [x + (px - x) * S, y + (py - y) * S]);
    const five = sc([[x + 70, y - 30], [x + 10, y - 30], [x + 4, y + 30], [x + 40, y + 20], [x + 74, y + 44], [x + 70, y + 90], [x + 34, y + 112], [x, y + 96]]);
    const four = sc([[x + 170, y + 112], [x + 170, y - 34], [x + 106, y + 60], [x + 196, y + 60]]);
    const part = (pts, a) => pts.slice(0, Math.max(2, Math.ceil(pts.length * clamp(a))));
    pen(g, part(five, k * 1.6), 6, INK, 'five');
    if (k > 0.45) pen(g, part(four, (k - 0.45) * 1.9), 6, INK, 'four');
    // the 5's eye: shut (a flat line) while it plays dead; wink 1 = open and looking at you, 2 = the wink itself
    // (a happy closed curve), each with a grin
    if (k >= 1) {
      const e = [x + 24, y + 36];
      if (wink === 1) { g.fillStyle = INK; g.beginPath(); g.arc(e[0], e[1], 8, 0, Math.PI * 2); g.fill(); }
      else if (wink === 2) pen(g, [[e[0] - 9, e[1] + 2], [e[0] - 4, e[1] - 4], [e[0] + 4, e[1] - 4], [e[0] + 9, e[1] + 2]], 4, INK, 'winked');
      else pen(g, [[e[0] - 6, e[1]], [e[0] + 6, e[1]]], 3, INK, 'shut');
      if (wink) pen(g, [[e[0] - 11, e[1] + 15], [e[0] - 3, e[1] + 21], [e[0] + 6, e[1] + 21], [e[0] + 12, e[1] + 14]], 4, INK, 'grin');
    }
  }
  // the teacher: only a big shadow, and a hand with a red pen that ticks the answer
  function teacher(g, t) {
    const inn = E.inOut(seg(t, SHADOW_IN, SHADOW_IN + 0.5)), out = E.inOut(seg(t, SHADOW_OUT, SHADOW_OUT + 0.6)), k = inn * (1 - out);
    if (k <= 0) return;
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(70,75,110,${0.42 * k})`;
    const sx = lerp(1500, 620, k);
    g.beginPath(); g.ellipse(sx + 120, 380, 240, 290, 0, 0, Math.PI * 2); g.ellipse(sx + 160, 1100, 520, 640, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    // the hand and pen: in from the right, a tick drawn on, out again
    const hin = E.out(seg(t, PEN0, PEN0 + 0.45)) * (1 - E.inOut(seg(t, TICK1 + 0.4, TICK1 + 0.9)));
    if (hin <= 0) return;
    const tick = [[ANS[0] + 140, ANS[1] - 40], [ANS[0] + 166, ANS[1] - 6], [ANS[0] + 230, ANS[1] - 90]];
    const tk = seg(t, TICK0, TICK1), tip = tk <= 0 ? [lerp(1200, tick[0][0], hin), lerp(1300, tick[0][1], hin)] : tk < 0.4 ? [lerp(tick[0][0], tick[1][0], tk / 0.4), lerp(tick[0][1], tick[1][1], tk / 0.4)] : [lerp(tick[1][0], tick[2][0], (tk - 0.4) / 0.6), lerp(tick[1][1], tick[2][1], (tk - 0.4) / 0.6)];
    const tp = tk >= 1 ? [lerp(tick[2][0], 1250, 1 - hin), lerp(tick[2][1], 1400, 1 - hin)] : tip;
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(60,62,95,0.55)';
    g.beginPath(); g.ellipse(tp[0] + 140, tp[1] + 120, 120, 70, -0.6, 0, Math.PI * 2); g.ellipse(tp[0] + 330, tp[1] + 230, 200, 100, -0.5, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.translate(tp[0], tp[1]); g.rotate(-0.75); g.fillStyle = RED; g.fillRect(-9, 0, 18, 190); g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(-9, 0); g.lineTo(0, -18); g.lineTo(9, 0); g.fill(); g.restore();
  }
  function redTick(g, t) {
    const tk = seg(t, TICK0, TICK1); if (tk <= 0) return;
    const tick = [[ANS[0] + 140, ANS[1] - 40], [ANS[0] + 166, ANS[1] - 6], [ANS[0] + 230, ANS[1] - 90]];
    const pts = tk < 0.4 ? [tick[0], [lerp(tick[0][0], tick[1][0], tk / 0.4), lerp(tick[0][1], tick[1][1], tk / 0.4)]] : [tick[0], tick[1], [lerp(tick[1][0], tick[2][0], (tk - 0.4) / 0.6), lerp(tick[1][1], tick[2][1], (tk - 0.4) / 0.6)]];
    pen(g, pts, 11, RED, 'tick', 0.6);
  }

  LAB.film({
    draw(g, t) {
      boilNo = drawing(t, N);
      // after the teacher has gone, a hard cut to a close-up of the answer so the wink reads on a phone (the eye is
      // 38 px across at 2.4x); the tick's tip stays inside the right-hand safe line
      g.save();
      if (t >= PUNCH) { g.translate(W / 2, H / 2); g.scale(ZOOM, ZOOM); g.translate(-ZX, -ZY); }
      page(g); homework(g);
      // the monster lives on the page; at FREEZE it scrambles into the answer line and becomes "54"
      const fz = seg(held(t, N), FREEZE, FROZEN, 'in2');
      if (fz < 1) {
        const mx = lerp(760, ANS[0] + 55, fz), my = lerp(1330, ANS[1] - 30, fz), s = lerp(1, 0.2, fz);
        g.save(); g.globalAlpha = 1 - clamp((fz - 0.6) / 0.4); monster(g, t, mx, my, s, seg(t, SHADOW_IN + 0.1, FREEZE)); g.restore();
      }
      // it opens its eye and looks at you, winks, then plays dead again
      answer(g, t, seg(held(t, N), FREEZE + 0.25, FROZEN + 0.15), t >= WINK && t < WINK + 0.4 ? 1 : t >= WINK + 0.4 && t < WINK + 0.8 ? 2 : 0);
      redTick(g, t);
      teacher(g, t);
      // then it writes one more word under the answer, in its own ink
      if (t > WINK + 1.6) { g.save(); g.globalAlpha = seg(t, WINK + 1.6, WINK + 1.8); g.fillStyle = INK; g.font = '700 64px Caveat'; g.translate(ANS[0] + 10, ANS[1] + 130); g.rotate(-0.05); g.fillText('shh.', 0, 0); g.restore(); }
      g.restore();
      LAB.safeOverlay(g);
    },
  });
})();
