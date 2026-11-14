/* ==========================================================================
   ARKA PATRA — ENTRY CORE
   The landing page mark: a wireframe geodesic sphere with a pulsing nucleus
   and two precessing orbit rings, projected by hand onto a 2D canvas.
   No library, no WebGL context, no per-frame allocation churn.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('entryOrb');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var root = document.documentElement;
  var TAU = Math.PI * 2;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* -----------------------------------------------------------------------
     01. Geometry — icosahedron subdivided once into a 42-point geodesic
     ----------------------------------------------------------------------- */

  var PHI = (1 + Math.sqrt(5)) / 2;
  var SEED = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
  ];
  var TRI = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  function unit(x, y, z) {
    var length = Math.sqrt(x * x + y * y + z * z) || 1;
    return [x / length, y / length, z / length];
  }

  function key(v) {
    return v[0].toFixed(3) + ',' + v[1].toFixed(3) + ',' + v[2].toFixed(3);
  }

  var verts = SEED.map(function (v) { return unit(v[0], v[1], v[2]); });
  var index = Object.create(null);
  verts.forEach(function (v, i) { index[key(v)] = i; });

  function mid(a, b) {
    var va = verts[a], vb = verts[b];
    var m = unit(va[0] + vb[0], va[1] + vb[1], va[2] + vb[2]);
    var k = key(m);
    if (index[k] === undefined) {
      index[k] = verts.length;
      verts.push(m);
    }
    return index[k];
  }

  var faces = [];
  TRI.forEach(function (f) {
    var ab = mid(f[0], f[1]);
    var bc = mid(f[1], f[2]);
    var ca = mid(f[2], f[0]);
    faces.push([f[0], ab, ca], [f[1], bc, ab], [f[2], ca, bc], [ab, bc, ca]);
  });

  var seen = Object.create(null);
  var edges = [];
  function edge(a, b) {
    var k = a < b ? a + '|' + b : b + '|' + a;
    if (!seen[k]) { seen[k] = 1; edges.push([a, b]); }
  }
  faces.forEach(function (f) {
    edge(f[0], f[1]);
    edge(f[1], f[2]);
    edge(f[2], f[0]);
  });

  /* -----------------------------------------------------------------------
     02. Orbit rings
     ----------------------------------------------------------------------- */

  var RINGS = [
    { radius: 1.30, tiltX: 1.16, tiltZ: 0.34, speed: 0.19, phase: 0.4, alpha: 0.42 },
    { radius: 1.46, tiltX: -0.68, tiltZ: -0.55, speed: -0.13, phase: 2.1, alpha: 0.30 }
  ];
  var RING_SEG = 88;

  /* -----------------------------------------------------------------------
     03. Palette — read from the theme tokens so light mode stays legible
     ----------------------------------------------------------------------- */

  var palette = { accent: [76, 201, 240], violet: [139, 124, 246] };
  var themeIsLight = false;

  function parseColor(value) {
    var s = (value || '').trim();
    if (!s) return null;
    if (s.charAt(0) === '#') {
      if (s.length === 4) {
        return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)];
      }
      return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    }
    var m = s.match(/rgba?\(([^)]+)\)/);
    if (m) {
      var parts = m[1].split(',');
      return [parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10)];
    }
    return null;
  }

  function readPalette() {
    var styles = getComputedStyle(root);
    var accent = parseColor(styles.getPropertyValue('--accent'));
    var violet = parseColor(styles.getPropertyValue('--violet'));
    if (accent) palette.accent = accent;
    if (violet) palette.violet = violet;
    themeIsLight = root.getAttribute('data-theme') === 'light';
  }

  function rgba(color, alpha) {
    return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha.toFixed(3) + ')';
  }

  /* -----------------------------------------------------------------------
     04. Projection state
     ----------------------------------------------------------------------- */

  var CAM = 3.7;
  var MX = 0, MY = 0, RADIUS = 0, DPR = 1;
  var CY = 1, SY = 0, CP = 1, SP = 0;

  var rotated = new Float32Array(verts.length * 3);
  var sx = new Float32Array(verts.length);
  var sy = new Float32Array(verts.length);
  var tmp = [0, 0, 0];
  var proj = [0, 0];

  function rotate(x, y, z, out) {
    var x1 = x * CY + z * SY;
    var z1 = -x * SY + z * CY;
    out[0] = x1;
    out[1] = y * CP - z1 * SP;
    out[2] = y * SP + z1 * CP;
  }

  function project(x, y, z, out) {
    var k = (CAM / (CAM - z)) * RADIUS;
    out[0] = MX + x * k;
    out[1] = MY + y * k;
  }

  /* -----------------------------------------------------------------------
     05. Painting
     ----------------------------------------------------------------------- */

  function paintRings(t, front) {
    for (var r = 0; r < RINGS.length; r++) {
      var ring = RINGS[r];
      var spin = ring.phase + t * ring.speed;
      var cs = Math.cos(spin), ss = Math.sin(spin);
      var ct = Math.cos(ring.tiltX), st = Math.sin(ring.tiltX);
      var cz = Math.cos(ring.tiltZ), sz = Math.sin(ring.tiltZ);

      var drawing = false;
      var painted = false;
      var prevX = 0, prevY = 0, prevZ = 0;

      ctx.beginPath();

      for (var i = 0; i <= RING_SEG; i++) {
        var a = (i / RING_SEG) * TAU;
        var x = Math.cos(a) * ring.radius;
        var z = Math.sin(a) * ring.radius;

        var x1 = x * cs + z * ss;
        var z1 = -x * ss + z * cs;
        var y2 = -z1 * st;
        var z2 = z1 * ct;
        var x3 = x1 * cz - y2 * sz;
        var y3 = x1 * sz + y2 * cz;

        rotate(x3, y3, z2, tmp);
        project(tmp[0], tmp[1], tmp[2], proj);

        if (i > 0) {
          var midZ = (prevZ + tmp[2]) / 2;
          if ((midZ >= 0) === front) {
            if (!drawing) {
              ctx.moveTo(prevX, prevY);
              drawing = true;
            }
            ctx.lineTo(proj[0], proj[1]);
            painted = true;
          } else {
            drawing = false;
          }
        }

        prevX = proj[0];
        prevY = proj[1];
        prevZ = tmp[2];
      }

      if (painted) {
        ctx.strokeStyle = rgba(palette.accent, front ? ring.alpha : ring.alpha * 0.34);
        ctx.lineWidth = (front ? 1.15 : 0.9) * DPR;
        ctx.stroke();
      }

      if (front) {
        var angle = ring.phase * 2.7 + t * 0.34;
        var px = Math.cos(angle) * ring.radius;
        var pz = Math.sin(angle) * ring.radius;
        var sx1 = px * cs + pz * ss;
        var sz1 = -px * ss + pz * cs;
        var sy2 = -sz1 * st;
        var sz2 = sz1 * ct;
        var sx3 = sx1 * cz - sy2 * sz;
        var sy3 = sx1 * sz + sy2 * cz;
        rotate(sx3, sy3, sz2, tmp);
        project(tmp[0], tmp[1], tmp[2], proj);
        var facing = (tmp[2] + 1) / 2;
        ctx.beginPath();
        ctx.arc(proj[0], proj[1], (1.5 + 1.6 * facing) * DPR, 0, TAU);
        ctx.fillStyle = rgba(palette.violet, 0.25 + 0.6 * facing);
        ctx.fill();
      }
    }
  }

  function paint(t) {
    var w = canvas.width;
    var h = canvas.height;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    var yaw = 0.42 + t * 0.2 + view.yaw;
    var pitch = -0.16 + Math.sin(t * 0.31) * 0.16 + view.pitch;
    CY = Math.cos(yaw); SY = Math.sin(yaw);
    CP = Math.cos(pitch); SP = Math.sin(pitch);

    /* nucleus glow — softer in light mode so it does not read as a blue disc */
    var glowScale = themeIsLight ? 0.5 : 1;
    var glow = ctx.createRadialGradient(MX, MY, 0, MX, MY, RADIUS * 1.05);
    glow.addColorStop(0, rgba(palette.accent, 0.20 * glowScale));
    glow.addColorStop(0.5, rgba(palette.violet, 0.09 * glowScale));
    glow.addColorStop(1, rgba(palette.violet, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(MX, MY, RADIUS * 1.05, 0, TAU);
    ctx.fill();

    paintRings(t, false);

    /* projected vertices */
    for (var i = 0; i < verts.length; i++) {
      var v = verts[i];
      rotate(v[0], v[1], v[2], tmp);
      rotated[i * 3] = tmp[0];
      rotated[i * 3 + 1] = tmp[1];
      rotated[i * 3 + 2] = tmp[2];
      project(tmp[0], tmp[1], tmp[2], proj);
      sx[i] = proj[0];
      sy[i] = proj[1];
    }

    /* edges, grouped into four depth bands so the glass reads at a glance */
    for (var band = 0; band < 4; band++) {
      var open = false;
      ctx.beginPath();
      for (var e = 0; e < edges.length; e++) {
        var a = edges[e][0];
        var b = edges[e][1];
        var z = (rotated[a * 3 + 2] + rotated[b * 3 + 2]) * 0.5;
        var level = ((z + 1) * 2) | 0;
        if (level < 0) level = 0;
        if (level > 3) level = 3;
        if (level !== band) continue;
        ctx.moveTo(sx[a], sy[a]);
        ctx.lineTo(sx[b], sy[b]);
        open = true;
      }
      if (open) {
        ctx.strokeStyle = rgba(palette.accent, (themeIsLight ? 0.17 : 0.11) + band * 0.16);
        ctx.lineWidth = (0.75 + band * 0.16) * DPR;
        ctx.stroke();
      }
    }

    /* nodes on the front half only */
    for (var n = 0; n < verts.length; n++) {
      var depth = (rotated[n * 3 + 2] + 1) / 2;
      if (depth < 0.36) continue;
      ctx.beginPath();
      ctx.arc(sx[n], sy[n], (0.9 + 1.5 * depth) * DPR, 0, TAU);
      ctx.fillStyle = rgba(palette.accent, (themeIsLight ? 0.22 : 0.14) + 0.62 * depth);
      ctx.fill();
    }

    /* nucleus */
    var pulse = 0.5 + 0.5 * Math.sin(t * 1.7);
    ctx.beginPath();
    ctx.arc(MX, MY, (2.6 + pulse * 2.2) * DPR, 0, TAU);
    ctx.fillStyle = rgba(palette.violet, 0.62 + pulse * 0.24);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(MX, MY, (1.2 + pulse * 0.8) * DPR, 0, TAU);
    ctx.fillStyle = rgba(palette.accent, 0.75);
    ctx.fill();

    paintRings(t, true);
  }

  /* -----------------------------------------------------------------------
     06. Sizing
     ----------------------------------------------------------------------- */

  function resize() {
    var box = canvas.getBoundingClientRect();
    var width = Math.round(box.width);
    if (!width) return;

    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(width * DPR);
    MX = canvas.width / 2;
    MY = canvas.height / 2;
    RADIUS = Math.min(canvas.width, canvas.height) * 0.245;

    paint(clock);
  }

  /* -----------------------------------------------------------------------
     07. Motion
     ----------------------------------------------------------------------- */

  var clock = 1.4;
  var frameId = 0;
  var startedAt = 0;
  var onScreen = true;
  var view = { yaw: 0, pitch: 0 };
  var target = { yaw: 0, pitch: 0 };

  function frame(now) {
    if (!startedAt) startedAt = now;
    clock = (now - startedAt) / 1000 + 1.4;

    view.yaw += (target.yaw - view.yaw) * 0.055;
    view.pitch += (target.pitch - view.pitch) * 0.055;

    paint(clock);
    frameId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (frameId || motion.matches || document.hidden || !onScreen) return;
    frameId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (!frameId) return;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  var entry = document.querySelector('.entry');
  if (entry) {
    entry.addEventListener('pointermove', function (event) {
      target.yaw = (event.clientX / window.innerWidth - 0.5) * 0.4;
      target.pitch = (event.clientY / window.innerHeight - 0.5) * 0.26;
    }, { passive: true });
    entry.addEventListener('pointerleave', function () {
      target.yaw = 0;
      target.pitch = 0;
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
      else stop();
    }, { threshold: 0 }).observe(canvas);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  if ('MutationObserver' in window) {
    new MutationObserver(function () {
      readPalette();
      if (!frameId) paint(clock);
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function syncMotion() {
    if (motion.matches) {
      stop();
      paint(clock);
    } else {
      start();
    }
  }

  if (motion.addEventListener) motion.addEventListener('change', syncMotion);
  else if (motion.addListener) motion.addListener(syncMotion);

  readPalette();
  resize();

  if (motion.matches) {
    clock = 2.6;
    paint(clock);
  } else {
    start();
  }
})();
