// THE STYLE LAB · shadow: cut-paper shadow puppets on a backlit screen. A lamp behind a paper screen (a warm hotspot
// that falls off to the edges, the paper's fibres, the faintest lamp flicker, never a flash); in front of it, black
// card puppets with lace cut into them, hinged at brass split pins you can see. Pieces turn about their pins and move
// on twos, as puppets do. Built so it reads as made, not as a filter: the pins, the rods, the hand-cut lace.
//
// Loads after lab.js. Exposes window.SHADOW.
(() => {
  const { W, H, rnd, rs, n1, tex } = LAB;
  const BLACK = '#120a06';
  const ink = document.createElement('canvas'); ink.width = W; ink.height = H; const ig = ink.getContext('2d');

  // the screen: amber light from a lamp behind it, brightest a little above centre
  const screenTex = (cx, cy) => tex(`shadow-screen-${cx}-${cy}`, W, H, (g) => {
    const gr = g.createRadialGradient(cx, cy, 60, cx, cy, 1250);
    gr.addColorStop(0, '#fff1c9'); gr.addColorStop(0.35, '#f6c66e'); gr.addColorStop(0.75, '#c8742c'); gr.addColorStop(1, '#5a2a10');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = C.mulberry32(31);
    for (let i = 0; i < 6000; i++) { g.strokeStyle = `rgba(90,45,10,${0.03 + r() * 0.05})`; g.lineWidth = 1; const x = r() * W, y = r() * H, a = r() * Math.PI, l = 4 + r() * 16; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  });
  const flick = n1('lampflicker');
  function screen(g, t, cx = 540, cy = 760) {
    g.drawImage(screenTex(cx, cy), 0, 0);
    const f = 0.04 * (flick(t * 3) * 0.5 + 0.5);                   // the lamp breathes a little: a slow dim, not a flicker
    g.fillStyle = `rgba(40,15,0,${f})`; g.fillRect(0, 0, W, H);
  }

  function begin() { ig.clearRect(0, 0, W, H); ig.fillStyle = '#000'; ig.strokeStyle = '#000'; }
  // lace: punch a pattern of small holes inside a path (light shows through the card)
  function lace(pathFn, kind, seed, { x0 = 0, y0 = 0, x1 = W, y1 = H, cell = 26, r = 5 } = {}) {
    ig.save(); pathFn(ig); ig.clip(); ig.globalCompositeOperation = 'destination-out'; ig.beginPath();
    for (let y = y0; y < y1; y += cell) for (let x = x0 + ((y / cell) % 2) * cell / 2; x < x1; x += cell) {
      if (kind === 'dots') { ig.moveTo(x + r, y); ig.arc(x, y, r, 0, Math.PI * 2); }
      else if (kind === 'diamonds') { ig.moveTo(x, y - r * 1.4); ig.lineTo(x + r, y); ig.lineTo(x, y + r * 1.4); ig.lineTo(x - r, y); ig.closePath(); }
      else if (kind === 'stars') for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; ig.moveTo(x, y); ig.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.9, r * 0.35, a, 0, Math.PI * 2); }
    }
    ig.fill(); ig.restore();
  }
  // a split pin at a joint: a small ring with a dot, cut so the light shows round it
  function pin(x, y, r = 7) {
    ig.save(); ig.globalCompositeOperation = 'destination-out'; ig.beginPath(); ig.arc(x, y, r, 0, Math.PI * 2); ig.arc(x, y, r - 2.5, 0, Math.PI * 2, true); ig.fill(); ig.restore();
  }
  // a hinged part: draw(g) in its own frame, turned by `a` about its pivot (px, py), placed at (x, y)
  function part(x, y, a, draw) { ig.save(); ig.translate(x, y); ig.rotate(a); draw(ig); ig.restore(); }
  // a puppeteer's rod: a thin line from a hand down off the bottom of the screen
  function rod(x, y, x2, y2) { ig.save(); ig.lineWidth = 3; ig.beginPath(); ig.moveTo(x, y); ig.lineTo(x2, y2); ig.stroke(); ig.restore(); }
  // print the card onto the screen: black, crisp (touching the screen), with the faintest lift of light at its edges
  function show(g) {
    g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(tintBlack(), 0, 0); g.restore();
  }
  const tc = document.createElement('canvas'); tc.width = W; tc.height = H; const tg = tc.getContext('2d');
  function tintBlack() { tg.clearRect(0, 0, W, H); tg.drawImage(ink, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = BLACK; tg.fillRect(0, 0, W, H); tg.globalCompositeOperation = 'source-over'; return tc; }

  window.SHADOW = { BLACK, ig, screen, begin, lace, pin, part, rod, show };
})();
