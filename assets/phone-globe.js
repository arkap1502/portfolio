/* ==========================================================================
   Arka Patra — entry phone globe
   A small wireframe Earth inside the phone cover: slow auto-spin,
   drag to rotate, and momentum on release.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('entryPhoneGlobe');
  if (!canvas || !canvas.getContext) return;

  var wrap = canvas.closest('.phone-globe-wrap');
  var phone = canvas.closest('.device--phone');
  var hint = wrap ? wrap.querySelector('.phone-globe-hint') : null;
  var ctx = canvas.getContext('2d');
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  if (!wrap || !ctx) return;

  var TWO_PI = Math.PI * 2;
  var DEG = Math.PI / 180;
  var ROTATE_PER_PX = 0.012;
  var TILT_PER_PX = 0.008;
  var MARKER_LAT = -20 * DEG;
  var MARKER_LON = -15 * DEG;
  var GRID_RGB = '207, 214, 225';
  var CRIMSON = '#B5303C';

  var LATITUDES = [-80, -60, -40, -20, 0, 20, 40, 60, 80].map(function (value) {
    return value * DEG;
  });

  var reducedMotion = motionQuery ? motionQuery.matches : false;
  var size = 0;
  var dpr = 1;
  var center = 0;
  var radius = 0;
  var yaw = -0.45;
  var pitch = 0.16;
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

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

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
    radius = size * 0.4;
    dirty = true;
    wrap.classList.add('is-live');
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
      center + x * radius,
      center - (y * cosPitch - z * sinPitch) * radius,
      y * sinPitch + z * cosPitch
    ];
  }

  function strokeLine(points, frontAlpha, backAlpha) {
    var front = new Path2D();
    var back = new Path2D();

    for (var i = 0; i < points.length - 1; i += 1) {
      var a = points[i];
      var b = points[i + 1];
      var path = (a[2] + b[2]) * 0.5 >= 0 ? front : back;
      path.moveTo(a[0], a[1]);
      path.lineTo(b[0], b[1]);
    }

    var lineWidth = Math.max(0.55, size / 220);
    ctx.lineWidth = lineWidth;

    ctx.strokeStyle = 'rgba(' + GRID_RGB + ', ' + backAlpha + ')';
    ctx.stroke(back);

    ctx.strokeStyle = 'rgba(' + GRID_RGB + ', ' + frontAlpha + ')';
    ctx.stroke(front);
  }

  function drawGraticule() {
    var latIndex;
    var lonIndex;
    var step;
    var points;

    for (latIndex = 0; latIndex < LATITUDES.length; latIndex += 1) {
      points = [];
      for (step = 0; step <= TWO_PI + 0.06; step += 0.08) {
        points.push(project(LATITUDES[latIndex], step));
      }
      strokeLine(points, 0.62, 0.2);
    }

    for (lonIndex = 0; lonIndex < 12; lonIndex += 1) {
      points = [];
      for (step = -Math.PI / 2; step <= Math.PI / 2 + 0.06; step += 0.06) {
        points.push(project(step, lonIndex * (TWO_PI / 12)));
      }
      strokeLine(points, 0.52, 0.16);
    }
  }

  function drawOutline() {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, TWO_PI);
    ctx.lineWidth = Math.max(0.8, (1.1 * size) / 220);
    ctx.strokeStyle = 'rgba(' + GRID_RGB + ', .9)';
    ctx.stroke();
  }

  function drawOrbit() {
    var k = size / 220;

    ctx.save();
    ctx.lineWidth = Math.max(0.8, 1.6 * k);
    ctx.strokeStyle = 'rgba(181, 48, 60, .8)';
    ctx.beginPath();
    ctx.moveTo(42 * k, 62 * k);
    ctx.bezierCurveTo(82 * k, 20 * k, 158 * k, 27 * k, 188 * k, 86 * k);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(172 * k, 58 * k, Math.max(1.8, 3.4 * k), 0, TWO_PI);
    ctx.fillStyle = CRIMSON;
    ctx.fill();
    ctx.restore();
  }

  function drawMarker() {
    var marker = project(MARKER_LAT, MARKER_LON);
    if (marker[2] <= 0.02) return;

    var fade = clamp((marker[2] - 0.02) / 0.25, 0, 1);
    var dot = Math.max(1.8, radius * 0.035);

    ctx.globalAlpha = fade;
    ctx.beginPath();
    ctx.arc(marker[0], marker[1], dot, 0, TWO_PI);
    ctx.fillStyle = CRIMSON;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!size) return;

    ctx.clearRect(0, 0, size, size);
    drawGraticule();
    drawOutline();
    drawMarker();
    drawOrbit();
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
    pitch = clamp(pitch + dy * TILT_PER_PX, -1.15, 1.15);
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
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('click', function (event) {
    var staticPhone = phone && phone.classList.contains('is-static');
    if (!staticPhone && !suppressClick) return;

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
          pitch = clamp(pitch + tiltSpinVelocity * delta, -1.15, 1.15);
          tiltSpinVelocity *= Math.exp(-3.2 * delta);
          if (Math.abs(tiltSpinVelocity) < 0.003) tiltSpinVelocity = 0;
        }

        if (!reducedMotion && now - lastInteraction > 1600) {
          yaw += 0.07 * delta;
        }
      }

      draw();
      dirty = false;
    }

    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();
