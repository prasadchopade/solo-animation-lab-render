// Find the Maroon Cap (lab clip 11): neon light as the evidence. Night at the chai stall, lit only by a blue CHAI sign.
// Three men in caps stand at the counter with their backs to you; one is the man with the mole, in his maroon cap. Under
// the blue light every cap looks black: a surface shows only the part of the light it throws back, and that sign makes
// almost no red. Then the stall switches its warm bulb on, the colours come back, and he walks off with his chai.
// The scene is drawn in true colour, then multiplied by the light falling on it (the sign's, then the bulb's), so the
// caps lose their colour the way real surfaces do; the sign's tubes and glow go on top. Every beat is keyed to the
// placed narration (window.VO and window.WORDS from film/words.js), so the picture follows the voice.
(() => {
  const { W, H, clamp, lerp, seg, rnd, rs, tex, held, E } = LAB;
  const { sign } = NEON;
  C.fonts = ['700 120px BarlowC'];

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z']/g, '') === w); return x ? x.t0 : T0(id); };
  const QUOTE = T0('n05'), BULB = word('n06', 'on'), RING = T0('n07c'), TURN = T0('n07c') + 0.35;
  const DIAG = T0('n09') - 0.12, BLUE = word('n10', 'that') - 0.05, BACK = T0('n11') - 0.12, SIGNWAS = word('n11', 'the');
  const LIGHTIN = word('n09', 'you') - 0.1, BOUNCE = word('n09', 'throws') - 0.1;            // the diagram: the light lands, then comes back
  const lit = (t) => t >= BULB && t < BACK;                                                    // the bulb: on at "on", off again for the last line

  const SIGN = [505, 600], BULBXY = [880, 800], FLOOR = 1920;
  const MEN = [
    { x: 235, cap: '#1f3d24', shirt: '#e6e1d6', skin: '#9a6a4c', hair: '#2a2420', n: 1, lean: -0.04 },
    { x: 505, cap: '#7b1e21', shirt: '#3d4149', skin: '#8f5f42', hair: '#1d1a18', n: 2, lean: 0.02, him: true },
    { x: 775, cap: '#5d3c24', shirt: '#e3b23a', skin: '#a3714f', hair: '#2b221c', n: 3, lean: 0.05 },
  ];

  // ------------------------------------------------------------------ the world, in true colour
  const bricks = () => tex('cap-bricks', W, H, (g) => {
    g.fillStyle = '#4a3f39'; g.fillRect(0, 0, W, H);
    const bw = 128, bh = 50, m = 7;
    for (let r = 0; r * bh < H + bh; r++) for (let c = -1; c * bw < W + bw; c++) {
      const x = c * bw + (r % 2) * bw / 2, y = r * bh - 10, v = rnd('cb', r, c);
      g.fillStyle = `rgb(${Math.round(118 + v * 26)},${Math.round(92 + v * 18)},${Math.round(80 + v * 14)})`; g.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
    }
  });
  const ell = (g, x, y, rx, ry, col, a = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill(); };
  function stall(g, t) {
    g.fillStyle = '#6b4a30'; g.fillRect(70, 1150, 900, 34);                                // the counter's top
    g.fillStyle = '#8c6a3c'; g.fillRect(80, 1184, 880, 760);                               // its painted front
    g.fillStyle = '#7a5c33'; for (let k = 0; k < 6; k++) g.fillRect(80, 1240 + k * 120, 880, 8);
    // the kettle at the left, and its steam (on twos)
    ell(g, 150, 1090, 62, 56, '#a9aab0'); g.fillStyle = '#a9aab0'; g.fillRect(110, 1100, 80, 50);
    g.fillStyle = '#8d8e94'; g.beginPath(); g.moveTo(205, 1080); g.lineTo(262, 1040); g.lineTo(268, 1052); g.lineTo(212, 1100); g.fill();
    ell(g, 150, 1034, 22, 10, '#8d8e94');
    const th = held(t, 2);
    g.strokeStyle = 'rgba(235,235,240,0.55)'; g.lineWidth = 9; g.lineCap = 'round';
    for (let k = 0; k < 2; k++) { g.beginPath(); for (let i = 0; i <= 10; i++) { const y = 1020 - i * 22, x = 150 + k * 26 + Math.sin(i * 0.9 + th * 3 + k) * 10; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    // the bulb on its wire (the glass only; its light is in the light map)
    g.strokeStyle = '#222'; g.lineWidth = 4; g.beginPath(); g.moveTo(BULBXY[0], 250); g.lineTo(BULBXY[0], BULBXY[1] - 40); g.stroke();
    g.fillStyle = '#3a3a3a'; g.fillRect(BULBXY[0] - 12, BULBXY[1] - 48, 24, 22);
    ell(g, BULBXY[0], BULBXY[1], 24, 30, lit(t) ? '#fff6dc' : '#d9d4c8');
  }
  // a man from behind (three-quarter), cap first: the brim shows past his head on one side
  function man(g, M, t) {
    const x = M.x, sway = Math.sin(held(t, 2) * 1.3 + M.n) * 3;
    g.save(); g.translate(x + sway, 0); g.rotate(M.lean * 0.15);
    g.fillStyle = M.shirt; g.beginPath(); g.moveTo(-150, 1090); g.quadraticCurveTo(0, 1030, 150, 1090); g.lineTo(138, FLOOR); g.lineTo(-138, FLOOR); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(-4, 1100, 8, 800);                         // the back's centre seam
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(-150, 1120, 26, 700); g.fillRect(124, 1120, 26, 700);   // the arms, down his sides
    g.fillStyle = M.skin; g.fillRect(-26, 1010, 52, 50);                                    // the neck
    ell(g, -60, 975, 13, 22, M.skin); ell(g, 60, 975, 13, 22, M.skin);                      // ears
    ell(g, 0, 960, 62, 76, M.skin);                                                         // the back of the head
    // below the cap, from behind, is hair: his is only at the sides and back (season 1: bald under the cap), which is
    // all a cap leaves showing from behind anyway
    g.fillStyle = M.hair; g.beginPath(); g.ellipse(0, 968, 60, 66, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(0, 1040, 70, 16, 0, Math.PI, 2 * Math.PI); g.fill();          // the collar's shadow
    // the cap from behind: the crown, the strap, and the brim's tip past the head on the side he's turned to
    const side = M.n === 1 ? -1 : 1;
    g.fillStyle = M.cap; g.beginPath(); g.ellipse(side * 74, 922, 44, 11, side * 0.25, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(0, 922, 66, 54, 0, Math.PI, 2 * Math.PI); g.fill(); g.fillRect(-66, 912, 132, 14);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-18, 908, 36, 12);                         // the strap's gap
    // his glass of chai, held up at his side
    const gx = side * 120, gy = 1090;
    g.fillStyle = M.skin; ell(g, gx, gy + 10, 20, 16, M.skin);
    g.fillStyle = 'rgba(225,235,240,0.85)'; g.fillRect(gx - 14, gy - 34, 28, 40);
    g.fillStyle = '#b7743a'; g.fillRect(gx - 12, gy - 20, 24, 24);
    g.restore();
  }
  // number two in profile, walking off to the LEFT with his chai. Facing screen-left, his left side is toward you, so we
  // see his left cheek and the mole on it (facing screen-right would show his right cheek). Drawn facing right, mirrored.
  function walker(g, M, t) {
    const u = clamp((held(t, 2) - TURN) / 3.4), x = lerp(M.x, -300, E.in2 ? E.in2(u) : u * u), bob = Math.abs(Math.sin(held(t, 2) * 7)) * 8;
    if (x < -260) return;
    g.save(); g.translate(x, -bob); g.scale(-1, 1);
    g.fillStyle = M.shirt; g.beginPath(); g.moveTo(-110, 1090); g.quadraticCurveTo(10, 1040, 120, 1090); g.lineTo(110, FLOOR); g.lineTo(-110, FLOOR); g.closePath(); g.fill();
    g.fillStyle = M.skin; g.fillRect(-20, 1010, 46, 52);
    ell(g, 6, 960, 60, 74, M.skin);                                                         // the head, in profile
    g.beginPath(); g.moveTo(58, 940); g.lineTo(84, 978); g.lineTo(58, 990); g.fill();       // the nose, pointing the way he walks
    g.strokeStyle = M.hair; g.lineWidth = 18; g.beginPath(); g.ellipse(6, 960, 52, 66, 0, 0.55 * Math.PI, 1.05 * Math.PI); g.stroke();   // hair round the back
    ell(g, -16, 968, 12, 20, M.skin); ell(g, -14, 968, 6, 11, 'rgba(0,0,0,0.25)');           // the ear
    ell(g, 34, 1000, 7, 7, '#2a1712');                                                      // the mole, on the cheek toward you: his left
    g.fillStyle = M.cap; g.beginPath(); g.ellipse(0, 922, 66, 52, 0, Math.PI, 2 * Math.PI); g.fill(); g.fillRect(-66, 912, 132, 14);
    g.beginPath(); g.ellipse(84, 922, 52, 10, 0.08, 0, Math.PI * 2); g.fill();              // the brim, forward
    // the chai, at his lips
    g.fillStyle = 'rgba(225,235,240,0.85)'; g.fillRect(62, 1000, 26, 38); g.fillStyle = '#b7743a'; g.fillRect(64, 1012, 22, 22);
    g.restore();
  }

  // ------------------------------------------------------------------ the light that falls on it
  const SCR = {};
  function scratch(key) {
    if (!SCR[key]) { const c = document.createElement('canvas'); c.width = W; c.height = H; SCR[key] = { c, g: c.getContext('2d') }; }
    const s = SCR[key]; s.g.setTransform(1, 0, 0, 1, 0, 0); s.g.globalCompositeOperation = 'source-over'; s.g.globalAlpha = 1; s.g.clearRect(0, 0, W, H); return s;
  }
  function light(g, t) {
    g.fillStyle = 'rgb(2,3,16)'; g.fillRect(0, 0, W, H);                                   // a night street's ambient
    g.globalCompositeOperation = 'lighter';
    const add = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.45, `rgba(${col},0.55)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
    add(SIGN[0], SIGN[1], 1500, '1,4,255');                                                 // the sign: deep blue, almost no red or green
    if (lit(t)) add(BULBXY[0], BULBXY[1], 1600, '255,214,160');                             // the bulb: warm, every colour
    g.globalCompositeOperation = 'source-over';
  }

  // ------------------------------------------------------------------ words on top (not in the world, so not lit)
  function caption(g, lines, y0, size = 118, col = '#ffffff', a = 1) {
    g.save(); g.globalAlpha = a; g.font = `700 ${size}px BarlowC`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    lines.forEach((s, i) => { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillText(s, 509, y0 + i * size * 0.95 + 5); g.fillStyle = col; g.fillText(s, 505, y0 + i * size * 0.95); });
    g.restore();
  }
  function badge(g, x, y, n, ring = 0, a = 1) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 36, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#16151a'; g.font = '700 54px BarlowC'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), x, y + 2);
    if (ring > 0) { g.strokeStyle = '#b02a3d'; g.lineWidth = 10; g.beginPath(); g.arc(x, y, 50 + 8 * (1 - ring), 0, Math.PI * 2 * ring); g.stroke(); }
    g.restore();
  }

  // ------------------------------------------------------------------ the sign, and the explainer drawn in tube
  function chaiSign(S, k = 1) {
    S.text('CHAI', 470, 520, 160, '#2b62ff', k, { w: 15, block: false });                  // no painted-out glass: lit, it read as slashes
    S.push(760, 650, 0, 1.1);                                                               // a little cup, with steam
    S.tube([[-36, -50], [36, -50], [28, 20], [-28, 20]], '#2b62ff', k, 9, { closed: true });
    S.tube([[36, -34], [58, -30], [58, -4], [34, 0]], '#2b62ff', k, 8, { smooth: true });
    S.tube([[-10, -64], [-2, -84], [-10, -104]], '#2b62ff', k * 0.8, 6, { smooth: true });
    S.tube([[12, -64], [20, -84], [12, -104]], '#2b62ff', k * 0.8, 6, { smooth: true });
    S.pop();
  }
  // the explainer. The light is tube (it glows); the cap is a thing, painted, with no light of its own: dark until light
  // lands on it, maroon while white light does, black under the sign's blue. The ray lands ON the crown and what comes
  // back leaves the same spot, outward, into an eye.
  const mixc = (a, b, k) => { const p = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(k)))).join(',')})`; };
  function capShape(g, fill, rim) {
    g.save(); g.translate(505, 1040); g.scale(2.2, 2.2);
    g.beginPath(); g.moveTo(-66, 0); g.bezierCurveTo(-66, -42, -38, -60, 0, -60); g.bezierCurveTo(38, -60, 66, -42, 66, 0);
    g.lineTo(128, 2); g.quadraticCurveTo(140, 7, 124, 10); g.lineTo(-66, 8); g.closePath();
    g.fillStyle = fill; g.fill(); g.strokeStyle = rim; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
    g.restore();
  }
  const SRC = [205, 600], HIT = [418, 930], OUT = [462, 906], EYE = [835, 660];
  function diagram(g, t) {
    sign().flush(g);                                                                        // the dark wall only
    const blue = t >= BLUE, kLit = blue ? 1 : seg(t, LIGHTIN + 0.28, LIGHTIN + 0.45), kDark = blue ? seg(t, BLUE + 0.2, BLUE + 0.5) : 0;
    const fill = blue ? mixc('#7b1e2c', '#0b0a0f', kDark) : mixc('#17161c', '#7b1e2c', kLit);
    const rim = blue ? mixc('#a8384a', '#34333e', kDark) : mixc('#3a3944', '#a8384a', kLit);
    capShape(g, fill, rim);
    const S = sign();
    const arrow = (pts, col, k) => { S.tube(pts, col, k, 11); const [a, b] = pts.slice(-2), d = Math.atan2(b[1] - a[1], b[0] - a[0]); S.tube([[b[0] - 40 * Math.cos(d - 0.45), b[1] - 40 * Math.sin(d - 0.45)], b, [b[0] - 40 * Math.cos(d + 0.45), b[1] - 40 * Math.sin(d + 0.45)]], col, k, 11); };
    // the source: the bulb (white, every colour), then the sign (blue)
    if (!blue) { S.push(SRC[0], SRC[1], 0, 1); S.tube([[0, -46], [34, -24], [34, 12], [16, 34], [-16, 34], [-34, 12], [-34, -24]], '#ffffff', 1, 8, { closed: true, smooth: true }); S.tube([[-14, 46], [14, 46]], '#ffffff', 1, 7); S.tube([[-10, 58], [10, 58]], '#ffffff', 1, 7); S.pop(); }
    else S.text('CHAI', SRC[0] + 10, SRC[1] - 44, 72, '#2b62ff', 1, { w: 8, block: false });
    // the light coming in, landing on the crown
    const kIn = blue ? seg(t, BLUE, BLUE + 0.25) : seg(t, LIGHTIN, LIGHTIN + 0.3);
    if (kIn > 0) arrow([[SRC[0] + 40, SRC[1] + 70], HIT], blue ? '#2b62ff' : '#ffffff', kIn);
    // what comes back: red, from the same spot into the eye; with blue light, nothing
    const kBack = blue ? 0 : seg(t, BOUNCE, BOUNCE + 0.3);
    if (kBack > 0) arrow([OUT, [EYE[0] - 70, EYE[1] + 26]], '#ff3b4f', kBack);
    S.push(EYE[0], EYE[1], 0, 1);
    S.tube([[-56, 0], [-22, -26], [22, -26], [56, 0], [22, 26], [-22, 26]], '#ffffff', 0.85, 7, { closed: true, smooth: true });
    S.tube([[0, -11], [11, 0], [0, 11], [-11, 0]], kBack >= 1 ? '#ff3b4f' : '#ffffff', kBack >= 1 ? 1 : 0.5, 7, { closed: true, smooth: true });
    S.pop();
    S.flush(g, { wall: false });
    if (!blue && kBack > 0) caption(g, ['WHITE LIGHT IN,', 'RED BACK OUT.'], 1410, 76, '#ffd7dc');
    if (blue) caption(g, ['BLUE LIGHT IN,', 'NOTHING BACK.'], 1410, 76, '#c9d6ff');
  }

  LAB.film({
    draw(g, t) {
      if (t >= DIAG && t < BACK) { diagram(g, t); LAB.safeOverlay(g); return; }
      // the world in true colour ...
      const A = scratch('world'), a = A.g;
      a.drawImage(bricks(), 0, 0);
      stall(a, t);
      for (const M of MEN) if (!(M.him && t >= TURN)) man(a, M, t);
      if (t >= TURN) walker(a, MEN[1], t);
      // ... times the light falling on it
      const B = scratch('light'); light(B.g, t);
      a.globalCompositeOperation = 'multiply'; a.drawImage(B.c, 0, 0); a.globalCompositeOperation = 'source-over';
      g.drawImage(A.c, 0, 0);
      // the bulb's own glow, once it's on
      if (lit(t)) { const gr = g.createRadialGradient(BULBXY[0], BULBXY[1], 0, BULBXY[0], BULBXY[1], 160); gr.addColorStop(0, 'rgba(255,245,215,0.95)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      // the sign, over it
      const S = sign(); chaiSign(S, 1); S.flush(g, { wall: false });
      // the words and the numbers
      if (t < BACK) {
        if (t < RING) caption(g, ['FIND THE', 'MAROON CAP.'], 362); else caption(g, ['MAROON.'], 362, 118, '#ff8a98');
        // the ring finds number two; 1 and 3 fade out with it, so no number sits over him as he walks past
        for (const M of MEN) if (!(M.him && t >= TURN + 0.4)) badge(g, M.x, 812, M.n, M.him ? seg(t, RING, RING + 0.35, 'out') : 0, M.him ? 1 : 1 - seg(t, RING, RING + 0.3));
        if (t >= QUOTE && t < BULB) caption(g, ['“ALL THREE', 'WERE BLACK.”'], 1400, 92, '#ffffff', seg(t, QUOTE, QUOTE + 0.2));
      } else {                                                                             // the bulb off again: what she saw
        caption(g, ['“ALL THREE', 'WERE BLACK.”'], 1400, 92, '#ffffff', seg(t, BACK, BACK + 0.2));
        const k = seg(t, SIGNWAS, SIGNWAS + 0.4, 'out');                                   // "The sign was.": the sign, ringed
        if (k > 0) { g.save(); g.strokeStyle = '#ff3b55'; g.lineWidth = 10; g.lineCap = 'round'; g.shadowColor = 'rgba(255,59,85,0.6)'; g.shadowBlur = 18; g.beginPath(); g.ellipse(560, 598, 330, 138, -0.04, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke(); g.restore(); }
      }
      LAB.safeOverlay(g);
    },
  });
})();
