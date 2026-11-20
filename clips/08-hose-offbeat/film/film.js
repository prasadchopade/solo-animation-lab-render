// Off the Beat (lab clip 08): a 1930s rubber-hose room where everything bounces to a stride piano, on twos. One of
// them (the hat stand) lands 5 frames late: 167 ms, inside the 130–250 ms a viewer can find in a few seconds. A
// stopwatch counts your time. At 10.5 s the metronome who's conducting leans over and bonks the hat stand back onto
// the beat. A 14 s loop (seven bars at 120 bpm). Pure function of t.
(() => {
  const { W, H, seg, clamp, lerp, E, rnd, rs, held, key } = LAB;
  const { P, brush, inked, hoseLimb, face, squash, film } = HOSE;
  C.fonts = ['700 90px Fraunces'];
  const LOOP = 14, BEAT = 0.5, LATE = 5 / 30, BONK = 10.5, FIXED = 10.9;
  const scene = document.createElement('canvas'); scene.width = W; scene.height = H; const sg = scene.getContext('2d');

  // the bounce on each beat: a squash on landing, a hop up, a little stretch on the way; drawn on twos
  function bounce(t, off) {
    const u = (((t - off) % BEAT) + BEAT) % BEAT / BEAT;
    const hop = -46 * Math.sin(Math.PI * u) ** 0.9;
    const k = u < 0.1 ? 0.2 * (1 - u / 0.1) : u > 0.92 ? 0.12 * (u - 0.92) / 0.08 : u < 0.4 ? -0.08 * Math.sin(Math.PI * (u - 0.1) / 0.3) : 0;
    const lean = 0.09 * Math.cos(Math.PI * ((t - off) / BEAT));        // the rubber-hose sway: left on one beat, right on the next
    return { hop: hop * 1.35, k: k * 1.3, lean };
  }
  function pose(g, x, y, b, draw) { g.save(); g.translate(x, y); g.rotate(b.lean); g.scale(1.12, 1.12); g.translate(-x, -y); draw(); g.restore(); }
  const lateOf = (t) => (t < FIXED ? LATE : 0);           // the hat stand, until it's bonked

  // ------------------------------------------------------------------ the cast (each: a body with a face, hose legs)
  function legs(g, x, y, hop, spread = 40) {
    const ground = y;                                      // the feet stay on the floor; the body lifts
    hoseLimb(g, x - spread * 0.5, y - 30 + hop, x - spread - 10, y - 10 + hop * 0.4, x - spread, ground, 12, 16);
    hoseLimb(g, x + spread * 0.5, y - 30 + hop, x + spread + 10, y - 10 + hop * 0.4, x + spread, ground, 12, 16);
  }
  function lamp(g, x, y, b) {
    legs(g, x, y, b.hop, 30);
    g.save(); squash(g, x, y - 30 + b.hop, b.k);
    g.lineWidth = 14; g.strokeStyle = P.ink; g.beginPath(); g.moveTo(x, y - 30 + b.hop); g.lineTo(x, y - 230 + b.hop); g.stroke();
    inked(g, (gg) => { gg.beginPath(); gg.moveTo(x - 70, y - 220 + b.hop); gg.lineTo(x + 70, y - 220 + b.hop); gg.lineTo(x + 44, y - 330 + b.hop); gg.lineTo(x - 44, y - 330 + b.hop); gg.closePath(); }, P.white);
    face(g, x, y - 290 + b.hop, 0.8);
    g.restore();
  }
  function clock(g, x, y, b) {
    legs(g, x, y, b.hop, 46);
    g.save(); squash(g, x, y - 30 + b.hop, b.k);
    inked(g, (gg) => { gg.beginPath(); gg.roundRect(x - 70, y - 380 + b.hop, 140, 350, 30); }, P.mid);
    inked(g, (gg) => { gg.beginPath(); gg.arc(x, y - 300 + b.hop, 56, 0, Math.PI * 2); }, P.white, 6);
    face(g, x, y - 312 + b.hop, 0.8);
    g.lineWidth = 6; g.beginPath(); g.moveTo(x, y - 180 + b.hop); g.lineTo(x + 18 * Math.sin(b.hop / 10), y - 90 + b.hop); g.stroke();   // the pendulum
    g.restore();
  }
  function hatstand(g, x, y, b, hatsUp = 0) {
    legs(g, x, y, b.hop, 36);
    g.save(); squash(g, x, y - 30 + b.hop, b.k);
    g.lineWidth = 16; g.strokeStyle = P.ink; g.beginPath(); g.moveTo(x, y - 30 + b.hop); g.lineTo(x, y - 330 + b.hop); g.stroke();
    inked(g, (gg) => { gg.beginPath(); gg.arc(x, y - 350 + b.hop, 40, 0, Math.PI * 2); }, P.white);
    face(g, x, y - 352 + b.hop, 0.62);
    // three hats on its hooks: a bowler, a top hat, and a cap with a brim (sepia: the cap is the season's, an easter egg)
    const hy = (k) => y - 300 + b.hop - hatsUp * (60 + k * 30);
    for (const [hx, kind, k] of [[-64, 'bowler', 0], [64, 'top', 1], [0, 'cap', 2]]) {
      const yy = kind === 'cap' ? hy(k) - 110 : hy(k);
      g.lineWidth = 6; g.beginPath(); g.moveTo(x, y - 260 + b.hop); g.lineTo(x + hx * 0.8, y - 280 + b.hop); g.stroke();
      if (kind === 'bowler') inked(g, (gg) => { gg.beginPath(); gg.ellipse(x + hx, yy, 40, 12, 0, 0, Math.PI * 2); gg.moveTo(x + hx - 28, yy); gg.arc(x + hx, yy, 28, Math.PI, 0); }, P.dark, 5);
      if (kind === 'top') inked(g, (gg) => { gg.beginPath(); gg.ellipse(x + hx, yy, 40, 11, 0, 0, Math.PI * 2); gg.rect(x + hx - 26, yy - 62, 52, 62); }, P.ink, 5);
      if (kind === 'cap') inked(g, (gg) => { gg.beginPath(); gg.ellipse(x + 6, yy, 38, 26, 0, Math.PI, 2 * Math.PI); gg.rect(x - 32, yy - 2, 70, 8); gg.ellipse(x + 46, yy + 2, 26, 7, 0, 0, Math.PI * 2); }, P.dark, 5);
    }
    g.restore();
  }
  function teapot(g, x, y, b) {
    legs(g, x, y, b.hop, 44);
    g.save(); squash(g, x, y - 30 + b.hop, b.k);
    inked(g, (gg) => { gg.beginPath(); gg.ellipse(x, y - 120 + b.hop, 100, 84, 0, 0, Math.PI * 2); }, P.white);
    inked(g, (gg) => { gg.beginPath(); gg.moveTo(x + 92, y - 130 + b.hop); gg.quadraticCurveTo(x + 150, y - 140 + b.hop, x + 170, y - 200 + b.hop); gg.lineTo(x + 182, y - 192 + b.hop); gg.quadraticCurveTo(x + 160, y - 112 + b.hop, x + 96, y - 96 + b.hop); gg.closePath(); }, P.white, 6);   // spout
    inked(g, (gg) => { gg.beginPath(); gg.ellipse(x, y - 200 + b.hop, 46, 14, 0, 0, Math.PI * 2); gg.moveTo(x + 10, y - 214 + b.hop); gg.arc(x, y - 214 + b.hop, 10, 0, Math.PI * 2); }, P.mid, 5);   // lid
    g.lineWidth = 10; g.beginPath(); g.arc(x - 104, y - 120 + b.hop, 36, 0.6 * Math.PI, 1.4 * Math.PI); g.stroke();   // handle
    face(g, x - 6, y - 136 + b.hop, 0.85);
    g.restore();
  }
  function chair(g, x, y, b) {
    legs(g, x, y, b.hop, 70);
    g.save(); squash(g, x, y - 30 + b.hop, b.k);
    inked(g, (gg) => { gg.beginPath(); gg.roundRect(x - 110, y - 330 + b.hop, 220, 230, 50); }, P.mid);       // back
    inked(g, (gg) => { gg.beginPath(); gg.roundRect(x - 130, y - 150 + b.hop, 260, 110, 40); }, P.dark);      // seat
    for (const s of [-1, 1]) inked(g, (gg) => { gg.beginPath(); gg.roundRect(x + s * 120 - 30, y - 220 + b.hop, 60, 160, 28); }, P.mid);   // arms
    face(g, x, y - 250 + b.hop, 0.9);
    g.restore();
  }
  function broom(g, x, y, b) {
    g.save(); squash(g, x, y + b.hop * 0.2, b.k * 0.8);
    inked(g, (gg) => { gg.beginPath(); gg.moveTo(x - 70, y); gg.lineTo(x + 70, y); gg.lineTo(x + 34, y - 110 + b.hop); gg.lineTo(x - 34, y - 110 + b.hop); gg.closePath(); }, P.paperD);   // bristles, a skirt
    for (let k = -3; k <= 3; k++) { g.lineWidth = 3; g.beginPath(); g.moveTo(x + k * 9, y - 100 + b.hop); g.lineTo(x + k * 18, y - 4); g.stroke(); }
    g.lineWidth = 16; g.strokeStyle = P.ink; g.beginPath(); g.moveTo(x, y - 110 + b.hop); g.lineTo(x, y - 380 + b.hop); g.stroke();
    inked(g, (gg) => { gg.beginPath(); gg.arc(x, y - 396 + b.hop, 38, 0, Math.PI * 2); }, P.white);
    face(g, x, y - 398 + b.hop, 0.6);
    g.restore();
  }
  // the conductor: a metronome on a podium, its arm swinging the beat; at BONK it leans over and bonks the hat stand
  function metronome(g, x, y, t) {
    const th = held(t, 2);
    inked(g, (gg) => { gg.beginPath(); gg.rect(x - 70, y - 60, 140, 60); }, P.dark);
    const bonk = seg(th, BONK - 0.35, BONK, 'in2') * (1 - seg(th, BONK + 0.15, BONK + 0.6, 'out'));
    const lean = -0.12 * bonk;
    g.save(); g.translate(x, y - 60); g.rotate(lean);
    inked(g, (gg) => { gg.beginPath(); gg.moveTo(-56, 0); gg.lineTo(56, 0); gg.lineTo(24, -260); gg.lineTo(-24, -260); gg.closePath(); }, P.white);
    face(g, 0, -150, 0.7, bonk > 0.3 ? -1 : 0);
    // the swinging arm: left-right on every beat, unless it's bonking (then it swings down hard to the left)
    // at the bonk the arm swings up and over to the hat stand's head and, being rubber, stretches to reach it
    const sw = bonk > 0.01 ? -0.58 * bonk + Math.sin(Math.PI * th / BEAT) * 0.55 * (1 - bonk) : Math.sin(Math.PI * th / BEAT) * 0.55, len = 230 + 120 * bonk;
    g.save(); g.translate(0, -40); g.rotate(sw); g.lineWidth = 9; g.strokeStyle = P.ink; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len); g.stroke();
    inked(g, (gg) => { gg.beginPath(); gg.rect(-16, -len + 60, 32, 24); }, P.mid, 4); g.restore();
    g.restore();
  }

  // ------------------------------------------------------------------ the room and the cards
  function room(g) {
    g.fillStyle = P.paper; g.fillRect(0, 0, W, H);
    g.fillStyle = P.paperD; for (let k = 0; k < 9; k++) g.fillRect(k * 130 + 20, 560, 8, 880);   // wallpaper stripes
    g.fillStyle = P.mid; g.fillRect(0, 1440, W, H - 1440); g.fillStyle = P.dark; g.fillRect(0, 1440, W, 10);
    for (let k = 0; k < 8; k++) { g.fillStyle = P.dark; g.fillRect(0, 1500 + k * 60, W, 4); }
    // a window with curtains on the back wall
    inked(g, (gg) => { gg.beginPath(); gg.rect(380, 560, 300, 230); }, '#e9dbb8', 8);
    g.lineWidth = 6; g.beginPath(); g.moveTo(530, 560); g.lineTo(530, 790); g.moveTo(380, 675); g.lineTo(680, 675); g.stroke();
  }
  function title(g, s, x, y, size, col = P.ink) { g.save(); g.font = `700 ${size}px Fraunces`; g.textAlign = 'center'; g.fillStyle = P.white; g.fillText(s, x + 4, y + 5); g.fillStyle = col; g.fillText(s, x, y); g.restore(); }

  LAB.film({
    draw(g, t0) {
      const t = LAB.loopT(t0, LOOP), th = held(t, 2), s = sg;
      s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, W, H);
      room(s);
      const B0 = bounce(th, 0), BH = bounce(th, lateOf(th));
      const hatsUp = seg(th, BONK, BONK + 0.12, 'out') * (1 - seg(th, BONK + 0.25, BONK + 0.6, 'bounce'));
      pose(s, 180, 1040, B0, () => lamp(s, 180, 1040, B0)); pose(s, 440, 1040, B0, () => clock(s, 440, 1040, B0)); pose(s, 700, 1040, BH, () => hatstand(s, 700, 1040, BH, hatsUp));
      pose(s, 200, 1440, B0, () => teapot(s, 200, 1440, B0)); pose(s, 520, 1440, B0, () => chair(s, 520, 1440, B0)); pose(s, 800, 1440, B0, () => broom(s, 800, 1440, B0));
      metronome(s, 872, 990, th);                                      // podium and body inside the right safe edge (950)
      if (th >= BONK && th < BONK + 0.4) { s.save(); s.font = '700 86px Fraunces'; s.textAlign = 'center'; s.fillStyle = P.ink; s.fillText('BONK!', 430, 520); s.restore(); }
      // the cards: the challenge and a stopwatch that stops at the bonk; then how fast you were
      if (t < BONK) { title(s, 'ONE OF THEM IS', W / 2, 340, 84); title(s, 'OFF THE BEAT.', W / 2, 430, 92); }
      else { title(s, 'THE HAT STAND!', W / 2, 360, 92); }
      const secs = Math.min(t, BONK);
      s.save(); s.font = '700 54px Fraunces'; s.textAlign = 'center'; s.fillStyle = P.dark;
      s.font = '700 66px Fraunces'; s.fillStyle = P.white; s.fillText(t < BONK ? `YOUR TIME  0:${String(Math.floor(secs)).padStart(2, '0')}` : 'How fast did you find it?', W / 2, 1515); s.restore();   // on the floor, clear of the cast
      s.restore();
      film(g, t, scene);
      LAB.safeOverlay(g);
    },
  });
})();
