// The Stranger's Button (lab clip 03): a two-ink risograph print. Green = $100,000 for you, pink = $1,000,000 for a
// stranger. You pick before the twist; then a stranger turns out to have the same two buttons, and their pink one pays
// you. It ends on the turn: whoever sees this next is your stranger (hope they pressed pink); it never asks for a
// send. Drawn on threes; every drawing is a new pass through the machine (misregistration, speckled ink). Pure
// function of t.
(() => {
  const { W, H, key, seg, clamp, lerp, E, rnd, rs, drawing, held } = LAB;
  const { ink, begin, print, halftone } = RISO;
  C.fonts = ['800 90px Bricolage', '700 60px Bricolage', '600 44px Bricolage'];
  const N = 3;                                   // on threes
  const T_LOCK = 4.05, T_B = 4.6, T_B2 = 7.1, T_C = 9.8, T_D = 12.5;

  // every shape takes a small per-drawing wobble, like a hand-cut stencil re-inked each pass
  const wob = (t, i, a = 1.4) => { const p = drawing(t, N); return [rs('wx', i, p) * a, rs('wy', i, p) * a]; };
  function txt(g, s, x, y, size, weight = 800, align = 'center') { g.font = `${weight} ${size}px Bricolage`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillStyle = '#000'; g.fillText(s, x, y); }
  const both = (fn) => { fn(ink('green').g); fn(ink('pink').g); };    // overprint: both inks → the dark third colour

  // ------------------------------------------------------------------ a button: the cap in its ink, a halftone shadow, the base overprinted
  function button(t, id, x, y, r, which, press = 0, label = true, small = false) {
    const [dx, dy] = wob(t, id), col = which === 'green' ? ink('green').g : ink('pink').g, other = which === 'green' ? ink('pink').g : ink('green').g;
    const cx = x + dx, cy = y + dy + press * r * 0.12;
    const capShape = (g) => { g.beginPath(); g.ellipse(cx, cy + r * 0.14, r, r * 0.5, 0, 0, Math.PI); g.lineTo(cx - r, cy - r * 0.16); g.ellipse(cx, cy - r * 0.16, r, r * 0.5, 0, Math.PI, 2 * Math.PI); g.closePath(); };
    // the base: a wider, flatter ring in the other ink, with the cap's silhouette knocked out of it (as a printer would)
    other.beginPath(); other.ellipse(x + dx, y + dy + r * 0.3, r * 1.18, r * 0.5, 0, 0, Math.PI * 2); other.fill();
    other.save(); other.globalCompositeOperation = 'destination-out'; capShape(other); other.fill(); other.restore();
    // the cap and its side, in its own ink
    capShape(col); col.fill();
    // the side's shading: dots of the other ink overprinted (they print dark on the colour)
    halftone(other, (g) => { g.beginPath(); g.ellipse(cx, cy + r * 0.14, r, r * 0.5, 0, 0, Math.PI); g.lineTo(cx - r, cy - r * 0.16); g.ellipse(cx, cy - r * 0.16, r, r * 0.5, 0, Math.PI, 0, true); g.closePath(); }, 0.38,
      { angle: which === 'green' ? 75 : 15, cell: small ? 9 : 12, x0: cx - r - 10, y0: cy - r, x1: cx + r + 10, y1: cy + r });
    // the top's rim, overprinted thin, and a highlight knocked out of the cap
    const rim = (g) => { g.save(); g.lineWidth = small ? 3 : 5; g.beginPath(); g.ellipse(cx, cy - r * 0.16, r, r * 0.5, 0, 0, Math.PI * 2); g.stroke(); g.restore(); };
    rim(other);
    col.save(); col.globalCompositeOperation = 'destination-out'; col.beginPath(); col.ellipse(cx - r * 0.38, cy - r * 0.3, r * 0.26, r * 0.09, -0.2, 0, Math.PI * 2); col.fill(); col.restore();
    if (label) {
      const s = small ? 0.6 : 1;
      txt(col, which === 'green' ? '$100,000' : '$1,000,000', x, y + r * 0.95 + 70 * s, (which === 'green' ? 76 : 70) * s);
      txt(col, which === 'green' ? 'FOR YOU' : 'FOR A STRANGER', x, y + r * 0.95 + 126 * s, 44 * s, 700);
    }
  }

  // your hand, pointing up from the bottom of the frame (pink halftone skin, overprinted outline)
  function hand(t, x, y, s = 1, aim = 0) {
    const [dx, dy] = wob(t, 77, 2);
    const path = (g) => {
      g.save(); g.translate(x + dx, y + dy + 330 * s); g.rotate(aim); g.translate(-(x + dx), -(y + dy + 330 * s));
      g.beginPath();
      g.roundRect(x + dx - 20 * s, y + dy, 40 * s, 170 * s, 20 * s);                   // the index finger
      g.roundRect(x + dx - 76 * s, y + dy + 140 * s, 168 * s, 190 * s, 50 * s);        // the fist
      for (let k = 0; k < 3; k++) g.roundRect(x + dx + (16 + k * 26) * s, y + dy + (122 + k * 4) * s, 30 * s, 64 * s, 15 * s);   // curled fingers' knuckles
      g.roundRect(x + dx - 104 * s, y + dy + 186 * s, 66 * s, 110 * s, 33 * s);        // the thumb, tucked
      g.rect(x + dx - 64 * s, y + dy + 300 * s, 140 * s, 420 * s);                     // the wrist, out of frame
      g.restore();
    };
    halftone(ink('pink').g, path, 0.32, { angle: 15, cell: 11, x0: x - 260, y0: y - 60, x1: x + 260, y1: H });
    both((g) => { g.save(); path(g); g.lineWidth = 7; g.strokeStyle = '#000'; g.stroke(); g.restore(); });
  }

  // ------------------------------------------------------------------ the scenes
  function sceneA(t) {             // PRESS ONE · pick now · 3 2 1 · LOCKED IN
    both((g) => txt(g, 'PRESS ONE.', W / 2, 400, 110));
    const pick = seg(t, 0.55, 0.75);
    if (pick > 0) txt(ink('pink').g, 'Pick now. No take-backs.', W / 2, 470, 46, 600);
    // the hand hovers, undecided, on threes
    const th = held(t, N);
    const hx = key(th, [[0, 540], [0.7, 330, 'inOut'], [1.5, 330], [2.1, 740, 'inOut'], [2.7, 740], [3.2, 400, 'inOut'], [3.6, 640, 'inOut'], [3.9, 540, 'inOut']]);
    button(t, 1, 300, 940, 170, 'green');
    button(t, 2, 780, 940, 170, 'pink');
    const out = seg(t, T_LOCK, T_LOCK + 0.35, 'in2');
    hand(t, hx, 1300 + out * 500 + Math.sin(th * 7) * 6, 1, (hx - 540) / 240 * -0.28);
    // the countdown: big numerals between the buttons, one per second
    for (const [n, a, b] of [['3', 1.0, 2.0], ['2', 2.0, 3.0], ['1', 3.0, T_LOCK]]) {
      if (t >= a && t < b) { const k = E.out(seg(t, a, a + 0.15)); both((g) => txt(g, n, W / 2, 760 + (1 - k) * 30, 200)); }
    }
    if (t >= T_LOCK) {             // LOCKED IN: a rubber stamp, pink, slightly crooked
      const k = seg(t, T_LOCK, T_LOCK + 0.12, 'in2');
      const g = ink('pink').g; g.save(); g.translate(W / 2, 1240); g.rotate(-0.12); g.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k);
      g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeRect(-300, -78, 600, 150);
      txt(g, 'LOCKED IN.', 0, 34, 104); g.restore();
    }
  }
  function sceneB(t) {             // a stranger has the same two buttons; their pink one pays you
    // you, small, at the top
    both((g) => txt(g, 'YOU', 180, 420, 56, 800, 'left'));
    button(t, 11, 470, 470, 70, 'green', 0, false, true);
    button(t, 12, 680, 470, 70, 'pink', 0, false, true);
    // the stranger, at the bottom, at the same two buttons
    const sx = 230, sy = 1080;
    const body = (g) => { g.beginPath(); g.arc(sx, sy - 210, 62, 0, Math.PI * 2); g.roundRect(sx - 90, sy - 140, 180, 330, 70); };
    halftone(ink('pink').g, body, 0.7, { angle: 15, cell: 12, x0: sx - 120, y0: sy - 290, x1: sx + 120, y1: sy + 200 });
    both((g) => { g.save(); body(g); g.lineWidth = 6; g.stroke(); g.restore(); });
    const [ax, ay] = wob(t, 21, 2);
    both((g) => { g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx + 60, sy - 90); g.quadraticCurveTo(sx + 170 + ax, sy - 70, sx + 260 + ax, sy - 20 + ay); g.stroke(); });
    button(t, 13, 560, 1110, 100, 'green', 0, false, true);
    button(t, 14, 800, 1110, 100, 'pink', 0, false, true);
    const k1 = seg(t, T_B, T_B + 0.2, 'out');
    if (k1 > 0) both((g) => { txt(g, 'A STRANGER HAS', W / 2, 700 + (1 - k1) * 20, 84); txt(g, 'THE SAME TWO BUTTONS.', W / 2, 790 + (1 - k1) * 20, 78); });
    // their pink one pays you: a pink arrow from their pink button up to YOU, drawn on
    if (t >= T_B2) {
      const k = seg(t, T_B2, T_B2 + 0.6, 'inOut'), g = ink('pink').g;
      const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40 * k; pts.push([lerp(800, 250, u) + Math.sin(u * Math.PI) * 330, lerp(1010, 470, u)]); }
      g.save(); g.lineWidth = 18; g.lineCap = 'round'; g.setLineDash([2, 30]); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke(); g.restore();
      if (k >= 1) { g.beginPath(); g.moveTo(232, 455); g.lineTo(290, 490); g.lineTo(270, 430); g.closePath(); g.fill(); }
      const k2 = seg(t, T_B2 + 0.2, T_B2 + 0.45, 'out');
      if (k2 > 0) {
        both((gg) => { txt(gg, 'THEIR PINK ONE', W / 2, 1460 + (1 - k2) * 20, 92); });
        txt(ink('pink').g, 'PAYS YOU.', W / 2, 1560 + (1 - k2) * 20, 104);
      }
    }
  }
  function sceneC(t) {             // back to your buttons: which did you press?
    both((g) => txt(g, 'WHICH DID', W / 2, 400, 110));
    both((g) => txt(g, 'YOU PRESS?', W / 2, 510, 110));
    button(t, 31, 300, 940, 170, 'green');
    button(t, 32, 780, 940, 170, 'pink');
    txt(ink('pink').g, 'They’re picking right now.', W / 2, 1390, 50, 600);
  }
  function sceneD(t) {             // the turn: whoever sees this next is your stranger (it never asks for a send)
    const k = (a) => seg(t, a, a + 0.2, 'out');
    button(t, 41, 380, 640, 80, 'green', 0, false, true);
    button(t, 42, 700, 640, 80, 'pink', 0, false, true);
    both((g) => { txt(g, 'WHOEVER SEES', W / 2, 920 + (1 - k(T_D)) * 20, 96); txt(g, 'THIS NEXT', W / 2, 1020 + (1 - k(T_D)) * 20, 96); });
    if (t >= T_D + 0.7) txt(ink('green').g, 'is your stranger.', W / 2, 1150 + (1 - k(T_D + 0.7)) * 20, 54, 700);
    if (t >= T_D + 1.5) txt(ink('pink').g, 'Hope they pressed pink.', W / 2, 1230 + (1 - k(T_D + 1.5)) * 20, 54, 700);
  }

  LAB.film({
    draw(g, t) {
      begin();
      if (t < T_B - 0.05) sceneA(t);
      else if (t < T_C) sceneB(t);
      else if (t < T_D) sceneC(t);
      else sceneD(t);
      // a scene change is a new print pulled through the machine: the page slides up out of the drum for 4 frames
      const cut = [T_B - 0.05, T_C, T_D].find((c) => t >= c && t < c + 4 / 30);
      const slide = cut ? (1 - (t - cut) / (4 / 30)) * 140 : 0;
      g.save(); g.translate(0, slide);
      print(g, t, ['green', 'pink'], { n: N, mis: 4 });
      g.restore();
      if (slide > 0) { g.fillStyle = '#2b2622'; g.fillRect(0, 0, W, slide); }
      LAB.safeOverlay(g);
    },
  });
})();
