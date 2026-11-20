// Did You See Him? (lab clip 02): a colour afterimage with a thief in it. For 15 s you stare at a dot on a fruit stall
// painted in its opposite colours; the picture turns black and white and your eyes paint it back in colour; while
// they're busy doing that, the man in the cap takes an apple. The stare frame never moves (motion would spoil the
// adaptation); the only thing that moves in the grey frame is his arm, after the colours have had time to show.
// The science and the numbers are in README.md.
(() => {
  const { W, H, key, seg, clamp, lerp, E, rnd, tex } = LAB;
  C.fonts = ['800 90px Bricolage', '600 44px Bricolage'];
  const LOOP = 20.0, STARE = 15.0, ARM0 = 17.35, ARM1 = 18.25, ASK = 18.45;
  const DOT = [540, 990];

  // ------------------------------------------------------------------ colour: true, or its grey (BT.601 luma)
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const luma = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
  let GREY = false;
  const c = (h) => { if (!GREY) return h; const y = Math.round(luma(hex(h))); return `rgb(${y},${y},${y})`; };

  // ------------------------------------------------------------------ the scene: a fruit stall on a sunny street
  const P = {
    sky: '#7cc8f2', sun: '#ffd23f', bldA: '#e07a4f', bldB: '#f4dfae', bldC: '#3faaa2', win: '#2b4a7a', road: '#8d9298',
    kerb: '#c9cdd2', awnR: '#e2382f', awnW: '#fff6e6', post: '#8a5a34', wood: '#b9824e', woodD: '#8e5d33', crate: '#d9a066',
    apple: '#d8252b', banana: '#f6d32b', orange: '#f5921f', lime: '#5cbf3a', skinT: '#b5774f', skinV: '#d39a6a',
    cap: '#c4202f', capD: '#8f1622', hair: '#2b1d14', shirtT: '#2f6fd0', shirtV: '#3a9a5b', apron: '#fffaf0', ink: '#1e1a17',
  };
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function fruitPile(g, x, y, w, kind, n, seed, missing = -1) {
    const R = kind === 'banana' ? 0 : 22;
    for (let i = 0; i < n; i++) {
      if (i === missing) continue;
      const row = Math.floor(i / 5), col = i % 5, fx = x + 26 + col * (w - 52) / 4 + (row % 2) * 10, fy = y - 18 - row * 26;
      if (kind === 'banana') {
        g.strokeStyle = c(P.banana); g.lineWidth = 16; g.lineCap = 'round';
        g.beginPath(); g.arc(fx, fy - 20, 26, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
      } else {
        g.fillStyle = c(P[kind]); g.beginPath(); g.arc(fx, fy, R, 0, Math.PI * 2); g.fill();
        g.fillStyle = c('#ffffff'); g.globalAlpha = 0.35; g.beginPath(); g.arc(fx - 7, fy - 7, 6, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
        if (kind === 'apple') { g.strokeStyle = c(P.woodD); g.lineWidth = 3; g.beginPath(); g.moveTo(fx, fy - R + 2); g.lineTo(fx + 3, fy - R - 8); g.stroke(); }
      }
    }
  }
  const APPLE_TAKEN = 2;          // which apple he takes (index in the pile)
  function scene(g, s) {          // s = { arm: 0..1 (reach), taken: 0..1 (the apple in his hand) }
    // sky, sun, buildings
    g.fillStyle = c(P.sky); g.fillRect(0, 0, W, 1240);
    g.fillStyle = c(P.sun); g.beginPath(); g.arc(860, 560, 74, 0, Math.PI * 2); g.fill();
    const B = [[0, 610, 300, P.bldA], [300, 700, 230, P.bldB], [530, 640, 260, P.bldC], [790, 720, 290, P.bldA]];
    for (const [x, y, w, col] of B) {
      g.fillStyle = c(col); g.fillRect(x, y, w, 640);
      g.fillStyle = c(P.win); for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor(w / 80); k++) rr(g, x + 24 + k * 80, y + 40 + r * 110, 44, 64, 6), g.fill();
    }
    // the road and the kerb
    g.fillStyle = c(P.kerb); g.fillRect(0, 1240, W, 70); g.fillStyle = c(P.road); g.fillRect(0, 1310, W, H - 1310);
    // the stall: posts, awning, counter, crates of fruit
    g.fillStyle = c(P.post); g.fillRect(300, 800, 22, 520); g.fillRect(1010, 800, 22, 520);
    const ax0 = 270, ax1 = 1080, ay = 760;
    for (let k = 0; ax0 + k * 70 < ax1; k++) { g.fillStyle = c(k % 2 ? P.awnW : P.awnR); g.fillRect(ax0 + k * 70, ay, 70, 110); g.beginPath(); g.arc(ax0 + k * 70 + 35, ay + 110, 35, 0, Math.PI); g.fill(); }
    // the vendor behind the counter
    g.fillStyle = c(P.shirtV); rr(g, 760, 1000, 200, 260, 60); g.fill();
    g.fillStyle = c(P.skinV); g.beginPath(); g.arc(860, 960, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = c(P.hair); g.beginPath(); g.arc(860, 935, 62, Math.PI, 2 * Math.PI); g.fill();
    g.fillStyle = c(P.ink); g.beginPath(); g.arc(840, 965, 6, 0, Math.PI * 2); g.arc(880, 965, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = c(P.ink); g.lineWidth = 4; g.beginPath(); g.arc(860, 978, 18, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.fillStyle = c(P.wood); g.fillRect(330, 1120, 680, 300); g.fillStyle = c(P.woodD); g.fillRect(330, 1120, 680, 18);
    for (let k = 0; k < 4; k++) { g.fillStyle = c(P.crate); g.fillRect(350 + k * 165, 1060, 150, 70); g.fillStyle = c(P.woodD); g.fillRect(350 + k * 165, 1088, 150, 6); }
    fruitPile(g, 350, 1068, 150, 'apple', 9, 1, s.taken > 0 ? APPLE_TAKEN : -1);
    fruitPile(g, 515, 1068, 150, 'banana', 5, 2);
    fruitPile(g, 680, 1068, 150, 'orange', 9, 3);
    fruitPile(g, 845, 1068, 150, 'lime', 9, 4);
    // him: in front of the stall, facing you; the maroon cap, bald under it, dark hair at the sides, the mole on his left cheek
    const hx = 200, hy = 980;
    g.fillStyle = c(P.shirtT); rr(g, hx - 115, hy + 90, 230, 520, 70); g.fill();
    g.fillStyle = c(P.skinT); g.fillRect(hx - 28, hy + 60, 56, 50);
    g.fillStyle = c(P.skinT); g.beginPath(); g.ellipse(hx, hy, 74, 88, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = c(P.hair); g.beginPath(); g.ellipse(hx - 70, hy - 10, 14, 34, 0.2, 0, Math.PI * 2); g.ellipse(hx + 70, hy - 10, 14, 34, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = c(P.cap); g.beginPath(); g.ellipse(hx, hy - 52, 80, 62, 0, Math.PI, 2 * Math.PI); g.fill();
    g.fillStyle = c(P.capD); rr(g, hx - 6, hy - 60, 112, 22, 11); g.fill();   // the brim, turned to his left
    g.fillStyle = c(P.ink); g.beginPath(); g.arc(hx - 26, hy + 2, 7, 0, Math.PI * 2); g.arc(hx + 26, hy + 2, 7, 0, Math.PI * 2); g.fill();
    g.strokeStyle = c(P.ink); g.lineWidth = 4; g.beginPath(); g.moveTo(hx - 20, hy + 44); g.quadraticCurveTo(hx, hy + 50, hx + 22, hy + 40); g.stroke();
    g.fillStyle = c(P.hair); g.beginPath(); g.arc(hx + 40, hy + 26, 8, 0, Math.PI * 2); g.fill();      // the mole
    // his near arm: hangs at his side; for the theft it reaches to the apples and comes back to his pocket
    const sh = [hx + 92, hy + 130], rest = [hx + 120, hy + 380], crate = [350 + 26 + APPLE_TAKEN * 24.5, 1050], pocket = [hx + 70, hy + 330];
    const u = s.arm, hand = u < 0.5 ? [lerp(rest[0], crate[0], E.out(u * 2)), lerp(rest[1], crate[1], E.out(u * 2))] : [lerp(crate[0], pocket[0], E.inOut((u - 0.5) * 2)), lerp(crate[1], pocket[1], E.inOut((u - 0.5) * 2))];
    const elbow = [lerp(sh[0], hand[0], 0.5) + 36, lerp(sh[1], hand[1], 0.5) + 40];
    g.strokeStyle = c(P.shirtT); g.lineWidth = 48; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(...sh); g.quadraticCurveTo(...elbow, ...hand); g.stroke();
    g.fillStyle = c(P.skinT); g.beginPath(); g.arc(hand[0], hand[1], 24, 0, Math.PI * 2); g.fill();
    if (s.taken > 0 && u < 0.92) { g.fillStyle = c(P.apple); g.beginPath(); g.arc(hand[0] + 4, hand[1] - 14, 21, 0, Math.PI * 2); g.fill(); }
  }

  // ------------------------------------------------------------------ the stare frame: the scene with its colours turned inside out
  // (YCbCr: the same brightness, the opposite hue, saturation raised 1.45x), so the grey frame that follows has exactly
  // the stare frame's brightness everywhere and only the colour is missing
  function stareImage() {
    return tex('stare', W, H, (g) => {
      GREY = false; scene(g, { arm: 0, taken: 0 });
      const im = g.getImageData(0, 0, W, H), d = im.data, K = 1.45;
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i + 1], Bb = d[i + 2];
        const Y = 0.299 * R + 0.587 * G + 0.114 * Bb, Cb = -K * (-0.168736 * R - 0.331264 * G + 0.5 * Bb), Cr = -K * (0.5 * R - 0.418688 * G - 0.081312 * Bb);
        d[i] = Y + 1.402 * Cr; d[i + 1] = Y - 0.344136 * Cb - 0.714136 * Cr; d[i + 2] = Y + 1.772 * Cb;
      }
      g.putImageData(im, 0, 0);
    });
  }

  // ------------------------------------------------------------------ words, dot, countdown
  function text(g, s, x, y, size, weight = 800, col = '#ffffff', align = 'center') {
    g.save(); g.font = `${weight} ${size}px Bricolage`; g.textAlign = align; g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillText(s, x + 4, y + 5); g.fillStyle = col; g.fillText(s, x, y); g.restore();
  }
  function dot(g, ring) {
    g.save();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(DOT[0], DOT[1], 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#000000'; g.beginPath(); g.arc(DOT[0], DOT[1], 10, 0, Math.PI * 2); g.fill();
    if (ring > 0) { g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); g.arc(DOT[0], DOT[1], 34, -Math.PI / 2, -Math.PI / 2 + ring * Math.PI * 2); g.stroke(); }
    g.restore();
  }

  LAB.film({
    draw(g, t0) {
      const t = LAB.loopT(t0, LOOP);
      if (t < STARE) {
        g.drawImage(stareImage(), 0, 0);
        dot(g, 1 - t / STARE);
        text(g, 'STARE AT THE DOT.', W / 2, 360, 92);
        text(g, '15 seconds. Keep your eyes still.', W / 2, 430, 44, 600);
      } else {
        // black and white: the same picture drawn in grey, and the only motion is his arm
        GREY = true;
        const th = LAB.held(t, 2), arm = seg(th, ARM0, ARM1, 'lin'), taken = th > lerp(ARM0, ARM1, 0.5) ? 1 : 0;   // his arm on twos
        scene(g, { arm, taken });
        GREY = false;
        if (t < 18.9) dot(g, 0);
        text(g, 'THIS PICTURE IS', W / 2, 330, 88);
        text(g, 'BLACK AND WHITE.', W / 2, 420, 88);
        if (t >= ASK) { const k = seg(t, ASK, ASK + 0.25, 'out'); g.save(); g.globalAlpha = k; text(g, 'DID YOU SEE HIM?', W / 2, 1500 - 20 * (1 - k), 88); g.restore(); }
      }
      LAB.safeOverlay(g);
    },
  });
})();
