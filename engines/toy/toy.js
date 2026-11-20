// THE STYLE LAB · toy: a flat, toy-like diorama. Painted wooden toys on a set: chunky rounded shapes, a few saturated
// colours, a light from the top left that gives each piece a lit top edge, a darker underside and a hard contact
// shadow on whatever it rests on. No outlines. Nothing drifts or eases: the toys are moved by baked physics
// (engines/physics) or by keyed poses that stop when they hit something.
//
// Loads after lab.js. Exposes window.TOY.
(() => {
  const { rnd, rs } = LAB;

  // the palette: wooden-toy paint, cream walls, warm wood
  const P = {
    wall: '#f3e6cc', wallShade: '#e8d6b4', ceiling: '#efe0c2', floor: '#c98f5a', floorDark: '#a8703f', board: '#b97e4b',
    wood: '#d9a066', woodDark: '#b57a42', woodLight: '#eabd86',
    red: '#e2412f', redDark: '#b02a1d', yellow: '#f5c026', yellowDark: '#d29a0c', blue: '#2f6fd0', blueDark: '#1f4c98',
    green: '#3a9a5b', greenDark: '#26703f', cream: '#fff6e6', pink: '#f7a1b5', pinkDark: '#d97590', white: '#fffdf8',
    ink: '#2b2118', shadow: 'rgba(60,32,10,0.28)', black: '#2a2521', grey: '#9aa3ad', greyDark: '#6d7680',
  };

  // shade a hex colour: k < 0 darker, k > 0 lighter
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }

  function rrect(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  // a painted block: body, a lit band along the top, a darker band along the bottom (light from the top left)
  function block(g, x, y, w, h, col, { r = 10, lit = 0.22, dark = 0.2, band = 0.18, shadow = true } = {}) {
    if (shadow) { g.fillStyle = P.shadow; rrect(g, x + 7, y + 9, w, h, r); g.fill(); }
    g.fillStyle = col; rrect(g, x, y, w, h, r); g.fill();
    g.save(); rrect(g, x, y, w, h, r); g.clip();
    const b = Math.max(4, Math.min(h, w) * band);
    g.fillStyle = shade(col, lit); g.fillRect(x, y, w, b * 0.7);
    g.fillStyle = shade(col, -dark); g.fillRect(x, y + h - b, w, b);
    g.fillStyle = shade(col, -dark * 0.5); g.fillRect(x + w - b * 0.6, y, b * 0.6, h);
    g.restore();
  }

  // a block drawn in its own frame, centred on (cx, cy) and turned by a (radians): for physics bodies
  function body(g, cx, cy, a, w, h, col, opts = {}) {
    g.save(); g.translate(cx, cy);
    if (opts.shadow !== false) {   // the shadow stays down-right whatever the turn: the light doesn't rotate
      g.save(); g.translate(7, 9); g.rotate(a); g.fillStyle = P.shadow; rrect(g, -w / 2, -h / 2, w, h, opts.r ?? 10); g.fill(); g.restore();
    }
    g.rotate(a);
    block(g, -w / 2, -h / 2, w, h, col, { ...opts, shadow: false });
    if (opts.paint) opts.paint(g, w, h);
    g.restore();
  }

  // a ball: flat colour, a lit crescent and one hard highlight
  function ball(g, x, y, r, col, a = 0, { shadow = true, stripe = null } = {}) {
    if (shadow) { g.fillStyle = P.shadow; g.beginPath(); g.arc(x + 5, y + 7, r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
    if (stripe) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = stripe; g.fillRect(-r, -r * 0.22, r * 2, r * 0.44); g.restore(); }
    g.fillStyle = shade(col, -0.22); g.beginPath(); g.arc(x + r * 0.35, y + r * 0.4, r, 0, Math.PI * 2); g.arc(x, y, r * 1.6, 0, Math.PI * 2, true); g.fill();
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.15, -0.6, 0, Math.PI * 2); g.fill();
  }

  // a flat wooden floorboard pattern, a wall with a skirting board: the set
  function set(g, { W, H, floorY, ceilY, wallCol = P.wall }) {
    g.fillStyle = wallCol; g.fillRect(0, ceilY, W, floorY - ceilY);
    // soft vertical paint strokes on the wall (seeded, fixed: the set doesn't boil)
    for (let i = 0; i < 26; i++) {
      const x = rnd('wall', i) * W, w = 30 + rnd('wallw', i) * 90;
      g.fillStyle = `rgba(150,110,60,${0.025 + rnd('walla', i) * 0.03})`; g.fillRect(x, ceilY, w, floorY - ceilY);
    }
    // the ceiling slab
    g.fillStyle = P.ceiling; g.fillRect(0, 0, W, ceilY);
    g.fillStyle = shade(P.ceiling, -0.12); g.fillRect(0, ceilY - 14, W, 14);
    g.fillStyle = 'rgba(60,32,10,0.12)'; g.fillRect(0, ceilY, W, 18);
    // the floor
    g.fillStyle = P.floor; g.fillRect(0, floorY, W, H - floorY);
    for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? P.floorDark : shade(P.floor, 0.06); g.fillRect(0, floorY + 26 + k * 70, W, 4); }
    g.fillStyle = shade(P.floor, 0.18); g.fillRect(0, floorY, W, 10);
    // skirting board
    g.fillStyle = P.cream; g.fillRect(0, floorY - 34, W, 34); g.fillStyle = shade(P.cream, -0.1); g.fillRect(0, floorY - 8, W, 8);
  }

  // words set like painted wooden letters: a darker extrusion under each letter, then the face
  function words(g, text, x, y, { size = 96, col = P.red, face = 'Fredoka', weight = 700, align = 'left', depth = 7, lift = 0.25 } = {}) {
    g.save(); g.font = `${weight} ${size}px ${face}`; g.textAlign = align; g.textBaseline = 'alphabetic';
    for (let d = depth; d > 0; d--) { g.fillStyle = shade(col, -0.35); g.fillText(text, x + d * 0.6, y + d); }
    g.fillStyle = col; g.fillText(text, x, y);
    g.save(); g.beginPath(); g.rect(x - 2000, y - size, 4000, size * lift); g.clip(); g.fillStyle = shade(col, 0.2); g.fillText(text, x, y); g.restore();
    g.restore();
  }

  window.TOY = { P, shade, rrect, block, body, ball, set, words };
})();
