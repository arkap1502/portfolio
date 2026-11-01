/* ==========================================================================
   Arka Patra — landing globe
   A hand-built wireframe Earth: slow auto-spin, drag to rotate,
   momentum on release, and keyboard-free decorative interaction.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('landingGlobe');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var hint = document.querySelector('.globe-hint');
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  var TWO_PI = Math.PI * 2;
  var DEG = Math.PI / 180;
  var ROTATE_PER_PX = 0.0055;
  var TILT_PER_PX = 0.004;
  var INK = 'rgba(90, 101, 120, ';
  var CRIMSON = '#B5303C';
  var MARKER_LAT = 22.57 * DEG;
  var MARKER_LON = 88.36 * DEG;

  var LATITUDES = [-80, -60, -40, -20, 0, 20, 40, 60, 80].map(function (value) {
    return value * DEG;
  });

  var reducedMotion = motionQuery ? motionQuery.matches : false;
  var dpr = 1;
  var size = 0;
  var centerX = 0;
  var centerY = 0;
  var radius = 0;
  var yaw = -0.65;
  var pitch = 0.22;
  var dragging = false;
  var activePointer = null;
  var lastX = 0;
  var lastY = 0;
  var lastMoveTime = 0;
  var moveVelocity = 0;
  var spinVelocity = 0;
  var tiltVelocity = 0;
  var tiltSpinVelocity = 0;
  var lastInteraction = 0;
  var hintDismissed = false;
  var onScreen = true;
  var dirty = true;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

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
    centerY = size * 0.4846;
    radius = size * 0.377;
    dirty = true;
  }

  /* Orthographic projection of a point on the sphere. ------------------- */
  function project(lat, lon) {
    var cosLat = Math.cos(lat);
    var x = cosLat * Math.sin(lon + yaw);
    var y = Math.sin(lat);
    var z = cosLat * Math.cos(lon + yaw);
    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);

    return [
      centerX + x * radius,
      centerY - (y * cosPitch - z * sinPitch) * radius,
      y * sinPitch + z * cosPitch
    ];
  }

  /* Split a projected line into its near and far halves. ---------------- */
  function strokeLine(points) {
    var front = new Path2D();
    var back = new Path2D();

    for (var i = 0; i < points.length - 1; i += 1) {
      var a = points[i];
      var b = points[i + 1];
      var path = (a[2] + b[2]) * 0.5 >= 0 ? front : back;
      path.moveTo(a[0], a[1]);
      path.lineTo(b[0], b[1]);
    }

    ctx.strokeStyle = INK + '.34)';
    ctx.stroke(front);
    ctx.strokeStyle = INK + '.1)';
    ctx.stroke(back);
  }

  function drawGraticule() {
    var latIndex;
    var lonIndex;
    var step;
    var points;

    for (latIndex = 0; latIndex < LATITUDES.length; latIndex += 1) {
      points = [];
      for (step = 0; step <= TWO_PI + 0.08; step += 0.08) {
        points.push(project(LATITUDES[latIndex], step));
      }
      strokeLine(points);
    }

    for (lonIndex = 0; lonIndex < 12; lonIndex += 1) {
      points = [];
      for (step = -Math.PI / 2; step <= Math.PI / 2 + 0.07; step += 0.07) {
        points.push(project(step, lonIndex * (TWO_PI / 12)));
      }
      strokeLine(points);
    }
  }

  function drawOrbitRing() {
    var scale = radius / 188;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-22 * DEG);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.163, radius * 0.571, 0, 0, TWO_PI);
    ctx.setLineDash([3 * scale, 9 * scale]);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(181, 48, 60, .34)';
    ctx.stroke();
    ctx.restore();
    ctx.setLineDash([]);
  }

  function drawMarker(now) {
    var marker = project(MARKER_LAT, MARKER_LON);
    var depth = marker[2];
    var frontAlpha = depth > 0 ? clamp((depth - 0.02) / 0.26, 0, 1) : 0;
    var backAlpha = depth <= 0 ? clamp(-depth / 0.2, 0, 1) * 0.2 : 0;
    var fade = Math.max(frontAlpha, backAlpha);
    if (!fade) return;

    var dot = Math.max(3.5, radius * 0.035);
    var ring = dot * 2.35;

    ctx.globalAlpha = fade;

    ctx.beginPath();
    ctx.arc(marker[0], marker[1], ring, 0, TWO_PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(181, 48, 60, .32)';
    ctx.stroke();

    if (!reducedMotion && frontAlpha > 0) {
      var pulse = (Math.sin(now / 900) + 1) / 2;
      ctx.beginPath();
      ctx.arc(marker[0], marker[1], ring + pulse * 7, 0, TWO_PI);
      ctx.strokeStyle = 'rgba(181, 48, 60, ' + (.18 * (1 - pulse)) + ')';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(marker[0], marker[1], dot, 0, TWO_PI);
    ctx.fillStyle = CRIMSON;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    if (!size) return;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = INK + '.46)';
    ctx.stroke();

    drawGraticule();
    drawOrbitRing();
    drawMarker(now);
  }

  function dismissHint() {
    if (hintDismissed || !hint) return;
    hintDismissed = true;
    hint.classList.add('is-hidden');
  }

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
    lastInteraction = performance.now();

    canvas.classList.add('is-dragging');
    dismissHint();

    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
  }

  function pointerMove(event) {
    if (!dragging || event.pointerId !== activePointer) return;

    var now = performance.now();
    var dx = event.clientX - lastX;
    var dy = event.clientY - lastY;
    var elapsed = Math.max(8, now - lastMoveTime) / 1000;

    yaw += dx * ROTATE_PER_PX;
    pitch = (pitch + dy * TILT_PER_PX) % TWO_PI;
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
    spinVelocity = reducedMotion ? 0 : clamp(moveVelocity, -4, 4);
    tiltSpinVelocity = reducedMotion ? 0 : clamp(tiltVelocity, -4, 4);

    canvas.classList.remove('is-dragging');
    if (canvas.releasePointerCapture && canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);

  if (motionQuery) {
    var onMotionChange = function (event) {
      reducedMotion = event.matches;
      if (reducedMotion) {
        spinVelocity = 0;
        tiltSpinVelocity = 0;
      }
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
          pitch = (pitch + tiltSpinVelocity * delta) % TWO_PI;
          tiltSpinVelocity *= Math.exp(-3.2 * delta);
          if (Math.abs(tiltSpinVelocity) < 0.003) tiltSpinVelocity = 0;
        }

        if (!reducedMotion && now - lastInteraction > 2200) {
          yaw += 0.055 * delta;
        }
      }

      draw(now);
      dirty = false;
    }

    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();
