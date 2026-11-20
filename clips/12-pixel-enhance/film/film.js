// Enhance (lab clip 12): CCTV as the evidence, in 16-bit pixel art. The chai stall's camera caught the man with the
// mole, too coarse to see his face. You press ENHANCE, and a sharp face comes up: a moustache, no mole. Is it him? It
// is. Shrink both faces to the camera's size and they're the same picture: the camera never kept his mole, so enhance
// couldn't bring it back. It guessed. The invented face is built so that every camera pixel (a 4 x 4 block) averages
// to the same colour as his real face's, which is what makes the demonstration honest rather than a trick.
// Every beat is keyed to the placed narration (window.VO and window.WORDS).
(() => {
  const { W, H, clamp, lerp, seg, held, rnd, tex, E } = LAB;
  const { S: SC, PW, PH, g: lo, P, clear, rect, text, textWidth, present } = PIX;
  const CX = 84;                                                    // the middle of the safe column (x 60-950 on the frame)

  // ------------------------------------------------------------------ the narration's clock
  const VO = window.VO || [], WORDS = window.WORDS || [];
  const ln = (id) => VO.find((v) => v.id === id) || { t0: 0, t1: 0 };
  const T0 = (id) => ln(id).t0, T1 = (id) => ln(id).t1;
  const word = (id, w) => { const x = WORDS.find((q) => q.p === id && q.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w); return x ? x.t0 : T0(id); };
  const PRESS = word('n02', 'enhance'), SWEEP = PRESS + 0.25, THERE = T0('n03'), ASK = T0('n04'), NO = T0('n05'), ISHIM = T0('n06');
  const SHRINK = T0('n07b'), MOLE = T0('n08'), GUESS = word('n08', 'guessed'), COURT = T0('n09') - 0.45, GAVEL = T0('n09') - 0.12, SEEN = T0('n10b'), WANTED = T0('n11');

  // ------------------------------------------------------------------ the two faces, 20 x 24 pixels each
  const FW = 20, FH = 24, B = 4;                                    // the camera kept one pixel per 4 x 4 block: 5 x 6 of them
  const COL = { bg: '#3a3346', cap: '#7b1e2c', capD: '#5e1522', brim: '#5a1320', skin: '#a8714c', skinD: '#8a5a3c', hair: '#2a201a',
    eye: '#1a1210', brow: '#2b1f19', lip: '#7a4334', mole: '#2e1a14', shirt: '#3d4a5c', must: '#2a1d16' };
  function paintFace(g, ai) {
    const r = (x, y, w, h, c) => { g.fillStyle = COL[c] || c; g.fillRect(x, y, w, h); };
    r(0, 0, FW, FH, 'bg');
    r(3, 21, 14, 3, 'shirt'); r(7, 19, 6, 3, 'skinD');                              // shoulders, neck
    r(4, 6, 12, 13, 'skin'); r(5, 19, 10, 1, 'skin'); r(6, 20, 8, 1, 'skinD');     // the face, narrowing to the chin
    r(3, 10, 1, 4, 'skinD'); r(16, 10, 1, 4, 'skinD');                             // ears
    r(4, 6, 1, 4, 'hair'); r(15, 6, 1, 4, 'hair');                                 // hair at the sides, under the cap
    r(5, 0, 10, 1, 'cap'); r(4, 1, 12, 4, 'cap'); r(9, 1, 2, 4, 'capD'); r(3, 5, 14, 1, 'brim');   // the cap and its brim
    r(4, 6, 12, 1, 'skinD');                                                        // the brim's shadow
    if (!ai) {                                                                      // the man with the mole
      r(6, 9, 3, 1, 'brow'); r(11, 9, 3, 1, 'brow');
      r(7, 11, 1, 1, 'eye'); r(12, 11, 1, 1, 'eye');
      r(9, 15, 2, 1, 'skinD'); r(7, 17, 6, 1, 'lip');
      r(13, 14, 1, 1, 'mole');                                                      // on his left cheek (your right)
    } else {                                                                        // the guess: heavy brows, a moustache, no mole
      r(5, 10, 4, 1, 'brow'); r(11, 10, 4, 1, 'brow');
      r(6, 11, 2, 1, 'eye'); r(12, 11, 2, 1, 'eye');
      r(9, 14, 2, 1, 'skinD'); r(6, 16, 8, 1, 'must'); r(8, 17, 4, 1, 'lip');
    }
  }
  // every pixel of a face as [r, g, b]; the invented face is then nudged block by block so each 4 x 4 block averages to
  // exactly what the camera recorded of the real one
  function faceData(ai) {
    const c = document.createElement('canvas'); c.width = FW; c.height = FH; const g = c.getContext('2d');
    paintFace(g, ai); const d = g.getImageData(0, 0, FW, FH).data, px = [];
    for (let i = 0; i < FW * FH; i++) px.push([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]);
    return px;
  }
  const blockMean = (px, bx, by) => { const m = [0, 0, 0]; for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) { const p = px[(by * B + y) * FW + bx * B + x]; for (let k = 0; k < 3; k++) m[k] += p[k] / (B * B); } return m; };
  let FACES = null;
  function faces() {
    if (FACES) return FACES;
    const real = faceData(false), guess = faceData(true);
    for (let by = 0; by < FH / B; by++) for (let bx = 0; bx < FW / B; bx++) {
      const mr = blockMean(real, bx, by), mg = blockMean(guess, bx, by);
      for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) { const i = (by * B + y) * FW + bx * B + x; guess[i] = guess[i].map((v, k) => clamp(Math.round(v + mr[k] - mg[k]), 0, 255)); }
    }
    const cam = []; for (let by = 0; by < FH / B; by++) for (let bx = 0; bx < FW / B; bx++) cam.push(blockMean(real, bx, by).map(Math.round));
    return (FACES = { real, guess, cam });
  }
  const hex = (p) => `rgb(${p[0]},${p[1]},${p[2]})`;
  // draw a face at (x, y) with each of its pixels s x s, seen through blocks of `blk` (1 = every pixel, 4 = the camera)
  function drawFace(x, y, s, which, blk = 1) {
    const F = faces(), px = F[which];
    for (let by = 0; by < FH; by += blk) for (let bx = 0; bx < FW; bx += blk) {
      let c = [0, 0, 0];
      for (let yy = 0; yy < blk; yy++) for (let xx = 0; xx < blk; xx++) { const p = px[(by + yy) * FW + bx + xx]; for (let k = 0; k < 3; k++) c[k] += p[k] / (blk * blk); }
      rect(x + bx * s, y + by * s, blk * s, blk * s, hex(c.map(Math.round)));
    }
  }

  // ------------------------------------------------------------------ the CCTV still: the stall at night, through the camera
  function cctvStill() {
    return tex('cctv-still', PW, PH, (g) => {
      // the stall at night, drawn at full detail first ...
      const sc = document.createElement('canvas'); sc.width = 160; sc.height = 152; const s = sc.getContext('2d'); s.imageSmoothingEnabled = false;
      const r = (x, y, w, h, c) => { s.fillStyle = c; s.fillRect(x, y, w, h); };
      r(0, 0, 160, 152, '#2b2636'); for (let y = 6; y < 100; y += 8) r(0, y, 160, 1, '#332d40');            // the wall
      r(0, 100, 160, 52, '#4a3a2c'); r(0, 100, 160, 4, '#6b5238');                                         // the counter
      r(14, 78, 18, 22, '#8d8e94'); r(18, 74, 10, 4, '#6f7076');                                            // the kettle
      r(126, 10, 2, 22, '#1a1a1a'); r(123, 32, 8, 9, '#e8d9a8');                                            // the bulb
      // him, behind the counter's corner, a phone in his hand
      const fx = 62, fy = 46;
      const fc = document.createElement('canvas'); fc.width = FW; fc.height = FH; paintFace(fc.getContext('2d'), false); s.drawImage(fc, fx, fy);
      r(fx - 6, fy + FH, FW + 12, 40, '#3d4a5c'); r(fx + FW + 2, fy + FH + 14, 6, 9, '#1c1c22');             // shoulders, the phone
      // ... then through the camera: every 4 x 4 block averaged to one pixel
      const d = s.getImageData(0, 0, 160, 152).data;
      for (let by = 0; by < 152 / B; by++) for (let bx = 0; bx < 160 / B; bx++) {
        const m = [0, 0, 0];
        for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) { const i = ((by * B + y) * 160 + bx * B + x) * 4; for (let k = 0; k < 3; k++) m[k] += d[i + k] / (B * B); }
        g.fillStyle = hex(m.map((v) => Math.round(v * 0.92 + 6))); g.fillRect(10 + bx * B, 92 + by * B, B, B);
      }
    });
  }
  function monitorFrame(t) {
    rect(6, 86, 168, 160, '#5b5b6b'); rect(8, 88, 164, 156, '#14121a');                                     // the bezel
    lo.drawImage(cctvStill(), 0, 0);
    for (let y = 92; y < 244; y += 2) rect(10, y, 160, 1, 'rgba(0,0,0,0.18)');                               // scan lines
    text('CAM 02', 14, 96, '#e8e6d8', 1, '#000');
    text('23:41:07', 102, 96, '#e8e6d8', 1, '#000');
    if (Math.floor(held(t, 2) * 1.5) % 2 === 0) { rect(146, 106, 5, 5, '#e0443a'); text('REC', 128, 105, '#e0443a', 1, '#000'); }
  }

  // ------------------------------------------------------------------ the pieces of the story
  function button(x, y, w, label, pressed, col = '#2f8f4e') {
    rect(x, y + 3, w, 18, '#0b0a10'); rect(x, y + (pressed ? 3 : 0), w, 18, col);
    text(label, x + w / 2, y + 6 + (pressed ? 3 : 0), '#f4f0e8', 1, '#0b0a10', 'center');
  }
  function closeUp(t) {                                            // the face filling the monitor: blocks, then the sweep of "enhance"
    rect(6, 70, 168, 154, '#5b5b6b'); rect(8, 72, 164, 150, '#14121a');
    const x = 30, y = 75, s = 6, sweep = clamp((held(t, 2) - SWEEP) / 0.9);
    drawFace(x, y, s, 'guess', 4);                                 // the camera's blocks (the same for both faces)
    if (sweep > 0) {                                               // above the line: the sharp guess
      lo.save(); lo.beginPath(); lo.rect(x, y, FW * s, Math.round(FH * s * sweep)); lo.clip(); drawFace(x, y, s, 'guess', 1); lo.restore();
      if (sweep < 1) rect(x - 4, y + Math.round(FH * s * sweep), FW * s + 8, 2, '#8ef0a8');
    }
  }
  function sideBySide(t) {                                         // the guess and the real face, shrinking to the camera's size
    const k = held(t, 2), s = 3, y = 92, xa = 14, xb = 98;
    // from "shrink": both step down to the camera's blocks. From "the camera never kept his mole": his face sharp again,
    // the mole ringed, then dropped into its block; the guess sharp, labelled GUESSED on "guessed".
    let ba = 1, bb = 1;
    if (t >= SHRINK && t < MOLE) ba = bb = k < SHRINK + 0.6 ? 1 : k < SHRINK + 1.2 ? 2 : 4;
    if (t >= MOLE) { ba = 1; bb = k < MOLE + 1.6 ? 1 : 4; }
    drawFace(xa, y, s, 'guess', ba); drawFace(xb, y, s, 'real', bb);
    text('THE GUESS', xa + 30, y + 78, '#f4f0e8', 1, '#0b0a10', 'center'); text('HIM', xb + 30, y + 78, '#f2c23a', 1, '#0b0a10', 'center');
    if (ba === 4 && bb === 4) { rect(78, y + 30, 12, 3, '#f4f0e8'); rect(78, y + 37, 12, 3, '#f4f0e8'); }   // =
    if (t >= MOLE && bb === 1) { const mx = xb + 13 * s + 1, my = y + 14 * s + 1; for (let a = 0; a < 20; a++) rect(mx + Math.round(Math.cos(a / 20 * 6.283) * 8), my + Math.round(Math.sin(a / 20 * 6.283) * 8), 1, 1, '#e0443a'); }
    if (t >= GUESS) text('GUESSED', xa + 30, y + 92, '#e0443a', 1, '#0b0a10', 'center');
  }
  function court(t) {                                              // 2024, Washington State: thrown out
    rect(20, 150, 140, 8, '#7a4624'); rect(28, 158, 124, 60, '#a8683a');                                     // the bench
    const lift = held(t, 2) < GAVEL && held(t, 2) >= GAVEL - 0.25 ? -12 : 0;                                  // the gavel, raised, then down on GAVEL
    rect(96, 120 + lift, 30, 10, '#5a2f17'); rect(108, 130 + lift, 6, 24, '#5a2f17'); rect(70, 146, 30, 4, '#3c2414');
    text('2024', CX, 96, '#f2c23a', 2, '#0b0a10', 'center');
    text('WASHINGTON STATE', CX, 116, '#f4f0e8', 1, '#0b0a10', 'center');
    if (held(t, 2) >= GAVEL + 1.0) { text('A.I.-ENHANCED VIDEO', CX, 228, '#f4f0e8', 1, '#0b0a10', 'center'); text('THROWN OUT', CX, 240, '#e0443a', 2, '#0b0a10', 'center'); }
  }
  function seenGuessed() {
    drawFace(14, 92, 3, 'guess', 1); text('GUESSED', 44, 170, '#e0443a', 1, '#0b0a10', 'center');
    drawFace(98, 92, 3, 'real', 4); text('SEEN', 128, 170, '#8ef0a8', 1, '#0b0a10', 'center');
  }
  function wanted(t) {                                             // the news runs the guess; he walks past with his chai
    rect(18, 70, 132, 100, '#5b5b6b'); rect(22, 74, 124, 92, '#14121a');                                     // a TV on the stall's wall
    text('WANTED', 84, 80, '#e0443a', 1, '#0b0a10', 'center'); drawFace(64, 92, 2, 'guess', 1);
    rect(0, 196, PW, 70, '#4a3a2c'); rect(0, 196, PW, 4, '#6b5238');                                         // the counter
    const u = clamp((held(t, 2) - WANTED) / 3.2), x = Math.round(lerp(-30, 200, u));                          // him, walking past
    rect(x - 4, 196, 48, 60, '#3d4a5c');                                                                    // his shoulders
    drawFace(x, 150, 2, 'real', 1);
    rect(x + 40, 178, 6, 8, 'rgba(225,235,240,0.9)'); rect(x + 41, 181, 4, 4, '#b7743a');                      // his chai
  }

  LAB.film({
    draw(g, t) {
      clear(); rect(0, 0, PW, PH, '#0e0c14');
      if (t < PRESS) {
        monitorFrame(t);
        text('CAUGHT ON', CX, 48, '#f4f0e8', 2, '#0b0a10', 'center'); text('CAMERA.', CX, 66, '#f4f0e8', 2, '#0b0a10', 'center');
      } else if (t < ISHIM) {
        closeUp(t);
        if (t < ASK) button(54, 230, 60, 'ENHANCE', held(t, 2) < PRESS + 0.25, '#2f6dd0');
        if (t >= ASK) { text('IS THIS HIM?', CX, 50, '#f4f0e8', 2, '#0b0a10', 'center'); button(30, 230, 44, 'YES', false); button(96, 230, 44, 'NO', t >= NO, '#b0303d'); }
        else text('ENHANCE', CX, 50, '#8ef0a8', 2, '#0b0a10', 'center');
      } else if (t < COURT) {
        sideBySide(t);
        if (t < SHRINK) text('IT IS HIM.', CX, 52, '#f2c23a', 2, '#0b0a10', 'center');
        else if (t < MOLE) text('SAME PIXELS.', CX, 52, '#f4f0e8', 2, '#0b0a10', 'center');
        else text('NOT KEPT.', CX, 52, '#f4f0e8', 2, '#0b0a10', 'center');
      } else if (t < SEEN) court(t);
      else if (t < WANTED) { seenGuessed(); text('GUESSED, NOT SEEN.', CX, 52, '#f4f0e8', 1, '#0b0a10', 'center'); }
      else wanted(t);
      present(g);
      LAB.safeOverlay(g);
    },
  });
})();
