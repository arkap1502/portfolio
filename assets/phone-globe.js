/* ==========================================================================
   Arka Patra — entry globes
   Miniature particle Earths for the entry-page laptop and phone mockups:
   dotted continents, blue atmosphere, connection arcs, orbit rings and a
   red location marker. Both spin anti-clockwise and can be dragged.
   ========================================================================== */

(function () {
  'use strict';

  var canvases = document.querySelectorAll('canvas[data-mini-globe]');
  if (!canvases.length) return;

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function createGlobe(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var wrap = canvas.closest('[data-globe-wrap]');
    var device = canvas.closest('.device');
    var hint = wrap ? wrap.querySelector('.phone-globe-hint') : null;
    if (!wrap) return null;

    var TWO_PI = Math.PI * 2;
    var DEG = Math.PI / 180;
    var ROTATE_PER_PX = 0.012;
    var TILT_PER_PX = 0.008;
    var CRIMSON = '#ff6474';
    var MARKER_LAT = 22.57 * DEG;
    var MARKER_LON = 88.36 * DEG;

    var reducedMotion = motionQuery ? motionQuery.matches : false;

    function readNumber(name, fallback) {
      var value = parseFloat(canvas.getAttribute(name));
      return isFinite(value) ? value : fallback;
    }

    var autoSpin = readNumber('data-spin', 0.06);
    var showLabel = canvas.hasAttribute('data-globe-label');

    var size = 0;
    var dpr = 1;
    var center = 0;
    var radius = 0;
    var yaw = readNumber('data-yaw', -0.95);
    var pitch = readNumber('data-pitch', 0.24);
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
    var moved = false;
    var suppressClick = false;
    var suppressTimer;
    var onScreen = true;
    var dirty = true;

    var points = [];
    var pointStep = 0;
    var cities = {};
    var arcs = [];
    var rings = [];

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

    /* Land mask ----------------------------------------------------------- */

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
    if (!mask) return null;

    function isLand(lat, lon) {
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

      var step = size > 190 ? 1.9 : (size < 140 ? 2.5 : 2.1);
      if (step === pointStep && points.length) return;
      pointStep = step;

      var list = [];
      var rows = Math.round(176 / step);
      var random = randomFactory(0x41524b41);

      for (var row = 0; row < rows; row += 1) {
        var lat = -88 + (row + 0.5) * (176 / rows);
        var latRad = lat * DEG;
        var cosLat = Math.cos(latRad);
        var count = Math.max(6, Math.round((360 / step) * cosLat));

        for (var col = 0; col < count; col += 1) {
          var lon = -180 + (col + 0.5) * (360 / count);
          var lonRad = lon * DEG;
          var land = isLand(lat, lon);
          var roll = random();

          list.push({
            x: cosLat * Math.sin(lonRad),
            y: Math.sin(latRad),
            z: cosLat * Math.cos(lonRad),
            land: land,
            spark: land && roll > 0.955,
            phase: random() * TWO_PI
          });
        }
      }

      points = list;
    }

    /* Scene data ---------------------------------------------------------- */

    function defineCity(key, lat, lon, phase) {
      var latRad = lat * DEG;
      var lonRad = lon * DEG;
      var cosLat = Math.cos(latRad);

      cities[key] = {
        key: key,
        x: cosLat * Math.sin(lonRad),
        y: Math.sin(latRad),
        z: cosLat * Math.cos(lonRad),
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
        speed: 0.00014 + (a.phase % 1) * 0.00004
      };
    }

    function buildScene() {
      defineCity('newYork', 40.71, -74.0, 0.16);
      defineCity('london', 51.51, -0.13, 0.2);
      defineCity('lagos', 6.52, 3.38, 5.7);
      defineCity('cairo', 30.04, 31.24, 0.9);
      defineCity('dubai', 25.2, 55.27, 2.5);
      defineCity('mumbai', 19.08, 72.88, 4.4);
      defineCity('kolkata', 22.57, 88.36, 1.1);
      defineCity('singapore', 1.35, 103.82, 3.6);
      defineCity('tokyo', 35.68, 139.69, 4.7);
      defineCity('sydney', -33.87, 151.21, 1.6);

      arcs = [
        makeArc('newYork', 'london', 0.14),
        makeArc('lagos', 'cairo', 0.09),
        makeArc('london', 'dubai', 0.16),
        makeArc('cairo', 'mumbai', 0.1),
        makeArc('mumbai', 'kolkata', 0.06),
        makeArc('kolkata', 'singapore', 0.12),
        makeArc('singapore', 'tokyo', 0.1),
        makeArc('tokyo', 'sydney', 0.16)
      ];

      rings = [
        { rx: 1.06, ry: 0.39, tilt: -0.52, alpha: 0.5, width: 1, speed: 0.00012, phase: 0.6 },
        { rx: 1.17, ry: 0.6, tilt: 0.32, alpha: 0.3, width: 0.8, speed: -0.00008, phase: 2.2 }
      ];
    }

    /* Projection ---------------------------------------------------------- */

    function project(x, y, z, cosYaw, sinYaw, cosPitch, sinPitch) {
      var rx = x * cosYaw + z * sinYaw;
      var rz = z * cosYaw - x * sinYaw;
      var ry = y * cosPitch - rz * sinPitch;

      return {
        x: center + rx * radius,
        y: center - ry * radius,
        z: y * sinPitch + rz * cosPitch
      };
    }

    /* Rendering ----------------------------------------------------------- */

    function drawHalo() {
      var halo = ctx.createRadialGradient(
        center, center, radius * 0.92,
        center, center, radius * 1.2
      );
      halo.addColorStop(0, 'rgba(89, 146, 235, .22)');
      halo.addColorStop(0.55, 'rgba(88, 144, 232, .08)');
      halo.addColorStop(1, 'rgba(88, 144, 232, 0)');

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(center, center, radius * 1.2, 0, TWO_PI);
      ctx.fill();
    }

    function drawSphere() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, TWO_PI);
      ctx.clip();

      var base = ctx.createRadialGradient(
        center - radius * 0.36, center - radius * 0.42, radius * 0.04,
        center, center, radius * 1.04
      );
      base.addColorStop(0, '#14223b');
      base.addColorStop(0.42, '#0a1527');
      base.addColorStop(0.78, '#050c18');
      base.addColorStop(1, '#02050c');
      ctx.fillStyle = base;
      ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);

      var haze = ctx.createRadialGradient(
        center - radius * 0.32, center - radius * 0.38, 0,
        center - radius * 0.32, center - radius * 0.38, radius * 0.85
      );
      haze.addColorStop(0, 'rgba(66, 112, 190, .17)');
      haze.addColorStop(0.55, 'rgba(30, 62, 118, .07)');
      haze.addColorStop(1, 'rgba(10, 24, 50, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);

      ctx.restore();
    }

    function drawPoints() {
      if (!points.length) return;

      var cosYaw = Math.cos(yaw);
      var sinYaw = Math.sin(yaw);
      var cosPitch = Math.cos(pitch);
      var sinPitch = Math.sin(pitch);
      var dot = clamp(radius * 0.0135, 0.55, 1.15);
      var oceanDot = dot * 0.8;
      var oceanNear = new Path2D();
      var oceanFar = new Path2D();
      var landGlow = new Path2D();
      var landNear = new Path2D();
      var landFar = new Path2D();
      var sparks = new Path2D();

      for (var i = 0; i < points.length; i += 1) {
        var p = points[i];
        var rx = p.x * cosYaw + p.z * sinYaw;
        var rz = p.z * cosYaw - p.x * sinYaw;
        var ry = p.y * cosPitch - rz * sinPitch;
        var depth = p.y * sinPitch + rz * cosPitch;

        if (depth <= 0.01) continue;

        var sx = center + rx * radius;
        var sy = center - ry * radius;

        if (p.land) {
          landGlow.rect(sx - dot * 1.6, sy - dot * 1.6, dot * 3.2, dot * 3.2);

          if (p.spark) {
            sparks.rect(sx - dot * 0.8, sy - dot * 0.8, dot * 1.6, dot * 1.6);
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

      ctx.fillStyle = 'rgba(74, 130, 214, .3)';
      ctx.fill(oceanFar);
      ctx.fillStyle = 'rgba(96, 148, 226, .44)';
      ctx.fill(oceanNear);

      ctx.fillStyle = 'rgba(86, 150, 255, .08)';
      ctx.fill(landGlow);

      ctx.fillStyle = 'rgba(139, 178, 240, .56)';
      ctx.fill(landFar);
      ctx.fillStyle = 'rgba(207, 229, 255, .95)';
      ctx.fill(landNear);
      ctx.fillStyle = 'rgba(246, 250, 255, 1)';
      ctx.fill(sparks);

      ctx.restore();
    }

    function drawRim() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.998, 0, TWO_PI);
      ctx.lineWidth = Math.max(0.7, radius * 0.012);
      ctx.strokeStyle = 'rgba(158, 198, 255, .72)';
      ctx.shadowColor = 'rgba(104, 164, 255, .8)';
      ctx.shadowBlur = radius * 0.16;
      ctx.stroke();
      ctx.restore();
    }

    function drawRings(now) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, size, size);
      ctx.arc(center, center, radius * 0.98, 0, TWO_PI, true);
      ctx.clip();

      for (var i = 0; i < rings.length; i += 1) {
        var ring = rings[i];
        var tilt = ring.tilt + Math.sin(now * ring.speed + ring.phase) * 0.06;
        var rx = radius * ring.rx;
        var ry = radius * ring.ry;

        ctx.beginPath();
        ctx.ellipse(center, center, rx, ry, tilt, 0, TWO_PI);
        ctx.lineWidth = Math.max(0.55, radius * 0.013 * ring.width);
        ctx.strokeStyle = 'rgba(92, 139, 209, ' + (ring.alpha * 0.85) + ')';
        ctx.stroke();

        var angle = ((now * 0.000045 * (i % 2 ? -1 : 1) + ring.phase) % TWO_PI + TWO_PI) % TWO_PI;
        var cosTilt = Math.cos(tilt);
        var sinTilt = Math.sin(tilt);
        var ex = rx * Math.cos(angle);
        var ey = ry * Math.sin(angle);
        var px = center + ex * cosTilt - ey * sinTilt;
        var py = center + ex * sinTilt + ey * cosTilt;

        ctx.fillStyle = 'rgba(47, 98, 180, ' + Math.min(0.95, ring.alpha * 2) + ')';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, radius * 0.02), 0, TWO_PI);
        ctx.fill();
      }

      ctx.restore();
    }

    function cityPoint(city, cosYaw, sinYaw, cosPitch, sinPitch) {
      return project(city.x, city.y, city.z, cosYaw, sinYaw, cosPitch, sinPitch);
    }

    function drawConnections(now) {
      var cosYaw = Math.cos(yaw);
      var sinYaw = Math.sin(yaw);
      var cosPitch = Math.cos(pitch);
      var sinPitch = Math.sin(pitch);
      var nodes = {};

      for (var i = 0; i < arcs.length; i += 1) {
        var arc = arcs[i];
        var a = arc.a;
        var b = arc.b;
        var aPoint = cityPoint(a, cosYaw, sinYaw, cosPitch, sinPitch);
        var bPoint = cityPoint(b, cosYaw, sinYaw, cosPitch, sinPitch);
        var visible = Math.min(aPoint.z, bPoint.z);

        if (visible < 0.05) continue;

        var fade = clamp((visible - 0.05) / 0.22, 0, 1);
        var sinOmega = Math.sin(arc.omega);
        if (sinOmega < 0.0001) continue;

        var path = new Path2D();
        var started = false;
        var steps = 34;

        for (var j = 0; j <= steps; j += 1) {
          var t = j / steps;
          var wa = Math.sin((1 - t) * arc.omega) / sinOmega;
          var wb = Math.sin(t * arc.omega) / sinOmega;
          var lift = 1 + arc.lift * Math.sin(Math.PI * t);
          var point = project(
            (a.x * wa + b.x * wb) * lift,
            (a.y * wa + b.y * wb) * lift,
            (a.z * wa + b.z * wb) * lift,
            cosYaw, sinYaw, cosPitch, sinPitch
          );

          if (point.z > 0.01) {
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
        var particle = project(
          (a.x * particleA + b.x * particleB) * particleLift,
          (a.y * particleA + b.y * particleB) * particleLift,
          (a.z * particleA + b.z * particleB) * particleLift,
          cosYaw, sinYaw, cosPitch, sinPitch
        );

        ctx.save();
        ctx.lineWidth = Math.max(1.1, radius * 0.026);
        ctx.strokeStyle = 'rgba(84, 133, 205, ' + (0.2 * fade) + ')';
        ctx.stroke(path);
        ctx.lineWidth = Math.max(0.55, radius * 0.012);
        ctx.strokeStyle = 'rgba(130, 176, 238, ' + (0.62 * fade) + ')';
        ctx.stroke(path);

        if (particle.z > 0.02) {
          ctx.fillStyle = 'rgba(64, 116, 194, ' + (0.4 * fade) + ')';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, Math.max(2.2, radius * 0.038), 0, TWO_PI);
          ctx.fill();
          ctx.fillStyle = 'rgba(247, 251, 255, ' + (0.95 * fade) + ')';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, Math.max(0.9, radius * 0.011), 0, TWO_PI);
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
    }

    function drawNode(point, city, now) {
      if (point.z < 0.04) return;

      var fade = clamp((point.z - 0.04) / 0.2, 0, 1);
      var twinkle = 0.65 + 0.35 * Math.sin(now * 0.0017 + city.phase);

      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = 'rgba(139, 188, 255, .26)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(1.7, radius * 0.038) * (0.7 + twinkle * 0.4), 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(226, 242, 255, .9)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(0.85, radius * 0.012), 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }

    function drawMarker(now) {
      var cosLat = Math.cos(MARKER_LAT);
      var marker = project(
        cosLat * Math.sin(MARKER_LON),
        Math.sin(MARKER_LAT),
        cosLat * Math.cos(MARKER_LON),
        Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)
      );

      if (marker.z <= 0.03) return;

      var fade = clamp((marker.z - 0.03) / 0.2, 0, 1);
      var dot = Math.max(1.7, radius * 0.038);
      var pulse = (now % 2400) / 2400;

      ctx.save();
      ctx.globalAlpha = fade;

      var glow = ctx.createRadialGradient(marker.x, marker.y, dot, marker.x, marker.y, dot * 5);
      glow.addColorStop(0, 'rgba(255, 72, 92, .36)');
      glow.addColorStop(1, 'rgba(255, 72, 92, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dot * 5, 0, TWO_PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dot + pulse * radius * 0.2, 0, TWO_PI);
      ctx.lineWidth = Math.max(0.7, radius * 0.008);
      ctx.strokeStyle = 'rgba(255, 86, 106, ' + (0.5 * (1 - pulse)) + ')';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dot + 1, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 244, 246, .92)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(marker.x, marker.y, dot, 0, TWO_PI);
      ctx.fillStyle = CRIMSON;
      ctx.fill();

      if (showLabel) {
        var label = 'Kolkata';
        var fontSize = Math.max(6, radius * 0.052);
        var side = marker.x > center ? -1 : 1;
        ctx.font = '600 ' + fontSize + 'px "JetBrains Mono", monospace';
        var textWidth = ctx.measureText(label).width;
        var padX = fontSize * 0.5;
        var pillH = fontSize + fontSize * 0.7;
        var pillW = textWidth + padX * 2;
        var pillY = marker.y - pillH * 0.5;
        var pillX = marker.x + side * (dot + fontSize * 0.9) - (side < 0 ? pillW : 0);
        var pillR = pillH * 0.5;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fillStyle = 'rgba(4, 11, 24, .78)';
        ctx.fill();
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = 'rgba(255, 110, 128, .4)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 238, 241, .97)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pillX + padX, marker.y + fontSize * 0.04);
      }

      ctx.restore();
    }

    function draw(now) {
      if (!size) return;

      ctx.clearRect(0, 0, size, size);
      drawHalo();
      drawSphere();
      drawPoints();
      drawRim();
      drawRings(now);
      drawConnections(now);
      drawMarker(now);
    }

    /* Sizing -------------------------------------------------------------- */

    function resize() {
      if (!wrap) return;

      var nextSize = wrap.getBoundingClientRect().width;
      if (!nextSize) return;

      var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (Math.abs(nextSize - size) < 0.5 && nextDpr === dpr) return;

      size = nextSize;
      dpr = nextDpr;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      center = size / 2;
      radius = size * 0.41;
      buildPoints();
      wrap.classList.add('is-live');
      dirty = true;
    }

    /* Interaction --------------------------------------------------------- */

    function pointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      dragging = true;
      activePointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveTime = performance.now();
      moveVelocity = 0;
      tiltVelocity = 0;
      spinVelocity = 0;
      tiltSpinVelocity = 0;
      moved = false;
      suppressClick = false;
      lastInteraction = performance.now();

      canvas.classList.add('is-dragging');
      if (hint) hint.classList.add('is-hidden');

      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch (error) {
          /* Pointer capture is a progressive enhancement. */
        }
      }
    }

    function pointerMove(event) {
      if (!dragging || event.pointerId !== activePointer) return;

      var now = performance.now();
      var dx = event.clientX - lastX;
      var dy = event.clientY - lastY;
      var elapsed = Math.max(8, now - lastMoveTime) / 1000;

      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;

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
      spinVelocity = reducedMotion ? 0 : clamp(moveVelocity, -3, 3);
      tiltSpinVelocity = reducedMotion ? 0 : clamp(tiltVelocity, -3, 3);

      if (moved) {
        suppressClick = true;
        clearTimeout(suppressTimer);
        suppressTimer = setTimeout(function () { suppressClick = false; }, 500);
      }

      canvas.classList.remove('is-dragging');
      if (canvas.releasePointerCapture && canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    }

    canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('dragstart', function (event) { event.preventDefault(); });
    canvas.addEventListener('click', function (event) {
      var staticDevice = device && device.classList.contains('is-static');
      if (!staticDevice && !suppressClick) return;

      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
      clearTimeout(suppressTimer);
    });

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
      new ResizeObserver(resize).observe(wrap);
    } else {
      window.addEventListener('resize', resize);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) dirty = true;
      }, { rootMargin: '80px' }).observe(canvas);
    }

    buildScene();
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

          if (!reducedMotion && now - lastInteraction > 1600) {
            yaw += autoSpin * delta;
          }
        }

        draw(now);
        dirty = false;
      }

      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
    return true;
  }

  for (var i = 0; i < canvases.length; i += 1) {
    createGlobe(canvases[i]);
  }
})();
