/* Paper-collage kit: torn paper, ransom letters, tape, marker scribbles, halftone photos, paper texture.
   Everything is procedural and seeded, so every render of a frame is identical.
   Pieces are built as <div class="pc"> (GSAP moves this) > <div class="boil"> (stop-motion jitter) > content. */
(function () {
  const rng = seed => { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // Jagged clip-path for a w x h sheet; edges is any of 't','r','b','l' (torn sides), amp = tear depth in px
  function torn(w, h, seed, amp = 7, step = 14, edges = 'trbl') {
    const r = rng(seed), j = e => edges.includes(e) ? r() * amp : 0, p = [];
    for (let x = 0; x < w; x += step) p.push([x, j('t')]);
    for (let y = 0; y < h; y += step) p.push([w - j('r'), y]);
    for (let x = w; x > 0; x -= step) p.push([x, h - j('b')]);
    for (let y = h; y > 0; y -= step) p.push([j('l'), y]);
    return 'polygon(' + p.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',') + ')';
  }

  // A torn paper piece. o: {x, y, w, h, rot, color, seed, html, cls, edges, amp, z, shadow, pad, id}
  function piece(o) {
    const { x = 0, y = 0, w, h, rot = 0, color = '#fbf8f0', seed = 1, html = '', cls = '', edges = 'trbl', amp = 7, z = 1, shadow = true, pad = 0, id = '' } = o;
    return `<div class="pc ${shadow ? 'sh' : ''} ${cls}" ${id ? `id="${id}"` : ''} data-rot="${rot}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${z}">` +
      `<div class="boil"><div class="paper" style="clip-path:${torn(w, h, seed, amp, 14, edges)};--c:${color};padding:${pad}px">${html}</div></div></div>`;
  }

  // Ransom-note letters: each letter cut from a different source
  const FONTS = [["'Bungee'", 400], ["'Barlow Condensed'", 800], ["'Playfair Display'", 900], ["'Archivo Black'", 400], ["'Special Elite'", 400], ["'JBM'", 800]];
  const PAIRS = [['#141414', '#fbf8f0'], ['#fbf8f0', '#141414'], ['#f2c14e', '#141414'], ['#e63946', '#fbf8f0'], ['#ece5d3', '#141414'], ['#7cc6c0', '#141414'], ['#f4a7b9', '#141414'], ['#141414', '#f2c14e']];
  function ransom(text, seed, size) {
    const r = rng(seed);
    return text.split('').map(ch => {
      if (ch === ' ') return `<span class="rgap" style="width:${size * 0.32}px"></span>`;
      const [f, wt] = FONTS[Math.floor(r() * FONTS.length)], [bg, fg] = PAIRS[Math.floor(r() * PAIRS.length)];
      const s = size * (0.86 + r() * 0.28), rot = (r() - 0.5) * 16, dy = (r() - 0.5) * size * 0.12;
      return `<span class="rl"><span class="rli" style="font-family:${f};font-weight:${wt};font-size:${s.toFixed(0)}px;background:${bg};color:${fg};transform:translateY(${dy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg);clip-path:${torn(Math.round(s * 0.9), Math.round(s * 1.3), Math.floor(r() * 1e6), 3, 6)}">${ch}</span></span>`;
    }).join('');
  }

  // Masking tape strip (place it with absolute coords inside a piece or the stage)
  const tape = (x, y, w, rot, seed = 3) =>
    `<div class="tape" data-rot="${rot}" style="left:${x}px;top:${y}px;width:${w}px;clip-path:${torn(w, 46, seed, 5, 7, 'lr')};transform:rotate(${rot}deg)"></div>`;

  // Hand-drawn marker strokes as SVG paths (pathLength=1, so the timeline draws them with stroke-dashoffset 1 -> 0)
  function scribble(kind, w, h, seed) {
    const r = rng(seed), J = a => (r() - 0.5) * a; let d = '';
    if (kind === 'circle') {
      const cx = w / 2, cy = h / 2, n = 40;
      for (let k = 0; k <= n; k++) { const a = -2.6 + k / n * Math.PI * 2.25, rx = w / 2 * (1 + J(0.08)), ry = h / 2 * (1 + J(0.12)); d += (k ? 'L' : 'M') + (cx + Math.cos(a) * rx).toFixed(1) + ' ' + (cy + Math.sin(a) * ry).toFixed(1); }
    } else if (kind === 'underline') {
      const n = 14; for (let k = 0; k <= n; k++) d += (k ? 'L' : 'M') + (k / n * w).toFixed(1) + ' ' + (h / 2 + Math.sin(k * 1.3) * h * 0.18 + J(h * 0.15)).toFixed(1);
    } else if (kind === 'x') {
      d = `M${J(10)} ${J(10)}L${w + J(10)} ${h + J(10)}M${w + J(10)} ${J(10)}L${J(10)} ${h + J(10)}`;
    } else if (kind === 'arrow') {
      d = `M0 ${h / 2}C${w * 0.3} ${h * 0.1},${w * 0.6} ${h * 0.9},${w} ${h / 2}M${w - 30} ${h / 2 - 24}L${w} ${h / 2}L${w - 34} ${h / 2 + 18}`;
    }
    return `<svg class="mk" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible"><path d="${d}" pathLength="1"/></svg>`;
  }

  // Photocopied cut-out photo with halftone dots, optional tint
  const photo = (src, w, h, tint = 'transparent') =>
    `<div class="photo ht" style="width:${w}px;height:${h}px"><div class="pimg" style="background-image:url(${src})"></div><div class="tint" style="background:${tint}"></div></div>`;

  // Paper fibre + grain textures (data URLs), built once
  function textures() {
    const make = (seed, size, grain, fibres) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d'); const r = rng(seed);
      const im = x.createImageData(size, size);
      for (let p = 0; p < im.data.length; p += 4) { const v = 255 - r() * grain; im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255; }
      x.putImageData(im, 0, 0);
      x.lineCap = 'round';
      for (let k = 0; k < fibres; k++) {
        x.strokeStyle = `rgba(90,70,40,${0.05 + r() * 0.08})`; x.lineWidth = 0.6 + r();
        const sx = r() * size, sy = r() * size; x.beginPath(); x.moveTo(sx, sy);
        x.quadraticCurveTo(sx + (r() - 0.5) * 40, sy + (r() - 0.5) * 40, sx + (r() - 0.5) * 60, sy + (r() - 0.5) * 60); x.stroke();
      }
      return `url(${cv.toDataURL()})`;
    };
    return { paper: make(11, 256, 26, 90), grain: [make(21, 300, 255, 0), make(22, 300, 255, 0), make(23, 300, 255, 0)] };
  }

  window.COLLAGE = { rng, hash, torn, piece, ransom, tape, scribble, photo, textures };
})();
