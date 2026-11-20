// Which One Goes First? (lab clip 10): an animated neon sign. An orange cat sits on a shelf with a paw on a mug and
// stares at you: WHICH ONE GOES FIRST? 1 the mug, 2 the cactus, 3 the vase. He taps the mug and it won't budge. It's
// glued, and so are the others (the glue tube has been lying on the floor since frame 0). He glares, stomps, the
// shelf gives way, and the glue takes all three down with it. The sign shorts out; two eyes in the dark; ALL OF THEM.
// A 12 s loop: at the end the sign powers down and starts its cycle again, as real signs do.
// Everything moves the way signs move, by switching from one pose to the next, never by tweening.
(() => {
  const { frameOf } = LAB;
  const { sign, flick, on, off, tired, sparks } = NEON;
  C.fonts = [];
  const DUR = 12;
  // the beats (s)
  const TAPS = [1.5, 1.8, 2.1], PUSH = 2.45, SNAP = 2.75, LOOK = [3.0, 3.35, 3.7, 4.05], GLARE = 4.45, CROUCH = 4.95,
    JUMP = 5.15, STOMP = 5.45, TILT1 = 5.6, TILT2 = 5.85, FALL1 = 6.1, FALL2 = 6.28, CRASH = 6.45, EYES = 6.95,
    BLINK = 7.3, ALL = 7.55, OFTHEM = 7.85, LIT = 8.2, DOWN = 11.3;
  const SY = 1100, FLOOR = 1420, SC = 1.25;                // the shelf's top, the floor line, the cast's scale
  const CAT = 190, MUG = 400, CACT = 605, VASE = 805;      // where each sits on the shelf
  const PIV = [700, SY + 26];                              // the right bracket: the shelf swings on it

  // brightness over time: lit from frame 0 until the short; then lit from t0 to t1
  const crashK = (t) => flick(t, CRASH, [1, 0.35, 0.95, 0.45, 0.15, 0]);
  const pre = (t) => (t < CRASH ? 1 : crashK(t));
  const lit = (t, t0, t1) => (t < t1 ? on(t, t0) : off(t, t1));

  // ------------------------------------------------------------------ the cast (local units; base centre at 0, 0)
  // the cat, from the front, sitting. P: paw 'mug' | 'tap' | 'down' | 'dangle'; eyes 'open' | 'narrow' | 'happy' |
  // 'shut'; gaze [x, y]; crouch; tail 0 | 1; eyesOnly (just the eyes, for the dark)
  function cat(S, k, P) {
    const sq = P.crouch ? 0.84 : P.paw === 'dangle' ? 1.06 : 1, Y = (v) => v * sq;
    if (!P.eyesOnly) {
      S.tube([[-44, Y(-142)], [-64, Y(-100)], [-74, Y(-50)], [-66, Y(-8)], [-36, 2], [36, 2], [66, Y(-8)], [74, Y(-50)], [64, Y(-100)], [44, Y(-142)]], 'orange', k, 10, { smooth: true });
      S.tube([[-52, Y(-226)], [-66, Y(-196)], [-62, Y(-160)], [-40, Y(-140)], [0, Y(-134)], [40, Y(-140)], [62, Y(-160)], [66, Y(-196)], [52, Y(-226)]], 'orange', k, 10, { smooth: true });
      S.tube([[-52, Y(-226)], [-56, Y(-268)], [-22, Y(-238)], [22, Y(-238)], [56, Y(-268)], [52, Y(-226)]], 'orange', k, 10);
      S.tube([[-7, Y(-163)], [7, Y(-163)], [0, Y(-154)]], 'pink', k, 6, { closed: true });                       // nose
      S.tube([[-13, Y(-147)], [-6, Y(-142)], [0, Y(-149)], [6, Y(-142)], [13, Y(-147)]], 'pink', k, 6, { smooth: true });
      for (const sx of [-1, 1]) {                                                                                 // whiskers
        S.tube([[sx * 34, Y(-158)], [sx * 86, Y(-166)]], 'white', k * 0.8, 4); S.tube([[sx * 34, Y(-150)], [sx * 84, Y(-140)]], 'white', k * 0.8, 4);
      }
      const leg = (sx) => { S.tube([[sx * 18, Y(-84)], [sx * 20, -3]], 'orange', k, 9); S.tube([[sx * 20 - 12, 0], [sx * 20, -8], [sx * 20 + 12, 0]], 'orange', k, 8, { smooth: true }); };
      if (P.paw === 'dangle') for (const sx of [-1, 1]) S.tube([[sx * 18, Y(-84)], [sx * 24, 16]], 'orange', k, 9);
      else {
        leg(-1);
        if (P.paw === 'down') leg(1);
        else {                                                                                                    // the paw on the mug
          const ex = P.paw === 'tap' ? 142 : 126;
          S.tube([[60, Y(-118)], [96, Y(-124)], [ex, Y(-108)]], 'orange', k, 9, { smooth: true });
          S.tube([[ex - 6, Y(-119)], [ex + 7, Y(-108)], [ex - 6, Y(-97)]], 'orange', k, 8, { smooth: true });
        }
      }
      S.tube(P.tail ? [[-62, -6], [-100, -14], [-114, -50], [-102, -86], [-82, -98]] : [[-62, -6], [-98, -6], [-118, -28], [-114, -64], [-96, -80]], 'orange', k, 9, { smooth: true });
    }
    for (const sx of [-1, 1]) {                                                                                   // the eyes
      S.push(sx * 28, Y(-192));
      if (P.eyes === 'open') {
        const [gx, gy] = P.gaze || [0, 0];
        S.tube([[-15, 0], [-7, -8], [7, -8], [15, 0], [7, 8], [-7, 8]], 'green', k, 6, { smooth: true, closed: true });
        S.tube([[gx * 6, -5 + gy * 3], [gx * 6, 5 + gy * 3]], 'green', k, 6);
      } else if (P.eyes === 'narrow') S.tube(sx < 0 ? [[-15, -5], [15, 3]] : [[-15, 3], [15, -5]], 'green', k, 6);
      else if (P.eyes === 'happy') S.tube([[-13, 4], [0, -6], [13, 4]], 'green', k, 6, { smooth: true });
      else S.tube([[-14, 0], [14, 0]], 'green', k, 6);
      S.pop();
    }
  }
  // 1, the mug: cyan with a pink heart and steam that alternates between two shapes; tilt rocks it on its far corner
  function mug(S, t, k, tilt, broken) {
    S.push(MUG, SY, 0, SC);
    if (tilt) S.push(38, 0, tilt).push(-38, 0);
    S.tube([[-50, -118], [50, -118], [50, -12], [38, 0], [-38, 0], [-50, -12]], 'cyan', k, 10, { closed: true });
    if (!broken) S.tube([[50, -96], [74, -96], [86, -82], [86, -46], [74, -32], [50, -32]], 'cyan', k, 10, { smooth: true });
    else { S.tube([[50, -96], [66, -96]], 'cyan', k, 10); S.tube([[58, -2], [72, -16], [88, -6]], 'cyan', k, 9, { smooth: true }); }   // the handle, snapped off
    S.tube([[0, -46], [-16, -60], [-18, -72], [-10, -79], [0, -71], [10, -79], [18, -72], [16, -60]], 'pink', k, 6, { smooth: true, closed: true });
    if (broken) S.tube([[-50, -90], [-26, -76], [-30, -52], [-4, -38], [-12, -10]], 'white', k, 5);
    else if (t < TILT1) {
      const ph = Math.floor(t / 0.3) % 2;
      for (const dx of [-14, 14]) S.tube([[dx - 4, -134], [dx + (ph ? -4 : 4), -150], [dx - 4, -166], [dx + (ph ? -4 : 4), -182]], 'white', k * 0.85, 5, { smooth: true });
    }
    if (tilt) S.pop().pop();
    S.pop();
  }
  // 2, the cactus in its pot (it leans once the pot cracks)
  function cactus(S, t, k, broken) {
    S.push(CACT, SY, 0, SC);
    S.tube([[-62, -86], [62, -86], [62, -70], [-62, -70]], 'red', k, 8, { closed: true });
    S.tube([[-54, -70], [-44, 0], [44, 0], [54, -70]], 'red', k, 8);
    if (broken) S.tube([[10, -70], [0, -48], [14, -30], [4, -2]], 'white', k, 5);
    S.push(0, -86, broken ? -0.32 : 0);
    S.tube([[-20, 0], [-20, -110], [-12, -126], [0, -132], [12, -126], [20, -110], [20, 0]], 'green', k, 9, { smooth: true });
    S.tube([[-20, -34], [-44, -34], [-52, -44], [-52, -82], [-44, -90], [-36, -82], [-36, -52], [-20, -52]], 'green', k, 8, { smooth: true });
    S.tube([[20, -54], [42, -54], [50, -64], [50, -92], [42, -100], [34, -92], [34, -70], [20, -70]], 'green', k, 8, { smooth: true });
    S.pop();
    S.pop();
  }
  // 3, the vase with a flower (the flower's tube is tired, and droops once the vase cracks)
  function vase(S, t, k, broken) {
    S.push(VASE, SY, 0, SC);
    S.tube([[-18, -150], [-14, -128], [-38, -98], [-48, -56], [-40, -16], [-22, 0], [22, 0], [40, -16], [48, -56], [38, -98], [14, -128], [18, -150]], 'pink', k, 10, { smooth: true });
    S.tube([[-21, -150], [21, -150]], 'pink', k, 10);
    if (broken) S.tube([[-46, -64], [-22, -72], [-26, -46], [4, -52], [0, -26], [28, -32]], 'white', k, 5);
    S.push(0, -150, broken ? 0.9 : 0);
    S.tube([[0, 0], [3, -42], [0, -76]], 'green', k, 7, { smooth: true });
    S.tube([[3, -32], [22, -42], [32, -60], [14, -56], [3, -38]], 'green', k, 7, { smooth: true, closed: true });
    const kf = k * tired(t, 'flower', broken ? 0.1 : 0.02), ring = (r, n, f) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, rr = f(a); return [Math.cos(a) * rr, -100 + Math.sin(a) * rr]; });
    S.tube(ring(22, 24, (a) => 22 + 8 * Math.cos(6 * a)), 'yellow', kf, 7, { smooth: true, closed: true });
    S.tube(ring(7, 10, () => 7), 'yellow', kf, 6, { smooth: true, closed: true });
    S.pop();
    S.pop();
  }
  // glue oozing round the foot of an object (world units, on the shelf's top)
  const ooze = (S, x, k) => S.tube([[x - 46, SY - 2], [x - 34, SY + 5], [x - 22, SY - 1], [x - 10, SY + 6], [x + 2, SY - 1], [x + 14, SY + 5], [x + 26, SY - 1], [x + 40, SY + 5]], 'white', k, 5, { smooth: true });
  // the shelf's wall brackets: whole, or snapped and hanging
  function bracket(S, x, k, broken) {
    if (!broken) { S.tube([[x - 34, SY + 26], [x + 34, SY + 26], [x, SY + 92]], 'violet', k, 9, { closed: true }); return; }
    S.tube([[x - 34, SY + 26], [x - 4, SY + 70]], 'violet', k, 9);
    S.tube([[x + 34, SY + 26], [x + 8, SY + 54], [x + 22, SY + 82]], 'violet', k, 9);
  }
  // the glue tube on the floor: the plant. kt lights its label
  function glueTube(S, k, kt) {
    S.push(850, FLOOR - 4, 0, 1.3);
    S.tube([[52, -36], [-38, -36], [-50, -28], [-78, -21], [-78, -15], [-50, -8], [-38, 0], [52, 0]], 'white', k, 6);
    S.tube([[52, -40], [52, 4]], 'white', k, 6);
    S.tube([[-86, -13], [-89, -5], [-84, -1], [-80, -6]], 'white', k * 0.8, 5, { smooth: true, closed: true });
    S.text('GLUE', 6, -28, 20, 'white', kt, { w: 3.4, block: false });
    S.pop();
  }

  // ------------------------------------------------------------------ the sign's poses
  // the shelf: at rest; swinging on the right bracket; falling; lying on the floor, its far end on the glue tube
  function shelfPose(S, t) {
    if (t < TILT1) return 0;
    if (t < CRASH) {
      const [rot, drop] = t < TILT2 ? [-0.21, 0] : t < FALL1 ? [-0.47, 0] : t < FALL2 ? [-0.3, 112] : [-0.12, 220];
      S.push(PIV[0], PIV[1] + drop, rot).push(-PIV[0], -PIV[1]); return 2;
    }
    S.push(70, FLOOR, -0.065).push(-70, -(SY + 26)); return 2;
  }
  // the cat: on the shelf (in the shelf's pose) or in the air (in the sign's own frame), with its brightness
  function catPose(t) {
    if (t < GLARE) {
      const tap = TAPS.some((a) => t >= a && t < a + 0.15) || (t >= PUSH && t < SNAP), look = t >= LOOK[0];
      const gaze = t >= PUSH && t < SNAP ? [1, 0.6] : !look ? [0, 0] : t < LOOK[1] ? [0.6, 0.8] : t < LOOK[2] ? [0.9, 0.5] : t < LOOK[3] ? [1, 0.3] : [1, 1];
      return { onShelf: true, P: { paw: look ? 'down' : tap ? 'tap' : 'mug', eyes: 'open', gaze } };
    }
    if (t < CROUCH) return { onShelf: true, P: { paw: 'down', eyes: 'narrow', tail: t >= GLARE + 0.2 && t < GLARE + 0.35 ? 1 : 0 } };
    if (t < JUMP) return { onShelf: true, P: { paw: 'down', eyes: 'narrow', crouch: true } };
    if (t < STOMP) return { at: [CAT, SY - 150], P: { paw: 'dangle', eyes: 'narrow' } };
    if (t < TILT2) return { onShelf: true, P: { paw: 'down', eyes: 'narrow', crouch: true } };
    if (t < FALL1) return { at: [175, 905], P: { paw: 'dangle', eyes: 'open', gaze: [0, -0.8] } };
    if (t < FALL2) return { at: [182, 1000], P: { paw: 'dangle', eyes: 'open', gaze: [0, 0.8] } };
    if (t < CRASH) return { at: [186, 1130], P: { paw: 'dangle', eyes: 'shut' } };
    if (t < EYES) return { onShelf: true, k: crashK(t), P: { paw: 'down', eyes: 'shut' } };                       // landed in the wreck
    if (t < LIT) return { onShelf: true, k: on(t, EYES), P: { eyes: t >= BLINK && t < BLINK + 0.12 ? 'shut' : 'open', eyesOnly: true } };
    return { onShelf: true, k: lit(t, LIT, DOWN), P: { paw: 'down', eyes: 'happy', tail: t >= 9 && Math.floor((t - 9) / 0.5) % 2 === 0 ? 1 : 0 } };
  }

  LAB.film({
    draw(g, t0) {
      const t = LAB.loopT(t0, DUR), S = sign(), kp = pre(t);
      // the question, the numbers and the brackets: lit until the short
      S.text('WHICH ONE', 505, 320, 92, 'pink', (i) => kp * (i === 8 ? tired(t, 'E', 0.07) : 1));
      S.text('GOES FIRST?', 505, 440, 92, 'pink', kp);
      const kNum = t < TILT1 ? 1 : flick(t, TILT1, [0.4, 0.8, 0.2, 0]);          // the numbers short out as the shelf tips
      S.text('1', MUG, 1186, 90, 'white', kNum); S.text('2', CACT, 1186, 90, 'white', kNum); S.text('3', VASE, 1186, 90, 'white', kNum);
      bracket(S, 250, kp, t >= STOMP); bracket(S, 700, kp, t >= FALL1);
      sparks(S, 250, SY + 46, t, STOMP, 'spL'); sparks(S, 700, SY + 46, t, FALL1, 'spR');
      sparks(S, 300, FLOOR - 30, t, CRASH, 'spC1', 9, 0.35); sparks(S, 640, FLOOR - 50, t, CRASH, 'spC2', 9, 0.35);
      // the answer
      S.text('ALL', 505, 330, 230, 'pink', lit(t, ALL, DOWN + 0.15), { w: 17 });
      S.text('OF THEM.', 505, 600, 100, 'pink', t < DOWN + 0.15 ? (flick(t, OFTHEM, [0.5, 0.85, 1]) ?? 0) : off(t, DOWN + 0.15), { w: 10 });
      // the floor and the glue tube, which flares when the cat finds it
      const kFloor = t < CRASH ? 0.5 : t < LIT ? 0.5 * crashK(t) : 0.5 * lit(t, LIT, DOWN + 0.3);
      S.tube([[60, FLOOR], [940, FLOOR]], 'violet', kFloor, 7);
      const kGlue = t < LOOK[3] ? 0.55 : t < CRASH ? flick(t, LOOK[3], [0.2, 0.9, 0.4, 1]) : t < LIT ? crashK(t) : lit(t, LIT, DOWN + 0.3);
      glueTube(S, kGlue, kGlue);
      // the shelf, its three things and their glue, in the shelf's pose
      const kShelf = t < CRASH ? 1 : t < LIT ? crashK(t) : lit(t, LIT, DOWN), broken = t >= CRASH;
      const n = shelfPose(S, t);
      S.tube([[70, SY], [930, SY], [930, SY + 26], [70, SY + 26]], 'violet', kShelf, 10, { closed: true });
      mug(S, t, kShelf, t >= PUSH && t < SNAP ? 0.22 : 0, broken); cactus(S, t, kShelf, broken); vase(S, t, kShelf, broken);
      ooze(S, MUG, kShelf * (broken ? 0.8 : on(t, PUSH) * 0.8)); ooze(S, CACT, kShelf * (broken ? 0.8 : on(t, LOOK[1]) * 0.8)); ooze(S, VASE, kShelf * (broken ? 0.8 : on(t, LOOK[2]) * 0.8));
      if (t >= PUSH && t < SNAP) for (let i = 0; i < 3; i++) S.tube([[355 + i * 9, 1080 + i * 3], [348 + i * 15, SY]], 'white', 0.9, 4);   // strands of glue
      const c = catPose(t);
      if (c.onShelf) { S.push(CAT, SY, 0, SC); cat(S, c.k ?? kShelf, c.P); S.pop(); }
      for (let i = 0; i < n; i++) S.pop();
      if (c.at) { S.push(c.at[0], c.at[1], 0, SC); cat(S, c.k ?? 1, c.P); S.pop(); }
      S.flush(g);
      LAB.safeOverlay(g);
    },
  });
})();
