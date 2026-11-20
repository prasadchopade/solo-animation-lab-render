// THE STYLE LAB · hose: a 1930s rubber-hose cartoon. Ink outlines with a brush's thick-and-thin, pie-cut eyes and big
// grins, limbs that are bendy tubes with no elbows, everything squashing and stretching on the beat, drawn on twos.
// Then the old film it was printed on: sepia, grain that changes every frame, a soft vignette, the gate's weave (the
// whole frame jumps a pixel or two), the odd scratch and fleck of dust. Gentle on purpose: the brightness breathes by
// about 1 %, never a flash.
//
// Loads after lab.js. Exposes window.HOSE.
(() => {
  const { W, H, rnd, rs, tex, frameOf } = LAB;
  const P = { paper: '#f2e3c4', paperD: '#d9c39a', mid: '#b89a6e', dark: '#6e5434', ink: '#2a1d10', white: '#fbf3e0' };

  // a brush line: a polyline stroked as a filled shape, thick in the middle and thin at the ends
  function brush(g, pts, w = 8, col = P.ink) {
    const n = pts.length; if (n < 2) return;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const u = i / (n - 1), ww = w * (0.35 + 0.65 * Math.sin(Math.PI * u)) / 2;
      L.push([pts[i][0] - dy * ww, pts[i][1] + dx * ww]); R.push([pts[i][0] + dy * ww, pts[i][1] - dx * ww]);
    }
    g.fillStyle = col; g.beginPath(); g.moveTo(...L[0]); for (const p of L) g.lineTo(...p); for (let i = R.length - 1; i >= 0; i--) g.lineTo(...R[i]); g.closePath(); g.fill();
  }
  // a filled shape with an ink outline (the path is built by pathFn)
  function inked(g, pathFn, fill, w = 7) { pathFn(g); g.fillStyle = fill; g.fill(); g.lineWidth = w; g.strokeStyle = P.ink; g.lineJoin = 'round'; g.stroke(); }
  // a rubber-hose limb: a tube along a quadratic curve, with a white glove-less round end (a "shoe" or a "hand")
  function hoseLimb(g, x0, y0, cx, cy, x1, y1, w = 14, endR = 16, endCol = P.ink) {
    g.save(); g.lineCap = 'round'; g.strokeStyle = P.ink; g.lineWidth = w + 6; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
    g.strokeStyle = P.ink; g.lineWidth = w; g.stroke(); g.restore();
    g.fillStyle = endCol; g.beginPath(); g.ellipse(x1, y1, endR * 1.3, endR * 0.8, 0, 0, Math.PI * 2); g.fill();
  }
  // pie-cut eyes (an oval with a wedge cut from the pupil) and a wide grin
  function face(g, x, y, s = 1, mood = 0) {
    for (const ex of [-18, 18]) {
      g.fillStyle = P.white; g.beginPath(); g.ellipse(x + ex * s, y, 13 * s, 20 * s, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.strokeStyle = P.ink; g.stroke();
      g.fillStyle = P.ink; g.beginPath(); g.moveTo(x + ex * s + 2 * s, y + 4 * s); g.arc(x + ex * s + 2 * s, y + 4 * s, 9 * s, -Math.PI * 0.25, Math.PI * 1.55); g.closePath(); g.fill();
    }
    g.lineWidth = 5 * s; g.strokeStyle = P.ink; g.lineCap = 'round'; g.beginPath();
    if (mood >= 0) g.arc(x, y + 22 * s, 24 * s, 0.15 * Math.PI, 0.85 * Math.PI); else g.arc(x, y + 44 * s, 18 * s, 1.2 * Math.PI, 1.8 * Math.PI);
    g.stroke();
  }
  // squash and stretch about a base point: k > 0 squashes (wider, shorter), k < 0 stretches
  function squash(g, bx, by, k) { g.translate(bx, by); g.scale(1 + 0.6 * k, 1 - k); g.translate(-bx, -by); }

  // ------------------------------------------------------------------ the old film over everything
  const grains = Array.from({ length: 6 }, (_, i) => () => tex(`hose-grain-${i}`, 540, 960, (g, w, h) => {
    const im = g.createImageData(w, h), d = im.data, r = C.mulberry32(100 + i);
    for (let k = 0; k < w * h; k++) { const v = r(); d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = v * 255; d[k * 4 + 3] = 34; }
    g.putImageData(im, 0, 0);
  }));
  const vignette = () => tex('hose-vignette', W, H, (g) => {
    const gr = g.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.72);
    gr.addColorStop(0, 'rgba(40,22,8,0)'); gr.addColorStop(1, 'rgba(40,22,8,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
  // apply the film to a finished frame: weave the picture, sepia it, then grain, vignette, scratches, dust
  function film(g, t, src) {
    const f = frameOf(t), wx = Math.round(rs('weave', f) * 2), wy = Math.round(rs('weavey', f) * 2.5);
    g.save(); g.fillStyle = P.ink; g.fillRect(0, 0, W, H); g.drawImage(src, wx, wy); g.restore();
    g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = '#9a7a4a'; g.fillRect(0, 0, W, H); g.restore();    // tone it sepia
    g.save(); g.globalCompositeOperation = 'overlay'; g.drawImage(grains[f % 6](), 0, 0, W, H); g.restore();
    g.drawImage(vignette(), 0, 0);
    const breathe = 0.012 * rs('flick', Math.floor(f / 3));                         // about 1 %, changing every three frames
    g.fillStyle = breathe > 0 ? `rgba(255,240,210,${breathe})` : `rgba(30,15,0,${-breathe})`; g.fillRect(0, 0, W, H);
    if (rnd('scratch', Math.floor(f / 4)) > 0.7) {                                    // a vertical scratch, for a few frames
      const x = 80 + rnd('sx', Math.floor(f / 4)) * (W - 160); g.fillStyle = 'rgba(250,240,220,0.35)'; g.fillRect(x, 0, 2, H);
    }
    for (let k = 0; k < 3; k++) if (rnd('dust', f, k) > 0.6) { g.fillStyle = 'rgba(25,15,5,0.6)'; g.beginPath(); g.ellipse(rnd('dx', f, k) * W, rnd('dy', f, k) * H, 2 + rnd('dr', f, k) * 4, 1 + rnd('dq', f, k) * 3, rnd('da', f, k) * 3, 0, Math.PI * 2); g.fill(); }
  }

  window.HOSE = { P, brush, inked, hoseLimb, face, squash, film };
})();
