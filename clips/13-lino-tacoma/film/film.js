// A lab clip: draw(g, t) paints frame t, a pure function of t (no Math.random, no timers, nothing kept between frames).
(() => {
  const { W, H, SAFE, key, held } = LAB;
  LAB.film({
    draw(g, t) {
      g.fillStyle = '#f2ead8'; g.fillRect(0, 0, W, H);
      const th = held(t, 2);                       // on twos
      const x = key(th, [[0, 200], [1.2, 760, 'back'], [2.4, 200, 'overshoot']]);
      g.fillStyle = '#d23c2a'; g.beginPath(); g.arc(x, 900, 90, 0, Math.PI * 2); g.fill();
      LAB.safeOverlay(g);
    },
  });
})();
