/* ==========================================================================
   Arka Patra — home globe
   A night-side Earth built from points: the land mask is sampled into a
   rotating dot sphere, then wrapped in atmospheric bloom, orbit rings and
   live connection arcs. Canvas 2D, no dependencies.

   The point mask in assets/land-mask.js is generated from Natural Earth
   1:110m country data (public domain) via assets/earth-atlas.png.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('landingGlobe');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var hint = document.querySelector('.globe-hint');
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  var TWO_PI = Math.PI * 2;
  var DEG = Math.PI / 180;
  var ROTATE_PER_PX = 0.0062;
  var TILT_PER_PX = 0.0045;
  var CRIMSON = '#ff6474';
  var MARKER_LAT = 22.57 * DEG;
  var MARKER_LON = 88.36 * DEG;

  var reducedMotion = motionQuery ? motionQuery.matches : false;
  var size = 0;
  var dpr = 1;
  var centerX = 0;
  var centerY = 0;
  var radius = 0;
  var yaw = -0.34;
  var pitch = 0.24;
  var dragging = false;
  var activePointer = null;
  var lastX = 0;
  var lastY = 0;
  var lastMoveTime = 0;
  var moveVelocity = 0;
  var tiltVelocity = 0;
  var spinVelocity = 0;
  var tiltSpinVelocity = 0;
  var lastInteraction = 0;
  var hintDismissed = false;
  var onScreen = true;
  var dirty = true;

  var points = [];
  var pointStep = 0;
  var rays = [];
  var rings = [];
  var arcs = [];
  var cities = {};

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function wrapAngle(value) {
    return ((value + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  }

  function randomFactory(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Land mask ------------------------------------------------------------- */

  function decodeMask(spec) {
    if (!spec || typeof spec.data !== 'string' || !window.atob) return null;

    try {
      var binary = window.atob(spec.data);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return {
        width: spec.width | 0,
        height: spec.height | 0,
        bytes: bytes
      };
    } catch (error) {
      return null;
    }
  }

  var mask = decodeMask(window.ARKA_LAND_MASK);

  function isLand(lat, lon) {
    if (!mask) return false;

    var x = Math.floor(((lon + 180) / 360) * mask.width);
    var y = Math.floor(((90 - lat) / 180) * mask.height);
    x %= mask.width;
    if (x < 0) x += mask.width;
    y = clamp(y, 0, mask.height - 1);

    var index = y * mask.width + x;
    return (mask.bytes[index >> 3] & (1 << (7 - (index & 7)))) !== 0;
  }

  function buildPoints() {
    if (!size) return;

    var step = size < 380 ? 1.55 : size < 460 ? 1.35 : 1.18;
    if (step === pointStep && points.length) return;
    pointStep = step;

    var list = [];
    var rows = Math.round(176 / step);
    var random = randomFactory(0x41524b41);

    for (var row = 0; row < rows; row += 1) {
      var lat = -88 + (row + 0.5) * (176 / rows);
      var latRad = lat * DEG;
      var cosLat = Math.cos(latRad);
      var count = Math.max(8, Math.round((360 / step) * cosLat));

      for (var col = 0; col < count; col += 1) {
        var lon = -180 + (col + 0.5) * (360 / count);
        var lonRad = lon * DEG;
        var land = isLand(lat, lon);
        var roll = random();
        var phase = random() * TWO_PI;

        list.push({
          x: cosLat * Math.sin(lonRad),
          y: Math.sin(latRad),
          z: cosLat * Math.cos(lonRad),
          land: land,
          spark: land && roll > 0.962,
          phase: phase
        });
      }
    }

    points = list;
  }

  /* Decorative orbit data -------------------------------------------------- */

  function buildDecor() {
    var random = randomFactory(0x9e3779b9);
    var i;

    rays = [];
    for (i = 0; i < 168; i += 1) {
      rays.push({
        angle: random() * TWO_PI,
        start: 1.003 + random() * 0.034,
        length: 0.028 + random() * 0.19,
        alpha: 0.1 + random() * 0.5,
        width: 0.35 + random() * 0.72,
        bend: (random() - 0.5) * 0.05,
        phase: random() * TWO_PI,
        speed: 0.0007 + random() * 0.002
      });
    }

    rings = [
      { rx: 1.045, ry: 0.385, tilt: -0.54, alpha: 0.52, width: 1.1, speed: 0.00012, phase: 0.6, dash: null, ox: 0.004, oy: -0.008 },
      { rx: 1.155, ry: 0.565, tilt: 0.31, alpha: 0.42, width: 0.95, speed: -0.00008, phase: 2.2, dash: [1.2, 8], ox: -0.012, oy: 0.008 },
      { rx: 1.285, ry: 0.745, tilt: -0.22, alpha: 0.32, width: 0.85, speed: 0.00006, phase: 4.3, dash: null, ox: 0.016, oy: -0.004 },
      { rx: 1.41, ry: 0.93, tilt: 0.55, alpha: 0.2, width: 0.75, speed: -0.00004, phase: 1.2, dash: null, ox: -0.018, oy: 0.006 },
      { rx: 1.33, ry: 0.62, tilt: 1.02, alpha: 0.27, width: 0.8, speed: 0.00009, phase: 3.4, dash: [2, 12], ox: 0.01, oy: 0.012 }
    ];

    defineCity('newYork', 40.71, -74.0, 0.16);
    defineCity('losAngeles', 34.05, -118.24, 4.1);
    defineCity('mexicoCity', 19.43, -99.13, 2.7);
    defineCity('lima', -12.05, -77.04, 5.2);
    defineCity('saoPaulo', -23.55, -46.63, 1.4);
    defineCity('buenosAires', -34.6, -58.38, 3.8);
    defineCity('london', 51.51, -0.13, 0.2);
    defineCity('madrid', 40.42, -3.7, 2.1);
    defineCity('paris', 48.86, 2.35, 4.8);
    defineCity('lagos', 6.52, 3.38, 5.7);
    defineCity('capeTown', -33.92, 18.42, 1.9);
    defineCity('nairobi', -1.29, 36.82, 3.3);
    defineCity('cairo', 30.04, 31.24, 0.9);
    defineCity('moscow', 55.75, 37.62, 5.1);
    defineCity('dubai', 25.2, 55.27, 2.5);
    defineCity('mumbai', 19.08, 72.88, 4.4);
    defineCity('kolkata', 22.57, 88.36, 1.1);
    defineCity('singapore', 1.35, 103.82, 3.6);
    defineCity('jakarta', -6.2, 106.85, 5.9);
    defineCity('beijing', 39.9, 116.4, 0.5);
    defineCity('seoul', 37.57, 126.98, 2.9);
    defineCity('tokyo', 35.68, 139.69, 4.7);
    defineCity('sydney', -33.87, 151.21, 1.6);
    defineCity('auckland', -36.85, 174.76, 4.0);
    defineCity('honolulu', 21.31, -157.86, 5.5);
    defineCity('vancouver', 49.28, -123.12, 0.7);

    arcs = [
      makeArc('newYork', 'london', 0.14),
      makeArc('newYork', 'losAngeles', 0.08),
      makeArc('mexicoCity', 'lima', 0.09),
      makeArc('lima', 'saoPaulo', 0.1),
      makeArc('saoPaulo', 'capeTown', 0.15),
      makeArc('buenosAires', 'lagos', 0.18),
      makeArc('london', 'lagos', 0.1),
      makeArc('london', 'dubai', 0.16),
      makeArc('madrid', 'mexicoCity', 0.19),
      makeArc('paris', 'moscow', 0.07),
      makeArc('lagos', 'nairobi', 0.08),
      makeArc('cairo', 'dubai', 0.08),
      makeArc('dubai', 'mumbai', 0.09),
      makeArc('mumbai', 'kolkata', 0.06),
      makeArc('kolkata', 'singapore', 0.12),
      makeArc('singapore', 'sydney', 0.15),
      makeArc('beijing', 'seoul', 0.06),
      makeArc('seoul', 'tokyo', 0.05),
      makeArc('tokyo', 'honolulu', 0.17),
      makeArc('sydney', 'auckland', 0.09),
      makeArc('vancouver', 'tokyo', 0.2)
    ];
  }

  function defineCity(key, lat, lon, phase) {
    var latRad = lat * DEG;
    var lonRad = lon * DEG;
    var cosLat = Math.cos(latRad);

    cities[key] = {
      key: key,
      x: cosLat * Math.sin(lonRad),
      y: Math.sin(latRad),
      z: cosLat * Math.cos(lonRad),
      special: key === 'kolkata',
      phase: phase
    };
  }

  function makeArc(from, to, lift) {
    var a = cities[from];
    var b = cities[to];
    var dot = clamp(a.x * b.x + a.y * b.y + a.z * b.z, -1, 1);

    return {
      a: a,
      b: b,
      lift: lift,
      omega: Math.acos(dot),
      phase: (a.phase + b.phase) * 0.5,
      speed: 0.00012 + (a.phase % 1) * 0.00005
    };
  }

  /* Projection helpers ---------------------------------------------------- */

  function project(x, y, z, cosYaw, sinYaw, cosPitch, sinPitch) {
    var rx = x * cosYaw + z * sinYaw;
    var rz = z * cosYaw - x * sinYaw;
    var ry = y * cosPitch - rz * sinPitch;

    return {
      x: centerX + rx * radius,
      y: centerY - ry * radius,
      z: y * sinPitch + rz * cosPitch
    };
  }

  function cityPoint(city, cosYaw, sinYaw, cosPitch, sinPitch) {
    return project(city.x, city.y, city.z, cosYaw, sinYaw, cosPitch, sinPitch);
  }

  /* Halo ------------------------------------------------------------------ */

  function drawHalo() {
    var halo = ctx.createRadialGradient(
      centerX, centerY, radius * 0.9,
      centerX, centerY, radius * 1.36
    );
    halo.addColorStop(0, 'rgba(89, 146, 235, .18)');
    halo.addColorStop(0.42, 'rgba(88, 144, 232, .07)');
    halo.addColorStop(1, 'rgba(88, 144, 232, 0)');

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.36, 0, TWO_PI);
    ctx.fill();

    var under = ctx.createRadialGradient(
      centerX, centerY + radius * 1.02, 0,
      centerX, centerY + radius * 1.02, radius * 0.62
    );
    under.addColorStop(0, 'rgba(37, 67, 122, .12)');
    under.addColorStop(1, 'rgba(37, 67, 122, 0)');

    ctx.fillStyle = under;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + radius * 1.02, radius * 0.82, radius * 0.2, 0, 0, TWO_PI);
    ctx.fill();
  }

  /* Sphere and point cloud ------------------------------------------------ */

  function drawSphereBase() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.clip();

    var base = ctx.createRadialGradient(
      centerX - radius * 0.36, centerY - radius * 0.42, radius * 0.04,
      centerX, centerY, radius * 1.04
    );
    base.addColorStop(0, '#101c31');
    base.addColorStop(0.4, '#0a1425');
    base.addColorStop(0.76, '#050b17');
    base.addColorStop(1, '#02050c');
    ctx.fillStyle = base;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    var haze = ctx.createRadialGradient(
      centerX - radius * 0.32, centerY - radius * 0.38, 0,
      centerX - radius * 0.32, centerY - radius * 0.38, radius * 0.82
    );
    haze.addColorStop(0, 'rgba(66, 112, 190, .17)');
    haze.addColorStop(0.55, 'rgba(30, 62, 118, .07)');
    haze.addColorStop(1, 'rgba(10, 24, 50, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    ctx.restore();
  }

  function drawPoints() {
    if (!points.length) return;

    var cosYaw = Math.cos(yaw);
    var sinYaw = Math.sin(yaw);
    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);
    var dot = clamp(radius * 0.0068, 0.82, 1.24);
    var oceanDot = dot * 0.78;
    var oceanNear = new Path2D();
    var oceanFar = new Path2D();
    var landGlow = new Path2D();
    var landNear = new Path2D();
    var landFar = new Path2D();
    var sparks = new Path2D();
    var i;

    for (i = 0; i < points.length; i += 1) {
      var p = points[i];

      var rx = p.x * cosYaw + p.z * sinYaw;
      var rz = p.z * cosYaw - p.x * sinYaw;
      var ry = p.y * cosPitch - rz * sinPitch;
      var depth = p.y * sinPitch + rz * cosPitch;

      if (depth <= 0.01) continue;

      var sx = centerX + rx * radius;
      var sy = centerY - ry * radius;

      if (p.land) {
        landGlow.rect(sx - dot * 1.55, sy - dot * 1.55, dot * 3.1, dot * 3.1);

        if (p.spark) {
          sparks.rect(sx - dot * 0.85, sy - dot * 0.85, dot * 1.7, dot * 1.7);
        } else if (depth > 0.4) {
          landNear.rect(sx - dot * 0.5, sy - dot * 0.5, dot, dot);
        } else {
          landFar.rect(sx - dot * 0.5, sy - dot * 0.5, dot, dot);
        }
      } else if (depth > 0.42) {
        oceanNear.rect(sx - oceanDot * 0.5, sy - oceanDot * 0.5, oceanDot, oceanDot);
      } else {
        oceanFar.rect(sx - oceanDot * 0.5, sy - oceanDot * 0.5, oceanDot, oceanDot);
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.fillStyle = 'rgba(74, 130, 214, .32)';
    ctx.fill(oceanFar);
    ctx.fillStyle = 'rgba(96, 148, 226, .46)';
    ctx.fill(oceanNear);

    ctx.fillStyle = 'rgba(86, 150, 255, .075)';
    ctx.fill(landGlow);

    ctx.fillStyle = 'rgba(139, 178, 240, .54)';
    ctx.fill(landFar);
    ctx.fillStyle = 'rgba(207, 229, 255, .95)';
    ctx.fill(landNear);
    ctx.fillStyle = 'rgba(246, 250, 255, 1)';
    ctx.fill(sparks);

    ctx.restore();
  }

  function drawRim() {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.clip();

    var topHaze = ctx.createRadialGradient(
      centerX - radius * 0.5, centerY - radius * 0.82, 0,
      centerX - radius * 0.5, centerY - radius * 0.82, radius * 0.78
    );
    topHaze.addColorStop(0, 'rgba(118, 180, 255, .19)');
    topHaze.addColorStop(0.45, 'rgba(77, 137, 224, .08)');
    topHaze.addColorStop(1, 'rgba(35, 80, 160, 0)');
    ctx.fillStyle = topHaze;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    var baseHaze = ctx.createRadialGradient(
      centerX, centerY + radius * 0.9, 0,
      centerX, centerY + radius * 0.9, radius * 0.72
    );
    baseHaze.addColorStop(0, 'rgba(118, 180, 255, .23)');
    baseHaze.addColorStop(0.55, 'rgba(83, 142, 235, .09)');
    baseHaze.addColorStop(1, 'rgba(35, 80, 160, 0)');
    ctx.fillStyle = baseHaze;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    ctx.restore();

    var rim = ctx.createLinearGradient(
      centerX - radius * 0.72, centerY - radius * 0.92,
      centerX + radius * 0.74, centerY + radius * 0.88
    );
    rim.addColorStop(0, 'rgba(224, 240, 255, .95)');
    rim.addColorStop(0.3, 'rgba(132, 184, 255, .6)');
    rim.addColorStop(0.62, 'rgba(82, 132, 220, .24)');
    rim.addColorStop(1, 'rgba(168, 210, 255, .62)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.lineWidth = Math.max(0.8, radius * 0.006);
    ctx.strokeStyle = rim;
    ctx.shadowColor = 'rgba(104, 164, 255, .9)';
    ctx.shadowBlur = radius * 0.12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.994, Math.PI * 0.78, Math.PI * 1.82);
    ctx.lineWidth = Math.max(1.2, radius * 0.015);
    ctx.strokeStyle = 'rgba(206, 230, 255, .46)';
    ctx.shadowColor = 'rgba(116, 176, 255, .95)';
    ctx.shadowBlur = radius * 0.1;
    ctx.stroke();
    ctx.shadowBlur = 0;

    var bloom = ctx.createRadialGradient(
      centerX, centerY, radius * 0.76,
      centerX, centerY, radius * 1.28
    );
    bloom.addColorStop(0, 'rgba(78, 142, 255, 0)');
    bloom.addColorStop(0.44, 'rgba(78, 142, 255, .13)');
    bloom.addColorStop(0.66, 'rgba(70, 130, 240, .08)');
    bloom.addColorStop(1, 'rgba(30, 70, 160, 0)');
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.28, 0, TWO_PI);
    ctx.fill();

    ctx.restore();
  }

  /* Satellite rings ------------------------------------------------------- */

  function drawRings(now) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(centerX, centerY, radius * 0.975, 0, TWO_PI, true);
    ctx.clip();

    for (var i = 0; i < rings.length; i += 1) {
      var ring = rings[i];
      var tilt = ring.tilt + Math.sin(now * ring.speed + ring.phase) * 0.06;
      var rx = radius * ring.rx;
      var ry = radius * ring.ry;
      var ox = centerX + radius * (ring.ox || 0);
      var oy = centerY + radius * (ring.oy || 0);

      ctx.beginPath();
      ctx.ellipse(ox, oy, rx, ry, tilt, 0, TWO_PI);
      if (ring.dash) ctx.setLineDash([ring.dash[0] * (size / 500), ring.dash[1] * (size / 500)]);
      ctx.lineWidth = Math.max(0.85, radius * 0.0064) * ring.width;
      ctx.strokeStyle = 'rgba(92, 139, 209, ' + (ring.alpha * 0.85) + ')';
      ctx.stroke();

      ctx.lineWidth = Math.max(1.8, radius * 0.022) * ring.width;
      ctx.strokeStyle = 'rgba(126, 169, 228, ' + (ring.alpha * 0.24) + ')';
      ctx.stroke();
      ctx.setLineDash([]);

      var angle = ((now * 0.000035 * (i % 2 ? -1 : 1) + ring.phase) % TWO_PI + TWO_PI) % TWO_PI;
      var trail = 0.5;

      ctx.beginPath();
      ctx.ellipse(ox, oy, rx, ry, tilt, angle - trail, angle);
      ctx.lineWidth = Math.max(1, radius * 0.006);
      ctx.strokeStyle = 'rgba(53, 105, 187, ' + (ring.alpha * 1.02) + ')';
      ctx.stroke();

      var cosTilt = Math.cos(tilt);
      var sinTilt = Math.sin(tilt);
      var ex = rx * Math.cos(angle);
      var ey = ry * Math.sin(angle);
      var px = ox + ex * cosTilt - ey * sinTilt;
      var py = oy + ex * sinTilt + ey * cosTilt;

      ctx.fillStyle = 'rgba(47, 98, 180, ' + Math.min(0.95, ring.alpha * 2.1) + ')';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.9, radius * 0.009), 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(119, 164, 226, ' + (ring.alpha * 0.28) + ')';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2.2, radius * 0.035), 0, TWO_PI);
      ctx.fill();
    }

    ctx.restore();
  }

  /* Rays ------------------------------------------------------------------ */

  function drawRays(now) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(centerX, centerY, radius * 1.002, 0, TWO_PI, true);
    ctx.clip();

    for (var i = 0; i < rays.length; i += 1) {
      var ray = rays[i];
      var breathe = 0.72 + 0.28 * Math.sin(now * ray.speed + ray.phase);
      var inner = radius * ray.start;
      var outer = radius * (ray.start + ray.length * breathe);
      var angle = ray.angle;
      var endAngle = angle + ray.bend;
      var alpha = ray.alpha * breathe;

      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
      ctx.lineTo(centerX + Math.cos(endAngle) * outer, centerY + Math.sin(endAngle) * outer);
      ctx.lineWidth = ray.width * Math.max(0.6, size / 900);
      ctx.strokeStyle = i % 7 === 0
        ? 'rgba(65, 115, 198, ' + (alpha * 1.15) + ')'
        : 'rgba(108, 150, 216, ' + alpha + ')';
      ctx.stroke();
    }

    ctx.restore();
  }

  /* Connection arcs ------------------------------------------------------- */

  function drawConnections(now) {
    var cosYaw = Math.cos(yaw);
    var sinYaw = Math.sin(yaw);
    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);
    var nodes = {};
    var i;
    var j;

    for (i = 0; i < arcs.length; i += 1) {
      var arc = arcs[i];
      var a = arc.a;
      var b = arc.b;
      var aPoint = cityPoint(a, cosYaw, sinYaw, cosPitch, sinPitch);
      var bPoint = cityPoint(b, cosYaw, sinYaw, cosPitch, sinPitch);
      var visible = Math.min(aPoint.z, bPoint.z);

      if (visible < 0.045) continue;

      var fade = clamp((visible - 0.045) / 0.22, 0, 1);
      var sinOmega = Math.sin(arc.omega);
      var path = new Path2D();
      var started = false;
      var steps = 52;
      var lastParticle = null;

      if (sinOmega < 0.0001) continue;

      for (j = 0; j <= steps; j += 1) {
        var t = j / steps;
        var wa = Math.sin((1 - t) * arc.omega) / sinOmega;
        var wb = Math.sin(t * arc.omega) / sinOmega;
        var lift = 1 + arc.lift * Math.sin(Math.PI * t);
        var vx = (a.x * wa + b.x * wb) * lift;
        var vy = (a.y * wa + b.y * wb) * lift;
        var vz = (a.z * wa + b.z * wb) * lift;
        var point = project(vx, vy, vz, cosYaw, sinYaw, cosPitch, sinPitch);

        if (point.z > 0.012) {
          if (!started) {
            path.moveTo(point.x, point.y);
            started = true;
          } else {
            path.lineTo(point.x, point.y);
          }
        } else {
          started = false;
        }
      }

      var particleT = (((now * arc.speed + arc.phase) % 1) + 1) % 1;
      var particleA = Math.sin((1 - particleT) * arc.omega) / sinOmega;
      var particleB = Math.sin(particleT * arc.omega) / sinOmega;
      var particleLift = 1 + arc.lift * Math.sin(Math.PI * particleT);
      var particlePoint = project(
        (a.x * particleA + b.x * particleB) * particleLift,
        (a.y * particleA + b.y * particleB) * particleLift,
        (a.z * particleA + b.z * particleB) * particleLift,
        cosYaw, sinYaw, cosPitch, sinPitch
      );
      if (particlePoint.z > 0.02) lastParticle = particlePoint;

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = Math.max(2.6, radius * 0.018);
      ctx.strokeStyle = 'rgba(84, 133, 205, ' + (0.16 * fade) + ')';
      ctx.stroke(path);
      ctx.lineWidth = Math.max(0.85, radius * 0.0062);
      ctx.strokeStyle = 'rgba(36, 82, 152, ' + (0.5 * fade) + ')';
      ctx.stroke(path);
      ctx.lineWidth = Math.max(0.5, radius * 0.0026);
      ctx.strokeStyle = 'rgba(233, 244, 255, ' + (0.62 * fade) + ')';
      ctx.stroke(path);

      if (lastParticle && lastParticle.z > 0.02) {
        ctx.fillStyle = 'rgba(64, 116, 194, ' + (0.4 * fade) + ')';
        ctx.beginPath();
        ctx.arc(lastParticle.x, lastParticle.y, Math.max(3.2, radius * 0.032), 0, TWO_PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(247, 251, 255, ' + (0.95 * fade) + ')';
        ctx.beginPath();
        ctx.arc(lastParticle.x, lastParticle.y, Math.max(1.2, radius * 0.008), 0, TWO_PI);
        ctx.fill();
      }

      ctx.restore();

      if (!nodes[a.key]) nodes[a.key] = { point: aPoint, city: a };
      if (!nodes[b.key]) nodes[b.key] = { point: bPoint, city: b };
    }

    for (var key in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, key)) continue;
      var node = nodes[key];
      drawNode(node.point, node.city, now);
    }

    var marker = cityPoint(
      { x: Math.cos(MARKER_LAT) * Math.sin(MARKER_LON), y: Math.sin(MARKER_LAT), z: Math.cos(MARKER_LAT) * Math.cos(MARKER_LON) },
      cosYaw, sinYaw, cosPitch, sinPitch
    );
    if (marker.z > 0.03) {
      var markerFade = clamp((marker.z - 0.03) / 0.2, 0, 1);
      var dotR = Math.max(3, radius * 0.016);
      var pulsePhase = (now % 2600) / 2600;

      ctx.save();
      ctx.globalAlpha = markerFade;

      var markerGlow = ctx.createRadialGradient(marker.x, marker.y, dotR, marker.x, marker.y, dotR * 5.4);
      markerGlow.addColorStop(0, 'rgba(255, 72, 92, .38)');
      markerGlow.addColorStop(0.55, 'rgba(255, 72, 92, .12)');
      markerGlow.addColorStop(1, 'rgba(255, 72, 92, 0)');
      ctx.fillStyle = markerGlow;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dotR * 5.4, 0, TWO_PI);
      ctx.fill();

      for (var pulseIndex = 0; pulseIndex < 2; pulseIndex += 1) {
        var pulseT = (pulsePhase + pulseIndex * 0.5) % 1;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, dotR + pulseT * radius * 0.07, 0, TWO_PI);
        ctx.lineWidth = Math.max(0.8, radius * 0.003);
        ctx.strokeStyle = 'rgba(255, 86, 106, ' + (0.55 * (1 - pulseT)) + ')';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dotR + Math.max(1.4, radius * 0.005), 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 244, 246, .92)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dotR, 0, TWO_PI);
      ctx.fillStyle = CRIMSON;
      ctx.fill();

      var label = 'Kolkata';
      var fontSize = Math.max(9, radius * 0.055);
      var side = marker.x > centerX ? -1 : 1;
      ctx.font = '600 ' + fontSize + 'px "JetBrains Mono", monospace';
      var textWidth = ctx.measureText(label).width;
      var padX = fontSize * 0.55;
      var pillH = fontSize + fontSize * 0.7;
      var pillW = textWidth + padX * 2;
      var pillY = marker.y - pillH * 0.5;
      var pillX = marker.x + side * (dotR + fontSize * 0.9) - (side < 0 ? pillW : 0);
      var pillR = pillH * 0.5;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fillStyle = 'rgba(4, 11, 24, .74)';
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(255, 110, 128, .38)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 238, 241, .97)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pillX + padX, marker.y + fontSize * 0.04);

      ctx.restore();
    }
  }

  function drawNode(point, city, now) {
    if (point.z < 0.04) return;

    var fade = clamp((point.z - 0.04) / 0.2, 0, 1);
    var twinkle = 0.6 + 0.4 * Math.sin(now * 0.0017 + city.phase);
    var special = city.special;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = fade;

    ctx.fillStyle = special ? 'rgba(255, 101, 119, .26)' : 'rgba(139, 188, 255, .24)';
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(4.5, radius * 0.045) * (0.7 + twinkle * 0.5), 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = special ? 'rgba(255, 168, 178, .5)' : 'rgba(206, 232, 255, .54)';
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(2.2, radius * 0.017), 0, TWO_PI);
    ctx.fill();

    var flare = Math.max(3, radius * 0.035) * (0.65 + twinkle * 0.55);
    ctx.strokeStyle = special ? 'rgba(255, 170, 178, .72)' : 'rgba(238, 248, 255, .7)';
    ctx.lineWidth = Math.max(0.5, radius * 0.0028);
    ctx.beginPath();
    ctx.moveTo(point.x - flare, point.y);
    ctx.lineTo(point.x + flare, point.y);
    ctx.moveTo(point.x, point.y - flare);
    ctx.lineTo(point.x, point.y + flare);
    ctx.stroke();

    ctx.fillStyle = special ? CRIMSON : '#f3f9ff';
    ctx.beginPath();
    ctx.arc(point.x, point.y, special ? 2 : 1.5, 0, TWO_PI);
    ctx.fill();

    ctx.restore();
  }

  /* Render loop ----------------------------------------------------------- */

  function render(now) {
    if (!size) return;

    ctx.clearRect(0, 0, size, size);
    drawHalo();
    drawSphereBase();
    drawPoints();
    drawRays(now);
    drawRim();
    drawRings(now);
    drawConnections(now);
  }

  /* Sizing ---------------------------------------------------------------- */

  function resize() {
    var nextSize = canvas.getBoundingClientRect().width;
    if (!nextSize) return;

    var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (Math.abs(nextSize - size) < 0.5 && nextDpr === dpr) return;

    size = nextSize;
    dpr = nextDpr;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = size / 2;
    centerY = size / 2;
    radius = size * 0.365;
    buildPoints();
    dirty = true;
  }

  /* Interaction ----------------------------------------------------------- */

  function dismissHint() {
    if (hintDismissed || !hint) return;
    hintDismissed = true;
    hint.classList.add('is-hidden');
  }

  function pointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.preventDefault();
    dragging = true;
    activePointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    lastMoveTime = performance.now();
    moveVelocity = 0;
    tiltVelocity = 0;
    spinVelocity = 0;
    tiltSpinVelocity = 0;
    lastInteraction = performance.now();

    canvas.classList.add('is-dragging');
    dismissHint();

    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        /* Progressive enhancement. */
      }
    }
  }

  function pointerMove(event) {
    if (!dragging || event.pointerId !== activePointer) return;

    var now = performance.now();
    var dx = event.clientX - lastX;
    var dy = event.clientY - lastY;
    var elapsed = Math.max(8, now - lastMoveTime) / 1000;

    yaw += dx * ROTATE_PER_PX;
    pitch = wrapAngle(pitch + dy * TILT_PER_PX);
    moveVelocity = (dx * ROTATE_PER_PX) / elapsed;
    tiltVelocity = (dy * TILT_PER_PX) / elapsed;

    lastX = event.clientX;
    lastY = event.clientY;
    lastMoveTime = now;
    lastInteraction = now;
    dirty = true;
  }

  function pointerUp(event) {
    if (!dragging || event.pointerId !== activePointer) return;

    dragging = false;
    activePointer = null;
    lastInteraction = performance.now();
    spinVelocity = reducedMotion ? 0 : clamp(moveVelocity, -3.2, 3.2);
    tiltSpinVelocity = reducedMotion ? 0 : clamp(tiltVelocity, -3.2, 3.2);

    canvas.classList.remove('is-dragging');
    if (canvas.releasePointerCapture && canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener('pointerdown', pointerDown);
  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', pointerUp);

  if (motionQuery) {
    var onMotionChange = function (event) {
      reducedMotion = event.matches;
      if (reducedMotion) {
        spinVelocity = 0;
        tiltSpinVelocity = 0;
      }
      dirty = true;
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) dirty = true;
    }, { rootMargin: '80px' }).observe(canvas);
  }

  buildDecor();
  resize();

  var lastFrame = performance.now();

  function frame(now) {
    var delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    var visible = onScreen && document.visibilityState !== 'hidden';
    var animating = !reducedMotion || dragging || spinVelocity !== 0 || tiltSpinVelocity !== 0;

    if (visible && (animating || dirty)) {
      if (!dragging) {
        if (spinVelocity) {
          yaw += spinVelocity * delta;
          spinVelocity *= Math.exp(-3.2 * delta);
          if (Math.abs(spinVelocity) < 0.003) spinVelocity = 0;
        }

        if (tiltSpinVelocity) {
          pitch = wrapAngle(pitch + tiltSpinVelocity * delta);
          tiltSpinVelocity *= Math.exp(-3.2 * delta);
          if (Math.abs(tiltSpinVelocity) < 0.003) tiltSpinVelocity = 0;
        }

        if (!reducedMotion && now - lastInteraction > 2300) {
          yaw += 0.022 * delta;
        }
      }

      render(now);
      dirty = false;
    }

    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();
