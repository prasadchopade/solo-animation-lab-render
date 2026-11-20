// You're the Princess (lab clip 06): Stockton's "The Lady, or the Tiger?" (1882, public domain) as YOUR pick, in
// backlit cut-paper puppets. Two doors in an arena: behind one a tiger, behind the other the woman he'll marry instead
// of you. You know which is which. He looks up at you. Your hand rises... which door? Black card, lace cut into it,
// brass split pins at every joint, rods to the hands; moved on twos. Pure function of t.
(() => {
  const { W, H, seg, clamp, lerp, E, rnd, rs, key, held } = LAB;
  const { ig, screen, begin, lace, pin, part, rod, show } = SHADOW;
  C.fonts = ['400 96px Fell'];
  const N = 2;                                            // on twos
  const DOOR = [[96, 336], [714, 944]], ARCH_TOP = 720, FLOOR_Y = 1270, GAP = [430, 630];
  const LIFT_L = 3.0, LIFT_R = 3.5, LOOK = 6.4, HAND = 9.4, ASK = 12.8;

  // ------------------------------------------------------------------ the arena: a wall of arches, two great doors
  function arena(t) {
    const g = ig;
    // the wall: a band of card from the arch tops to the floor, with the two doorways cut out of it
    g.beginPath(); g.rect(0, 640, GAP[0], FLOOR_Y - 640); g.rect(GAP[1], 640, W - GAP[1], FLOOR_Y - 640);
    for (const [x0, x1] of DOOR) { const cx = (x0 + x1) / 2, r = (x1 - x0) / 2; g.moveTo(x0, FLOOR_Y); g.lineTo(x0, ARCH_TOP + r); g.arc(cx, ARCH_TOP + r, r, Math.PI, 0); g.lineTo(x1, FLOOR_Y); g.closePath(); }
    g.fill('evenodd');
    // a frieze of small arches along the top of the wall, and lace in the piers
    for (const [x0, x1] of [[0, GAP[0]], [GAP[1], W]]) { g.fillRect(x0, 610, x1 - x0, 34); for (let x = x0 + 8; x < x1 - 20; x += 52) g.fillRect(x, 590, 26, 24); }   // battlements
    lace((gg) => { gg.beginPath(); gg.rect(340, 760, 86, 460); gg.rect(634, 760, 76, 460); }, 'diamonds', 'pier', { x0: 330, y0: 760, x1: 720, y1: 1220, cell: 30, r: 7 });
    // the floor, and the crowd's heads along the bottom
    g.fillRect(0, FLOOR_Y, W, 34);
    for (let k = 0; k < 13; k++) {
      const x = -20 + k * 92 + rs('crowd', k) * 12, y = 1420 + rs('cy', k) * 10, bob = Math.round(Math.sin((held(t, N) + k * 0.7) * 2.2) * 2);
      g.beginPath(); g.arc(x, y + bob, 40, 0, Math.PI * 2); g.fill(); g.fillRect(x - 60, y + 30 + bob, 120, 300);
      if (k % 3 === 0) { g.beginPath(); g.moveTo(x - 46, y - 18 + bob); g.lineTo(x, y - 70 + bob); g.lineTo(x + 46, y - 18 + bob); g.fill(); }
      else if (k % 3 === 1) { g.beginPath(); g.ellipse(x, y - 30 + bob, 50, 18, 0, 0, Math.PI * 2); g.fill(); }
    }
  }
  // the door panels: lace-cut card that the puppeteer lifts out, showing you (only you) what waits behind each door
  function doors(t) {
    for (const [i, lift] of [[0, LIFT_L], [1, LIFT_R]]) {
      const [x0, x1] = DOOR[i], r = (x1 - x0) / 2, cx = (x0 + x1) / 2, up = E.inOut(seg(held(t, N), lift, lift + 0.7)) * 760;
      const path = (gg) => { gg.beginPath(); gg.moveTo(x0 + 8, FLOOR_Y - up); gg.lineTo(x0 + 8, ARCH_TOP + r - up); gg.arc(cx, ARCH_TOP + r - up, r - 8, Math.PI, 0); gg.lineTo(x1 - 8, FLOOR_Y - up); gg.closePath(); };
      ig.save(); ig.beginPath(); ig.rect(x0 - 10, 640, x1 - x0 + 20, FLOOR_Y - 640); ig.clip();
      path(ig); ig.fill();
      lace(path, i ? 'stars' : 'dots', 'door' + i, { x0, y0: ARCH_TOP - up, x1, y1: FLOOR_Y - up, cell: 40, r: 9 });
      // two iron rings, and a rod going up out of frame from the panel's top
      ig.restore();
      if (up > 2 && up < 740) rod(cx, ARCH_TOP + 10 - up, cx, 0);
    }
  }

  // ------------------------------------------------------------------ the tiger, pacing behind the left door (in profile)
  function tiger(t) {
    const th = held(t, N), [x0, x1] = DOOR[0], walk = Math.sin(th * 4.2), dir = Math.sin(th * 0.9) > 0 ? 1 : -1;
    const cx = (x0 + x1) / 2 + Math.sin(th * 0.9) * 30, by = FLOOR_Y - 98;
    ig.save(); ig.beginPath(); ig.rect(x0, ARCH_TOP, x1 - x0, FLOOR_Y - ARCH_TOP); ig.clip();
    ig.translate(cx, by); ig.scale(dir * 0.82, 0.82);
    // legs, hinged at the shoulder and hip, swinging opposite
    for (const [lx, ph] of [[-70, 0], [-46, Math.PI], [52, Math.PI], [76, 0]]) part(lx, 20, Math.sin(th * 4.2 + ph) * 0.35, (g) => { g.beginPath(); g.roundRect(-11, 0, 22, 92, 10); g.fill(); g.beginPath(); g.ellipse(4, 92, 16, 9, 0, 0, Math.PI * 2); g.fill(); });
    // body, head and jaw, ears; a tail that swishes
    ig.beginPath(); ig.ellipse(0, 0, 112, 46, 0, 0, Math.PI * 2); ig.fill();
    ig.beginPath(); ig.ellipse(112, -24 + walk * 2, 46, 40, 0, 0, Math.PI * 2); ig.fill();
    ig.beginPath(); ig.moveTo(140, -6); ig.lineTo(178, 4); ig.lineTo(140, 22); ig.fill();
    for (const ex of [96, 122]) { ig.beginPath(); ig.moveTo(ex - 12, -54); ig.lineTo(ex, -80); ig.lineTo(ex + 10, -54); ig.fill(); }
    part(-108, -10, -0.6 + Math.sin(th * 2.6) * 0.4, (g) => { g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-50, -30, -70, -90); g.stroke(); });
    // stripes: slits cut through the card; an eye
    ig.save(); ig.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 7; k++) { const sx = -80 + k * 27; ig.beginPath(); ig.moveTo(sx, -44); ig.quadraticCurveTo(sx + 10, -18, sx - 4, 6); ig.lineTo(sx + 2, 6); ig.quadraticCurveTo(sx + 16, -18, sx + 6, -44); ig.fill(); }
    ig.beginPath(); ig.ellipse(128, -34, 7, 4, -0.3, 0, Math.PI * 2); ig.fill();
    ig.restore();
    pin(-70, 20); pin(76, 20); pin(-108, -10);
    ig.restore();
  }
  // the bride, waiting behind the right door: a long veil, flowers, the dress in lace
  function bride(t) {
    const th = held(t, N), [x0, x1] = DOOR[1], cx = (x0 + x1) / 2 + 10, sway = Math.sin(th * 1.4) * 0.03;
    ig.save(); ig.beginPath(); ig.rect(x0, ARCH_TOP, x1 - x0, FLOOR_Y - ARCH_TOP); ig.clip();
    ig.translate(cx, FLOOR_Y); ig.rotate(sway);
    const dress = (g) => { g.beginPath(); g.moveTo(-26, -300); g.lineTo(26, -300); g.lineTo(96, 0); g.lineTo(-96, 0); g.closePath(); };
    dress(ig); ig.fill();
    ig.beginPath(); ig.arc(0, -340, 34, 0, Math.PI * 2); ig.fill();
    ig.beginPath(); ig.moveTo(-26, -350); ig.quadraticCurveTo(-30, -380, 10, -378); ig.lineTo(0, -320); ig.closePath(); ig.fill();
    lace(dress, 'stars', 'dress', { x0: -96, y0: -280, x1: 96, y1: -20, cell: 30, r: 7 });
    // the veil: a long sheet of lace hanging from her head down her back
    const veil = (g) => { g.beginPath(); g.moveTo(-10, -370); g.quadraticCurveTo(-90, -260, -110 + Math.sin(th * 1.4) * 8, -40); g.lineTo(-70, -30); g.quadraticCurveTo(-50, -240, 10, -350); g.closePath(); };
    veil(ig); ig.fill(); lace(veil, 'dots', 'veil', { x0: -120, y0: -380, x1: 20, y1: -20, cell: 18, r: 5 });
    // the bouquet, held in front
    ig.beginPath(); ig.moveTo(30, -230); ig.lineTo(84, -190); ig.lineWidth = 12; ig.stroke();
    for (let k = 0; k < 6; k++) { ig.beginPath(); ig.arc(84 + Math.cos(k) * 16, -196 + Math.sin(k * 1.7) * 14, 12, 0, Math.PI * 2); ig.fill(); }
    pin(30, -230);
    ig.restore();
  }

  // ------------------------------------------------------------------ him: in the arena between the doors, in profile facing right
  function man(t) {
    const th = held(t, N), x = 522, y = FLOOR_Y;
    const look = E.inOut(seg(th, LOOK, LOOK + 0.6)), breathe = Math.sin(th * 1.6) * 2;
    ig.save(); ig.translate(x, y);
    // legs
    for (const [lx, a] of [[-14, 0.05], [16, -0.08]]) part(lx, -210, a, (g) => { g.beginPath(); g.roundRect(-13, 0, 26, 200, 10); g.fill(); g.beginPath(); g.moveTo(-14, 196); g.lineTo(40, 196); g.lineTo(20, 210); g.lineTo(-14, 210); g.fill(); });
    // the tunic, belted, with a lace hem
    const tunic = (g) => { g.beginPath(); g.moveTo(-40, -400 + breathe); g.lineTo(40, -400 + breathe); g.lineTo(62, -190); g.lineTo(-62, -190); g.closePath(); };
    tunic(ig); ig.fill(); lace(tunic, 'diamonds', 'tunic', { x0: -62, y0: -260, x1: 62, y1: -195, cell: 22, r: 6 });
    // the far arm hangs; the near arm too, a little forward
    part(-30, -390 + breathe, 0.12, (g) => { g.beginPath(); g.roundRect(-11, 0, 22, 170, 10); g.fill(); });
    part(30, -390 + breathe, -0.1 - 0.1 * look, (g) => { g.beginPath(); g.roundRect(-11, 0, 22, 100, 10); g.fill(); part(0, 96, -0.25, (h) => { h.beginPath(); h.roundRect(-10, 0, 20, 86, 9); h.fill(); h.beginPath(); h.arc(2, 92, 15, 0, Math.PI * 2); h.fill(); }); });
    // the head, turning up to the royal box (to you) at LOOK: a nose, a curl of hair, a chin
    part(4, -404 + breathe, -0.55 * look, (g) => {
      g.beginPath(); g.roundRect(-10, -40, 20, 44, 6); g.fill();                  // neck
      g.beginPath(); g.ellipse(0, -84, 40, 48, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(34, -96); g.lineTo(56, -72); g.lineTo(34, -64); g.fill();   // the nose
      g.beginPath(); g.moveTo(-40, -110); g.quadraticCurveTo(-10, -150, 36, -118); g.quadraticCurveTo(0, -128, -40, -96); g.fill();   // hair
      g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(18, -92, 7, 4, 0, 0, Math.PI * 2); g.fill(); g.restore();   // the eye, cut
    });
    pin(-30, -390 + breathe); pin(30, -390 + breathe); pin(4, -404 + breathe, 6); pin(-14, -210); pin(16, -210);
    ig.restore();
  }

  // ------------------------------------------------------------------ your hand: the princess's arm, from the bottom right, deciding
  function hand(t) {
    if (t < HAND) return;
    const th = held(t, N), up = E.out(seg(th, HAND, HAND + 0.9)), sway = key(th, [[HAND + 0.9, 0], [HAND + 1.7, -0.22, 'inOut'], [HAND + 2.5, 0.2, 'inOut'], [ASK, -0.06, 'inOut'], [ASK + 0.6, 0.02, 'inOut']]);
    // the fingertip ends at (640, 545): in the lit sky, under the words and over the battlements; the arm slides in along its own line
    const out = (1 - up) * 440, sx = 927 + out * 0.990, sy = 505 - out * 0.139;
    ig.save(); ig.translate(sx, sy); ig.rotate(-1.71 + sway * 0.5);
    const sleeve = (g) => { g.beginPath(); g.moveTo(-70, 520); g.lineTo(-48, 0); g.quadraticCurveTo(0, -20, 48, 0); g.lineTo(70, 520); g.closePath(); };
    sleeve(ig); ig.fill(); lace(sleeve, 'stars', 'sleeve', { x0: -70, y0: 10, x1: 70, y1: 300, cell: 28, r: 7 });
    for (const by of [-10, -30]) { ig.save(); ig.globalCompositeOperation = 'destination-out'; ig.beginPath(); ig.ellipse(0, by, 46, 7, 0, 0, Math.PI * 2); ig.fill(); ig.restore(); ig.beginPath(); ig.ellipse(0, by, 44, 5, 0, 0, Math.PI * 2); ig.lineWidth = 4; ig.stroke(); }   // bangles
    ig.beginPath(); ig.roundRect(-38, -150, 76, 110, 30); ig.fill();                 // the hand
    ig.beginPath(); ig.roundRect(-12, -290, 24, 160, 12); ig.fill();                 // the pointing finger
    ig.beginPath(); ig.roundRect(10, -170, 22, 60, 11); ig.fill(); ig.beginPath(); ig.roundRect(-34, -150, 22, 50, 11); ig.fill();
    pin(0, -40, 7); pin(0, -150, 6);
    ig.restore();
    rod(sx + 160, sy - 52, W, sy - 90);
  }

  // ------------------------------------------------------------------ title cards: black card letters on the screen
  function card(lines, y0, sizes, alpha) {
    if (alpha <= 0) return;
    ig.save(); ig.globalAlpha = alpha; ig.textAlign = 'center'; ig.textBaseline = 'alphabetic';
    let y = y0; for (let i = 0; i < lines.length; i++) { ig.font = `400 ${sizes[i]}px Fell`; ig.fillText(lines[i], W / 2, y); y += sizes[i] * 0.95 + 14; }
    ig.restore();
  }
  function cards(t) {
    const a = (t0, t1) => seg(t, t0, t0 + 0.25) * (1 - seg(t, t1 - 0.25, t1));
    card(['TWO DOORS.', 'One hides a tiger.', 'One hides the woman he’ll marry.'], 330, [112, 52, 52], t < 0.01 ? 1 : a(-1, LIFT_L));
    card(['You love him.', 'And you know which is which.'], 360, [96, 54], a(LIFT_L, LOOK));
    card(['He’s looking at you.'], 400, [92], a(LOOK, HAND));
    card(['Point right: he lives,', 'and marries her.', 'Point left: he’s no one’s.'], 318, [62, 62, 62], a(HAND, ASK));
    card(['WHICH DOOR?'], 410, [120], seg(t, ASK, ASK + 0.3));
  }

  LAB.film({
    draw(g, t) {
      begin();
      screen(g, t);
      tiger(t); bride(t);
      arena(t); doors(t); man(t);
      cards(t);
      hand(t);
      show(g);
      LAB.safeOverlay(g);
    },
  });
})();
