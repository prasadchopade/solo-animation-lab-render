// THE STYLE LAB · pixel: 16-bit pixel art. The film draws into a small canvas (180 x 320, every coordinate a whole
// pixel) and scales it up 6x with no smoothing, so every pixel is a hard 6 x 6 block. Its own palette and its own
// 5 x 7 pixel font, drawn here, so it borrows nothing from any game. Motion moves in whole pixels.
//
// Loads after lab.js. Exposes window.PIX.
(() => {
  const { W, H } = LAB;
  const S = 6, PW = W / S, PH = H / S;           // 180 x 320
  const lo = document.createElement('canvas'); lo.width = PW; lo.height = PH;
  const g = lo.getContext('2d'); g.imageSmoothingEnabled = false;

  // the palette: 20 colours, ours
  const P = {
    k: '#14101c', d: '#2a2440', d2: '#3d3660', m: '#5b5b8a', l: '#9a9ac4', w: '#f4f0e8',
    brick: '#7a3e3a', brickD: '#5a2a2a', brickL: '#9c5248', mortar: '#4a2626',
    pipe: '#8c97a8', pipeD: '#5c6578', pipeL: '#c4ccd8', water: '#3a8ee8', waterL: '#8ccfff', waterD: '#2160b8',
    wood: '#a8683a', woodD: '#7a4624', gold: '#f2c23a', goldD: '#c08a1e', red: '#e0443a', green: '#5ccf5a', glass: '#cfe8f2',
  };
  const clear = () => { g.clearRect(0, 0, PW, PH); };
  const px = (x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const rect = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  // a 1-px line with whole-pixel steps (Bresenham)
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    g.fillStyle = c;
    for (;;) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }

  // the font: 5 x 7, uppercase, digits and a few marks; each glyph is 7 rows of 5 bits
  const F = {
    A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01111 10000 10000 10000 10000 10000 01111',
    D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01111 10000 10000 10011 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001', I: '01110 00100 00100 00100 00100 00100 01110',
    J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001', O: '01110 10001 10001 10001 10001 10001 01110',
    P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
    S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
    V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 11011 10001', X: '10001 10001 01010 00100 01010 10001 10001',
    Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
    0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110', 2: '01110 10001 00001 00110 01000 10000 11111',
    3: '11110 00001 00001 01110 00001 00001 11110', 4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
    6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000', 8: '01110 10001 10001 01110 10001 10001 01110',
    9: '01110 10001 10001 01111 00001 00010 01100', '?': '01110 10001 00001 00110 00100 00000 00100', '!': '00100 00100 00100 00100 00100 00000 00100',
    '.': '00000 00000 00000 00000 00000 00000 00100', ',': '00000 00000 00000 00000 00000 00100 01000', ':': '00000 00100 00000 00000 00000 00100 00000',
    "'": '00100 00100 01000 00000 00000 00000 00000', '-': '00000 00000 00000 11111 00000 00000 00000', ' ': '00000 00000 00000 00000 00000 00000 00000',
  };
  const textWidth = (s, sc = 1) => s.length * 6 * sc - sc;
  // text at (x, y) top-left, scale sc (whole pixels), colour c, with a 1-px drop shadow sh
  function text(s, x, y, c, sc = 1, sh = null, align = 'left') {
    s = String(s).toUpperCase();
    if (align === 'center') x = Math.round(x - textWidth(s, sc) / 2);
    if (s.trim()) LAB.textBox(s, x * S, y * S, (x + textWidth(s, sc) + (sh ? sc : 0)) * S, (y + 7 * sc + (sh ? sc : 0)) * S);   // for the safe check
    for (const pass of sh ? [[sh, sc, sc], [c, 0, 0]] : [[c, 0, 0]]) {
      g.fillStyle = pass[0];
      for (let i = 0; i < s.length; i++) {
        const rows = (F[s[i]] || F[' ']).split(' ');
        for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (rows[r][k] === '1') g.fillRect(x + i * 6 * sc + k * sc + pass[1], y + r * sc + pass[2], sc, sc);
      }
    }
  }
  // blit the small canvas onto the film's canvas, 6x, hard pixels
  function present(dst) { dst.save(); dst.imageSmoothingEnabled = false; dst.drawImage(lo, 0, 0, PW, PH, 0, 0, W, H); dst.restore(); }

  window.PIX = { S, PW, PH, g, P, clear, px, rect, line, text, textWidth, present };
})();
