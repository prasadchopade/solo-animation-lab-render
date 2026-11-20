// THE STYLE LAB · lino: a linocut print. Black ink on bone-white paper, plus one red. You draw the black areas into an ink
// layer, then CARVE them: gouge marks (tapered strokes) are cut out of the ink, white where light falls, so light is
// made of cuts, the way a printmaker makes it. Every drawing (on threes) is re-carved: the gouges shift a little and the
// edges wobble, which is the "boil". Paper grain shows through the ink as speckles. No gradients and no blur.
//
// Loads after lab.js. Exposes window.LINO.
(() => {
  const { W, H, rnd, rs, tex } = LAB;
  const INK = '#1b1612', RED = '#c3261c', PAPER = '#efe6d2';
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return { c, g: c.getContext('2d') }; };
  const L = { ink: mk(), red: mk() };

  const paper = () => tex('lino-paper', W, H, (g) => {
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    const r = C.mulberry32(77);
    for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(110,90,60,${0.03 + r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1); }
  });
  // where the paper's grain kept the ink off: little white specks, a different set each pass
  const specks = () => tex('lino-specks', W + 300, H + 300, (g, w, h) => {
    const im = g.createImageData(w, h), d = im.data, r = C.mulberry32(4242);
    for (let i = 0; i < w * h; i++) { const v = r(); d[i * 4 + 3] = v > 0.965 ? 255 : 0; }
    g.putImageData(im, 0, 0);
  });

  function begin() { L.ink.g.clearRect(0, 0, W, H); L.red.g.clearRect(0, 0, W, H); }

  // jitter a polygon's points: a hand-cut edge, different on each drawing
  function rough(pts, seed, amp = 3) { return pts.map(([x, y], i) => [x + rs(seed, i, 'x') * amp, y + rs(seed, i, 'y') * amp]); }
  function poly(g, pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
  // a filled shape in ink (or red), its edge resampled and roughened
  function shape(layer, pts, seed, amp = 2.5, step = 14) {
    const P = LAB.resample(pts, step, true);
    poly(L[layer].g, rough(P, seed, amp)); L[layer].g.fill();
  }

  // a gouge: a tapered cut along a centreline (wide in the middle, sharp at both ends)
  function gougePath(g, pts, w) {
    if (pts.length < 2) return;
    const n = pts.length, left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const u = i / (n - 1), ww = w * Math.pow(Math.sin(Math.PI * u), 0.7) / 2;
      left.push([pts[i][0] - dy * ww, pts[i][1] + dx * ww]); right.push([pts[i][0] + dy * ww, pts[i][1] - dx * ww]);
    }
    g.beginPath(); g.moveTo(left[0][0], left[0][1]);
    for (const p of left) g.lineTo(p[0], p[1]);
    for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
    g.closePath(); g.fill();
  }
  function cut(pts, w, layer = 'ink') {
    const g = L[layer].g; g.save(); g.globalCompositeOperation = 'destination-out'; gougePath(g, pts, w); g.restore();
  }
  // carve a field of parallel gouges across a clip region. light(x, y) in 0..1 sets each cut's width (0 = no cut), so
  // lit areas open up to white and the dark stays solid. angle in radians; curve bends the cuts.
  function carve(region, light, { angle = 0, spacing = 13, len = 70, wmax = 7, seed = 1, curve = 0.15, layer = 'ink', x0 = 0, y0 = 0, x1 = W, y1 = H } = {}) {
    const g = L[layer].g; g.save(); region(g); g.clip(); g.globalCompositeOperation = 'destination-out';
    const ca = Math.cos(angle), sa = Math.sin(angle), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + len;
    let k = 0;
    for (let v = -R; v <= R; v += spacing) {
      for (let u = -R + (rnd(seed, 'o', v) * len); u <= R; u += len * (0.9 + 0.5 * rnd(seed, 'l', v, u))) {
        k++;
        const mx = cx + u * ca - v * sa + rs(seed, 'jx', k) * 3, my = cy + u * sa + v * ca + rs(seed, 'jy', k) * 3;
        if (mx < x0 - len || mx > x1 + len || my < y0 - len || my > y1 + len) continue;
        const lv = light(mx, my); if (lv <= 0.04) continue;
        const l = len * (0.55 + 0.45 * lv) * (0.8 + 0.4 * rnd(seed, 'll', k)), bend = curve * rs(seed, 'b', k);
        const pts = [];
        for (let i = 0; i <= 6; i++) { const s = (i / 6 - 0.5) * l; pts.push([mx + s * ca - Math.sin(i / 6 * Math.PI) * bend * l * sa, my + s * sa + Math.sin(i / 6 * Math.PI) * bend * l * ca]); }
        gougePath(g, pts, wmax * Math.min(1, lv * 1.3));
      }
    }
    g.restore();
  }

  // print: paper, then the ink (multiply), then the red, each speckled by the paper's grain for this pass
  function print(g, pass) {
    g.drawImage(paper(), 0, 0);
    for (const [name, col] of [['ink', INK], ['red', RED]]) {
      const lg = L[name].g;
      lg.save(); lg.globalCompositeOperation = 'destination-out';
      lg.drawImage(specks(), -Math.floor(rnd('sp', name, pass) * 300), -Math.floor(rnd('sq', name, pass) * 300)); lg.restore();
      lg.save(); lg.globalCompositeOperation = 'source-in'; lg.fillStyle = col; lg.fillRect(0, 0, W, H); lg.restore();
      g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(L[name].c, 0, 0); g.restore();
    }
  }

  window.LINO = { INK, RED, PAPER, L, begin, rough, poly, shape, cut, carve, gougePath, print };
})();
