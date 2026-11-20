// Who Wrote the Note? (lab clip 07): episode 1 of a mystery you can solve. Bold flat colour, hard window light.
// You find a note in your book: "i like you. guess who." in green ink, stars instead of dots on the i's. Three
// classmates: one waves (a blue pen), one blushes behind a book (a red pen; the obvious suspect), one reads and doesn't
// look up (a green pen behind the ear, and a notebook with a star over the i in "Ari"). Who wrote it? Part 2 tomorrow.
// Hard cuts, no drift; characters move on twos. Pure function of t.
(() => {
  const { W, H, key, seg, clamp, lerp, E, rnd, rs, held } = LAB;
  C.fonts = ['700 120px BarlowC', '700 90px Caveat'];
  const N = 2;
  const T_WIDE = 3.6, T_C1 = 5.0, T_C2 = 6.2, T_C3 = 7.4, T_WIDE2 = 8.8, T_NOTE = 10.8, T_P2 = 13.8;
  const C0 = {
    wall: '#f2c14e', wallS: '#c98e2b', light: '#ffe9a8', floor: '#d9734a', floorS: '#a24f2c', desk: '#8c5a3c', deskT: '#b07548', deskS: '#5e3a26',
    ink: '#1d1b2f', paper: '#fffaf0', line: '#a9c4e8', green: '#2f9e44', blue: '#2f6fd0', red: '#d7263d', pink: '#f28b9b',
    s1: '#6a4c93', s2: '#1f8a8a', s3: '#f4a259', skin1: '#8d5524', skin2: '#e0ac69', skin3: '#c68642', hair: '#2b1d14', white: '#ffffff',
  };
  const LX = 46, LY = 22;                                   // the window's hard light throws every shadow this way (right and down)
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  function shadowed(g, draw, col, dx = LX, dy = LY) {       // draw a shape's hard shadow (offset, flat) and then the shape
    g.save(); g.translate(dx, dy); draw(g, col); g.restore(); draw(g, null);
  }

  // ------------------------------------------------------------------ words
  function title(g, s, x, y, size, col = C0.white, shadow = C0.ink, align = 'center') {
    g.save(); g.font = `700 ${size}px BarlowC`; g.textAlign = align; g.textBaseline = 'alphabetic';
    g.fillStyle = shadow; g.fillText(s, x + size * 0.05, y + size * 0.05); g.fillStyle = col; g.fillText(s, x, y); g.restore();
  }
  // handwriting with a star where each i's dot should be (dotless i, U+0131, then a star drawn above it)
  function hand(g, s, x, y, size, col) {
    g.save(); g.font = `700 ${size}px Caveat`; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.textAlign = 'left';
    const text = s.replace(/i/g, 'ı');
    g.fillText(text, x, y);
    let cx = x;
    for (const ch of text) {
      const w = g.measureText(ch).width;
      if (ch === 'ı') star(g, cx + w * 0.55 + size * 0.14, y - size * 0.64, size * 0.11, col);   // the font slants: the dot sits up and to the right
      cx += w;
    }
    g.restore();
  }
  function star(g, x, y, r, col) {
    g.save(); g.fillStyle = col; g.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
    g.closePath(); g.fill(); g.restore();
  }

  // ------------------------------------------------------------------ POV: your desk, your hands, the note
  function pov(g, t) {
    const th = held(t, N);
    g.fillStyle = C0.deskT; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? 'rgba(90,50,25,0.10)' : 'rgba(255,230,190,0.06)'; g.fillRect(0, k * 230 + 40, W, 120); }
    // the window's light falls across the desk as one hard slanted shape
    g.fillStyle = 'rgba(255,240,190,0.35)'; g.beginPath(); g.moveTo(0, 700); g.lineTo(760, 520); g.lineTo(1080, 1500); g.lineTo(0, 1800); g.closePath(); g.fill();
    const bob = Math.sin(th * 2.4) * 4, unfold = E.out(seg(th, -0.3, 0.2));
    // the note, its shadow, its fold line
    const nx = 170, ny = 640 + bob, nw = 740, nh = 560 * unfold;
    shadowed(g, (gg, col) => { gg.fillStyle = col || C0.paper; gg.save(); gg.translate(W / 2, ny + nh / 2); gg.rotate(-0.04); rr(gg, -nw / 2, -nh / 2, nw, nh, 6); gg.fill(); gg.restore(); }, 'rgba(60,30,10,0.35)', 34, 26);
    g.save(); g.translate(W / 2, ny + nh / 2); g.rotate(-0.04);
    g.strokeStyle = C0.line; g.lineWidth = 3; for (let y = -nh / 2 + 90; y < nh / 2 - 20; y += 72) { g.beginPath(); g.moveTo(-nw / 2 + 30, y); g.lineTo(nw / 2 - 30, y); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-nw / 2, 0); g.lineTo(nw / 2, 0); g.stroke();
    hand(g, 'i like you.', -nw / 2 + 90, -40, 150, C0.green);
    hand(g, 'guess who.', -nw / 2 + 150, 150, 150, C0.green);
    g.restore();
    // your hands holding its bottom corners (sleeves from the bottom of the frame)
    for (const [hx, flip] of [[220, -1], [860, 1]]) {
      shadowed(g, (gg, col) => {
        gg.fillStyle = col || C0.s2; gg.beginPath(); gg.moveTo(hx - 110, 1920); gg.lineTo(hx - 70 + flip * 10, 1270 + bob); gg.lineTo(hx + 80 + flip * 10, 1270 + bob); gg.lineTo(hx + 120, 1920); gg.fill();
        gg.fillStyle = col || C0.skin2; gg.beginPath(); gg.ellipse(hx + flip * 6, 1210 + bob, 74, 86, 0, 0, Math.PI * 2); gg.fill();
        gg.beginPath(); gg.roundRect(hx - 40 - flip * 16, 1120 + bob, 46, 120, 22); gg.fill();
      }, 'rgba(60,30,10,0.35)', 34, 26);
    }
  }

  // ------------------------------------------------------------------ the classroom: three classmates behind three desks
  const SEATS = [{ x: 220, shirt: C0.s1, skin: C0.skin1 }, { x: 540, shirt: C0.s2, skin: C0.skin2 }, { x: 850, shirt: C0.s3, skin: C0.skin3 }];
  const DESK_Y = 1180;
  function room(g) {
    g.fillStyle = C0.wall; g.fillRect(0, 0, W, H);
    // the window on the left wall and the slanted patch of light it throws across the back wall, cut by its frame's shadow
    g.fillStyle = C0.light; g.beginPath(); g.moveTo(0, 360); g.lineTo(560, 470); g.lineTo(700, 1060); g.lineTo(0, 1000); g.closePath(); g.fill();
    g.fillStyle = C0.wall; for (const [a, b] of [[[0, 640], [600, 720]], [[250, 400], [330, 1030]]]) { g.save(); g.lineWidth = 34; g.strokeStyle = C0.wall; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore(); }
    g.fillStyle = C0.wallS; g.fillRect(0, 1060, W, 30);                      // the skirting's shadow
    g.fillStyle = C0.floor; g.fillRect(0, 1090, W, H - 1090);
    // the board, high on the back wall
    g.fillStyle = '#2e5e4e'; rr(g, 380, 330, 560, 230, 10); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '700 54px Caveat'; LAB.scenery(() => g.fillText('Quiz on Friday!', 430, 470));
  }
  function kid(g, i, t, s) {
    const th = held(t, N), S = SEATS[i], x = S.x, y = DESK_Y;
    // body and head
    shadowed(g, (gg, col) => {
      gg.fillStyle = col || S.shirt; rr(gg, x - 110, y - 250, 220, 260, 70); gg.fill();
      gg.fillStyle = col || S.skin; gg.beginPath(); gg.ellipse(x, y - 330, 74, 84, 0, 0, Math.PI * 2); gg.fill();
    }, 'rgba(120,70,20,0.28)');
    // hair: 1 curly, 2 ponytail, 3 short
    g.fillStyle = C0.hair;
    if (i === 0) for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(x - 64 + k * 16, y - 398 - Math.sin(k) * 8, 24, 0, Math.PI * 2); g.fill(); }
    if (i === 1) { g.beginPath(); g.ellipse(x, y - 380, 78, 44, 0, Math.PI, 2 * Math.PI); g.fill(); g.beginPath(); g.ellipse(x + 70, y - 350 + Math.sin(th * 3) * 4, 24, 60, 0.3, 0, Math.PI * 2); g.fill(); }
    if (i === 2) { g.beginPath(); g.ellipse(x, y - 384, 78, 40, 0, Math.PI, 2 * Math.PI); g.fill(); g.fillRect(x - 78, y - 384, 18, 50); }
    // faces
    g.fillStyle = C0.ink;
    const look = i === 2 ? key(th, [[T_WIDE2 + 0.6, 0], [T_WIDE2 + 0.8, 1], [T_WIDE2 + 1.3, 1], [T_WIDE2 + 1.5, 0]]) : 1;
    if (i === 0) { for (const ex of [-24, 24]) { g.beginPath(); g.arc(x + ex, y - 340, 9, 0, Math.PI * 2); g.fill(); } g.lineWidth = 6; g.strokeStyle = C0.ink; g.beginPath(); g.arc(x, y - 312, 30, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke(); }
    if (i === 1) {   // glasses, a shy smile, blushing (and, from 6.4, hiding behind a book)
      g.strokeStyle = C0.ink; g.lineWidth = 6; for (const ex of [-28, 28]) { g.beginPath(); g.arc(x + ex, y - 340, 20, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.moveTo(x - 8, y - 340); g.lineTo(x + 8, y - 340); g.stroke();
      for (const ex of [-26, 26]) { g.beginPath(); g.arc(x + ex, y - 340, 6, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = C0.pink; for (const ex of [-46, 46]) { g.beginPath(); g.ellipse(x + ex, y - 304, 18, 10, 0, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = C0.ink; g.beginPath(); g.arc(x, y - 300, 14, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    }
    if (i === 2) {   // reading, eyes down; a quick glance up at you in the second wide
      for (const ex of [-24, 24]) { g.fillStyle = C0.ink; if (look > 0.5) { g.beginPath(); g.arc(x + ex, y - 344, 9, 0, Math.PI * 2); g.fill(); } else { g.lineWidth = 6; g.strokeStyle = C0.ink; g.beginPath(); g.arc(x + ex, y - 336, 10, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke(); } }
      g.lineWidth = 6; g.strokeStyle = C0.ink; g.beginPath(); g.moveTo(x - 14, y - 296); g.lineTo(x + 14, y - 296); g.stroke();
      // the green pen behind the ear
      g.save(); g.translate(x + 74, y - 360); g.rotate(-0.5); g.fillStyle = C0.green; rr(g, -8, -60, 16, 120, 6); g.fill(); g.fillStyle = C0.ink; g.beginPath(); g.moveTo(-8, 60); g.lineTo(0, 78); g.lineTo(8, 60); g.fill(); g.restore();
    }
    // the desk in front, with its hard shadow, and each one's things
    shadowed(g, (gg, col) => { gg.fillStyle = col || C0.deskT; gg.fillRect(x - 150, y, 300, 40); gg.fillStyle = col || C0.desk; gg.fillRect(x - 140, y + 40, 280, 300); }, 'rgba(90,40,10,0.35)');
    if (i === 0) {   // waving at you with a blue pen
      const wave = Math.sin(th * 6.3) * 0.35;   // about one wave a second: faster, it changed one region more than 3 times a second
      g.save(); g.translate(x + 96, y - 190); g.rotate(-2.6 + wave); g.fillStyle = S.shirt; rr(g, -26, 0, 52, 150, 24); g.fill(); g.fillStyle = S.skin; g.beginPath(); g.arc(0, 160, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = C0.blue; rr(g, -8, 150, 16, 110, 6); g.fill(); g.restore();
    }
    if (i === 1) {   // a red pen on the desk; at 6.4 the book comes up over her face
      g.fillStyle = C0.red; g.save(); g.translate(x - 60, y + 18); g.rotate(0.3); rr(g, -60, -8, 120, 16, 6); g.fill(); g.restore();
      const up = E.out(seg(th, 6.4, 6.7)) * (1 - E.inOut(seg(th, T_WIDE2 + 1.4, T_WIDE2 + 1.8)));
      if (up > 0) { g.save(); g.translate(x, y - 20 - up * 300); g.fillStyle = C0.red; rr(g, -120, -90, 240, 170, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = '700 46px BarlowC'; g.textAlign = 'center'; g.fillText('HISTORY', 0, 6); g.restore(); }
    }
    if (i === 2) {   // a book in hand; the notebook on the desk: "Ari" with a star over the i, in green
      g.fillStyle = '#3d5a80'; g.save(); g.translate(x, y - 150); rr(g, -110, -70, 220, 140, 8); g.fill(); g.restore();
      g.fillStyle = C0.paper; rr(g, x - 128, y - 4, 180, 44, 6); g.fill();
      hand(g, 'Ari', x - 112, y + 34, 50, C0.green);
    }
    // the suspect's number
    if (s) { g.fillStyle = C0.ink; g.beginPath(); g.arc(x, y - 500, 38, 0, Math.PI * 2); g.fill(); g.fillStyle = C0.white; g.font = '700 56px BarlowC'; g.textAlign = 'center'; g.fillText(String(i + 1), x, y - 480); }
  }
  function classroom(g, t, zoom = null) {
    g.save();
    if (zoom) {                    // the camera stays inside the room's drawing, so no edge of the frame goes uncovered
      const hw = W / 2 / zoom[2], hh = H / 2 / zoom[2], cx = Math.min(W - hw, Math.max(hw, zoom[0])), cy = Math.min(H - hh, Math.max(hh, zoom[1]));
      g.translate(W / 2, H / 2); g.scale(zoom[2], zoom[2]); g.translate(-cx, -cy);
    }
    room(g); for (let i = 0; i < 3; i++) kid(g, i, t, !zoom);
    g.restore();
  }

  LAB.film({
    draw(g, t) {
      if (t < T_WIDE || t >= T_NOTE) {
        pov(g, t);
        if (t < T_WIDE) title(g, 'WHO WROTE THE NOTE?', 505, 400, 94);
        else { title(g, 'WHO WROTE IT?', W / 2, 400, 124); title(g, 'The clue is on screen.', W / 2, 480, 54, C0.white); }
        if (t >= T_P2) { const k = seg(t, T_P2, T_P2 + 0.25, 'out'); g.save(); g.globalAlpha = k; g.fillStyle = C0.ink; rr(g, 200, 1380, 680, 130, 20); g.fill(); title(g, 'PART 2 TOMORROW', W / 2, 1470, 84, C0.wall, C0.ink); g.restore(); }
      } else if (t < T_C1 || (t >= T_WIDE2 && t < T_NOTE)) {
        classroom(g, t);
        title(g, 'ONE OF THEM WROTE IT.', W / 2, 340, 92);
      } else {
        const z = t < T_C2 ? [SEATS[0].x + 40, DESK_Y - 250, 2.1] : t < T_C3 ? [SEATS[1].x, DESK_Y - 260, 2.1] : [SEATS[2].x - 10, DESK_Y - 230, 2.1];
        const n = t < T_C2 ? 1 : t < T_C3 ? 2 : 3;
        if (n === 3) classroom(g, t, z); else LAB.scenery(() => classroom(g, t, z));   // in 1 and 2, the next desk's notebook is cut by the frame
        g.fillStyle = C0.ink; g.beginPath(); g.arc(150, 400, 64, 0, Math.PI * 2); g.fill(); title(g, String(n), 150, 432, 96, C0.wall, C0.ink);
      }
      LAB.safeOverlay(g);
    },
  });
})();
