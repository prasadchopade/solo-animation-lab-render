// Linden Row's cast, drawn in code as paper cut-outs: flat colour, no outline, a white die-cut border and a thin paper
// edge, faint grain. Small heads on long bodies, so they read as ours and not as the doodle-bean figures we studied.
// Each figure is painted once onto a canvas (512 wide); the film stands it in the lit street as a card.
// Every figure is invented. The man with the mole is season 1's thief: maroon cap, bald under it, the mole on his LEFT
// cheek, which is the viewer's right when he faces us.

const TAU = Math.PI * 2;
function rng(seed) { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ell = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); };
const poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); g.fill(); };
const rr = (g, x, y, w, h, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
const line = (g, pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.stroke(); };
const arc = (g, x, y, r, a0, a1, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); };

// the paper: the figure, a white die-cut border grown round its silhouette, and a thin darker edge just below it
export function paper(w, h, draw, seed = 1, border = 13) {
  const a = cv(w, h); draw(a.getContext('2d'), w, h);
  const grow = (col, r, dy) => {
    const s = cv(w, h), gs = s.getContext('2d');
    for (let k = 0; k < 28; k++) { const an = k / 28 * TAU; gs.drawImage(a, Math.cos(an) * r, Math.sin(an) * r + dy); }
    gs.globalCompositeOperation = 'source-in'; gs.fillStyle = col; gs.fillRect(0, 0, w, h);
    return s;
  };
  const out = cv(w, h), g = out.getContext('2d');
  g.drawImage(grow('rgb(150,138,122)', border, 3), 0, 0);       // the paper's thickness, catching a little shade
  g.drawImage(grow('#fbf6ea', border, 0), 0, 0);                // the die-cut border
  g.drawImage(a, 0, 0);
  const r = rng(seed); g.globalCompositeOperation = 'source-atop';   // grain, on the paper only
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(60,40,20,0.05)'; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); }
  return out;
}

// eyes: two dots with a pupil that looks (dx, dy in -1..1), and brows (tilt: + is cross, - is worried); mouth separate
function eyes(g, x, y, gap, r, look, col = '#231a16') {
  for (const s of [-1, 1]) { ell(g, x + s * gap, y, r * 1.25, r * 1.35, '#fbf6ea'); ell(g, x + s * gap + look[0] * r * 0.55, y + look[1] * r * 0.5, r * 0.8, r * 0.9, col); }
}
function brows(g, x, y, gap, len, tiltL, tiltR, w, col) {
  line(g, [[x - gap - len / 2, y - tiltL], [x - gap + len / 2, y + tiltL]], w, col);
  line(g, [[x + gap - len / 2, y + tiltR], [x + gap + len / 2, y - tiltR]], w, col);
}

// --------------------------------------------------------------------------------- the woman at number seven
// A dressing gown, curlers, slippers. Puzzled: one brow up, looking down at the kettle on her step (to her left, our right).
export function kettleWoman() {
  return paper(512, 1024, (g) => {
    const skin = '#efc3a3', gown = '#e27d93', dark = '#b8566c';
    ell(g, 206, 1000, 52, 20, '#f4a7b6'); ell(g, 306, 1000, 52, 20, '#f4a7b6');                 // slippers
    rr(g, 190, 900, 30, 92, 12, skin); rr(g, 292, 900, 30, 92, 12, skin);                         // ankles
    poly(g, [[170, 330], [342, 330], [392, 930], [120, 930]], gown);                               // the gown
    g.save(); g.beginPath(); g.moveTo(170, 330); g.lineTo(342, 330); g.lineTo(392, 930); g.lineTo(120, 930); g.closePath(); g.clip();
    for (let k = 0; k < 7; k++) { line(g, [[150 + k * 40, 420], [230 + k * 40, 920]], 3, dark); line(g, [[362 - k * 40, 420], [282 - k * 40, 920]], 3, dark); }
    g.restore();                                                                                   // the quilting stays inside the gown (outside it, each line grew its own white border)
    poly(g, [[256, 330], [210, 330], [256, 460], [302, 330]], '#f6d5dc');                          // the collar
    rr(g, 140, 540, 232, 34, 14, dark); ell(g, 300, 580, 26, 14, dark, 0.5);                      // the belt, its knot
    poly(g, [[170, 340], [128, 360], [112, 600], [160, 610], [186, 420]], gown);                   // sleeves, hands clasped
    poly(g, [[342, 340], [384, 360], [400, 600], [352, 610], [326, 420]], gown);
    ell(g, 162, 618, 30, 26, skin); ell(g, 352, 618, 30, 26, skin);
    rr(g, 230, 280, 52, 64, 16, skin);                                                             // neck
    ell(g, 256, 210, 92, 108, skin);                                                               // head
    ell(g, 256, 140, 104, 66, '#c9c4bd'); ell(g, 256, 70, 46, 40, '#c9c4bd');                     // grey hair and its bun
    for (const [x, y] of [[180, 128], [226, 106], [282, 106], [330, 128]]) rr(g, x - 20, y - 14, 40, 28, 12, '#7fb6d9');   // curlers
    eyes(g, 256, 214, 34, 11, [0.6, 0.7]);
    brows(g, 256, 182, 34, 34, 2, -10, 7, '#8d8780');                                              // one brow up
    line(g, [[232, 268], [246, 262], [262, 270], [278, 263]], 6, '#9c4b4b');                       // a doubtful mouth
  }, 7);
}

// --------------------------------------------------------------------------------- the girl at number eight, and her dog
// A yellow raincoat, red wellies, two puffs of hair. Cross, looking along the street toward number nine (our right).
export function girl(point) {                                       // point: on "blames", her arm out toward number nine
  return paper(512, 1024, (g) => {
    const skin = '#6e4532', coat = '#f2c232', dark = '#c99a1a';
    rr(g, 178, 850, 64, 150, 18, '#d1453b'); rr(g, 270, 850, 64, 150, 18, '#d1453b');            // wellies
    poly(g, [[170, 470], [342, 470], [380, 870], [132, 870]], coat);                               // the raincoat
    line(g, [[256, 520], [256, 860]], 4, dark); for (const y of [560, 650, 740]) ell(g, 272, y, 9, 9, dark);
    poly(g, [[176, 478], [138, 500], [120, 700], [166, 706], [190, 560]], coat); ell(g, 144, 716, 28, 26, skin);
    if (point) { poly(g, [[322, 482], [452, 420], [466, 452], [340, 540]], coat); ell(g, 462, 434, 20, 19, skin); rr(g, 464, 424, 22, 10, 5, skin); }   // inside the border's room
    else { poly(g, [[336, 478], [374, 500], [392, 700], [346, 706], [322, 560]], coat); ell(g, 368, 716, 28, 26, skin); }
    rr(g, 232, 420, 48, 64, 14, skin);                                                             // neck
    ell(g, 256, 340, 96, 110, skin);                                                               // head
    ell(g, 160, 260, 62, 62, '#1d1512'); ell(g, 352, 260, 62, 62, '#1d1512');                     // two puffs
    ell(g, 256, 262, 100, 56, '#1d1512');
    eyes(g, 256, 346, 34, 11, [0.85, 0]);
    brows(g, 256, 312, 34, 34, -9, -9, 7, '#1d1512');                                             // cross
    line(g, [[236, 396], [276, 392]], 6, '#3d1f19');
  }, 8);
}
export function dog() {
  return paper(512, 512, (g) => {
    const fur = '#e9dfcf', patch = '#8a5a3b';
    poly(g, [[150, 470], [180, 250], [330, 250], [360, 470]], fur);                                // sitting body
    ell(g, 210, 470, 42, 22, fur); ell(g, 310, 470, 42, 22, fur);                                  // paws
    ell(g, 330, 330, 40, 70, patch, 0.2);                                                          // a patch
    poly(g, [[352, 410], [430, 380], [440, 400], [362, 440]], fur);                                // tail
    ell(g, 290, 190, 92, 80, fur);                                                                 // head, turned to our right
    ell(g, 356, 214, 46, 34, fur); ell(g, 396, 206, 14, 12, '#231a16');                           // muzzle, nose
    poly(g, [[220, 140], [196, 70], [252, 120]], patch); poly(g, [[300, 120], [330, 58], [340, 128]], patch);   // ears
    ell(g, 304, 180, 9, 11, '#231a16');                                                            // the eye toward us
    line(g, [[284, 160], [314, 154]], 6, '#6b5a4a');                                               // a suspicious brow
  }, 9, 11);
}

// --------------------------------------------------------------------------------- the man at number ten
// A green cardigan, a newspaper. Reading, then (on "blames") the paper comes down and he glares along the street.
export function paperMan(glare) {
  return paper(512, 1024, (g) => {
    const skin = '#c99b72', card = '#4f7a5a';
    ell(g, 206, 1002, 50, 18, '#4a3a30'); ell(g, 306, 1002, 50, 18, '#4a3a30');                  // slippers
    rr(g, 184, 640, 64, 360, 16, '#8a8f96'); rr(g, 266, 640, 64, 360, 16, '#8a8f96');            // trousers
    poly(g, [[160, 300], [352, 300], [372, 680], [140, 680]], card);                               // the cardigan
    poly(g, [[220, 300], [292, 300], [256, 420]], '#f1ede4');                                      // shirt
    for (const y of [450, 520, 590]) ell(g, 262, y, 8, 8, '#e3d6b6');
    rr(g, 230, 250, 52, 60, 14, skin);
    ell(g, 256, 180, 90, 104, skin);
    ell(g, 256, 100, 96, 50, '#3b2c24');                                                           // hair
    eyes(g, 256, 178, 34, 11, glare ? [0.9, 0] : [0, 0.8]);
    if (glare) brows(g, 256, 146, 34, 36, -11, -11, 8, '#3b2c24');
    else brows(g, 256, 148, 34, 36, 0, 0, 7, '#3b2c24');
    poly(g, [[214, 232], [256, 220], [298, 232], [290, 246], [256, 238], [222, 246]], '#3b2c24');    // moustache
    if (glare) {
      poly(g, [[150, 470], [362, 470], [372, 620], [140, 620]], '#ece6d8');                        // the paper, lowered
      for (let k = 0; k < 6; k++) line(g, [[164, 492 + k * 22], [348, 492 + k * 22]], 5, '#a59f94');
      ell(g, 150, 548, 26, 30, skin); ell(g, 362, 548, 26, 30, skin);
    } else {
      poly(g, [[110, 200], [402, 200], [412, 470], [100, 470]], '#ece6d8');                        // the paper, up, over his mouth
      for (let k = 0; k < 9; k++) line(g, [[126, 224 + k * 26], [386, 224 + k * 26]], 5, '#a59f94');
      rr(g, 130, 222, 110, 80, 4, '#a59f94');
      ell(g, 104, 340, 26, 30, skin); ell(g, 408, 340, 26, 30, skin);
    }
  }, 10);
}

// --------------------------------------------------------------------------------- the man at number nine
// Season 1's thief: maroon cap, bald under it (a little hair at the sides), dark grey jacket, a mug. The mole on his LEFT
// cheek: the viewer's right. Looking along the street at the neighbours (our left), then (on "past") straight at you.
export function moleMan(atYou) {
  return paper(512, 1024, (g) => {
    const skin = '#8f5f42', jacket = '#3d4149', cap = '#7b1e21';
    rr(g, 176, 960, 76, 44, 18, '#e9e4da'); rr(g, 262, 960, 76, 44, 18, '#e9e4da');              // trainers
    rr(g, 186, 640, 62, 330, 16, '#2f3d58'); rr(g, 264, 640, 62, 330, 16, '#2f3d58');            // jeans
    poly(g, [[156, 300], [356, 300], [372, 680], [140, 680]], jacket);                             // the jacket
    poly(g, [[226, 300], [286, 300], [256, 380]], '#b9bec4');                                      // t-shirt
    poly(g, [[156, 310], [118, 330], [104, 600], [150, 606], [172, 420]], jacket); ell(g, 128, 616, 28, 26, skin);
    poly(g, [[356, 310], [392, 330], [384, 470], [330, 478], [334, 400]], jacket);                 // his left arm, bent: the mug
    rr(g, 300, 430, 70, 84, 12, '#f3efe6'); arc(g, 378, 470, 20, -1.3, 1.3, 9, '#f3efe6');        // the mug
    ell(g, 320, 476, 26, 24, skin);
    rr(g, 230, 250, 52, 60, 14, skin);
    ell(g, 256, 182, 90, 104, skin);                                                               // head
    ell(g, 170, 196, 14, 26, '#1d1a18'); ell(g, 342, 196, 14, 26, '#1d1a18');                     // what hair he has, at the sides
    ell(g, 166, 206, 16, 24, skin); ell(g, 346, 206, 16, 24, skin);                                // ears
    g.fillStyle = cap; g.beginPath(); g.ellipse(256, 118, 94, 70, 0, Math.PI, TAU); g.fill();    // the cap's crown
    rr(g, 162, 106, 188, 22, 8, cap);
    ell(g, 256, 128, 104, 22, '#5e1518');                                                          // the brim, toward us
    ell(g, 256, 66, 10, 8, '#5e1518');                                                             // the button on top
    eyes(g, 256, 182, 34, 11, atYou ? [0, 0] : [-0.9, 0]);
    brows(g, 256, 150, 34, 34, 0, 0, 7, '#1d1a18');
    line(g, [[236, 238], [276, 238]], 6, '#3d241b');                                               // a flat mouth
    ell(g, 304, 214, 9, 9, '#2a1712');                                                             // the mole: his left cheek, our right
  }, 11);
}
