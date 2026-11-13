/* ==========================================================================
   ARKA PATRA — interactive globe
   Orthographic canvas globe built from Natural Earth land geometry.
   Drag or use the arrow keys to rotate; double-click or Home to reset.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('globeCanvas');
  if (!canvas || !canvas.getContext) return;

  var panel = document.getElementById('globePanel') || canvas.parentNode;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;
  var RAD = Math.PI / 180;

  var HOME = { lat: 22.57, lon: 88.36 };
  var START_YAW = -HOME.lon * RAD;
  var START_PITCH = HOME.lat * RAD;
  var MAX_PITCH = Math.PI / 2 - 0.08;

  var yaw = START_YAW;
  var pitch = START_PITCH;
  var yawVelocity = 0;
  var pitchVelocity = 0;
  var dragging = false;
  var pointerId = null;
  var pointerX = 0;
  var pointerY = 0;
  var lastInteraction = 0;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var cx = 0;
  var cy = 0;
  var radius = 0;

  var sphere = document.createElement('canvas');
  var sphereCtx = sphere.getContext('2d');
  var sphereData = null;
  var cache = null;
  var cachePitch = null;

  var LAND_W = 1024;
  var LAND_H = 512;
  var landMask = null;
  var coastMask = null;
  var landReady = false;

  var raf = 0;
  var lastFrame = 0;
  var inView = true;

  var nodes = [
    { key: 'in', lat: HOME.lat, lon: HOME.lon, color: '#4CC9F0' },
    { key: 'eu', lat: 50.11, lon: 8.68, color: '#8B7CF6' },
    { key: 'us', lat: 40.71, lon: -74.01, color: '#F5B94A' },
    { key: 'apac', lat: 1.35, lon: 103.82, color: '#34D399' }
  ];

  var extraDots = [
    { lat: 35.68, lon: 139.69, color: 'rgba(76,201,240,.5)' },
    { lat: -33.87, lon: 151.21, color: 'rgba(139,124,246,.45)' },
    { lat: -23.55, lon: -46.63, color: 'rgba(52,211,153,.4)' },
    { lat: 25.20, lon: 55.27, color: 'rgba(245,185,74,.4)' },
    { lat: 51.51, lon: -0.12, color: 'rgba(76,201,240,.36)' }
  ];

  var labels = {};
  var labelSizes = {};
  nodes.forEach(function (node) {
    labels[node.key] = document.querySelector('[data-globe-label="' + node.key + '"]');
  });
  var hint = document.getElementById('globeHint');

  var arcs = nodes.slice(1).map(function (node, index) {
    return {
      color: node.color,
      points: greatCircle(nodes[0], node),
      phase: index * 0.31
    };
  });

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function latLonVector(lat, lon) {
    var la = lat * RAD;
    var lo = lon * RAD;
    var cosLat = Math.cos(la);
    return {
      x: cosLat * Math.sin(lo),
      y: Math.sin(la),
      z: cosLat * Math.cos(lo)
    };
  }

  function projectVector(vector, altitude) {
    var alt = altitude || 1;
    var cosYaw = Math.cos(yaw);
    var sinYaw = Math.sin(yaw);
    var x = vector.x * cosYaw + vector.z * sinYaw;
    var z = -vector.x * sinYaw + vector.z * cosYaw;
    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);
    var y = vector.y * cosPitch - z * sinPitch;
    z = vector.y * sinPitch + z * cosPitch;
    return {
      x: cx + x * radius * alt,
      y: cy - y * radius * alt,
      z: z
    };
  }

  function project(lat, lon, altitude) {
    return projectVector(latLonVector(lat, lon), altitude);
  }

  function greatCircle(a, b) {
    var va = latLonVector(a.lat, a.lon);
    var vb = latLonVector(b.lat, b.lon);
    var dot = clamp(va.x * vb.x + va.y * vb.y + va.z * vb.z, -1, 1);
    var omega = Math.acos(dot);
    var sinOmega = Math.sin(omega);
    var points = [];
    var steps = 72;

    for (var i = 0; i <= steps; i += 1) {
      var t = i / steps;
      var s1;
      var s2;

      if (sinOmega < 0.0001) {
        s1 = 1 - t;
        s2 = t;
      } else {
        s1 = Math.sin((1 - t) * omega) / sinOmega;
        s2 = Math.sin(t * omega) / sinOmega;
      }

      var alt = 1.016;
      points.push({
        x: (va.x * s1 + vb.x * s2) * alt,
        y: (va.y * s1 + vb.y * s2) * alt,
        z: (va.z * s1 + vb.z * s2) * alt
      });
    }

    return points;
  }

  function measureLabels() {
    if (!labels.in) return;
    Object.keys(labels).forEach(function (key) {
      var label = labels[key];
      if (!label) return;
      labelSizes[key] = {
        width: label.offsetWidth,
        height: label.offsetHeight
      };
    });
  }

  function resize() {
    if (!panel) return;
    width = Math.max(1, panel.clientWidth);
    height = Math.max(1, panel.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cx = width / 2;
    cy = height / 2;
    radius = Math.min(width, height) * 0.37;

    cache = null;
    cachePitch = null;
    sphereData = null;
    measureLabels();
  }

  function buildCache() {
    var size = Math.max(2, Math.round(radius * 2));
    var center = size / 2;
    var max = size * size;

    sphere.width = size;
    sphere.height = size;
    sphereData = sphereCtx.createImageData(size, size);

    var indices = new Int32Array(max);
    var lonBase = new Float32Array(max);
    var vRow = new Int32Array(max);
    var vMix = new Float32Array(max);
    var light = new Float32Array(max);
    var rim = new Float32Array(max);
    var count = 0;

    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);
    var lightX = -0.45;
    var lightY = 0.55;
    var lightZ = 0.70;

    for (var py = 0; py < size; py += 1) {
      var dy = (center - py - 0.5) / center;

      for (var px = 0; px < size; px += 1) {
        var dx = (px + 0.5 - center) / center;
        var r2 = dx * dx + dy * dy;
        if (r2 > 1) continue;

        var dz = Math.sqrt(1 - r2);

        /* Undo the pitch rotation, then the yaw rotation. */
        var y1 = dy * cosPitch + dz * sinPitch;
        var z1 = -dy * sinPitch + dz * cosPitch;
        var lat = Math.asin(clamp(y1, -1, 1));
        var row = (0.5 - lat / Math.PI) * LAND_H;
        var rowFloor = Math.floor(row);
        if (rowFloor < 0) rowFloor = 0;
        if (rowFloor >= LAND_H) rowFloor = LAND_H - 1;

        indices[count] = (py * size + px) * 4;
        lonBase[count] = Math.atan2(dx, z1);
        vRow[count] = rowFloor;
        vMix[count] = clamp(row - rowFloor, 0, 1);
        light[count] = clamp(dx * lightX + dy * lightY + dz * lightZ, 0, 1);
        rim[count] = Math.pow(r2, 8);
        count += 1;
      }
    }

    cache = {
      count: count,
      indices: indices,
      lonBase: lonBase,
      vRow: vRow,
      vMix: vMix,
      light: light,
      rim: rim,
      size: size
    };
    cachePitch = pitch;
  }

  function buildLand(geo) {
    var landCanvas = document.createElement('canvas');
    landCanvas.width = LAND_W;
    landCanvas.height = LAND_H;
    var landCtx = landCanvas.getContext('2d');

    var coastCanvas = document.createElement('canvas');
    coastCanvas.width = LAND_W;
    coastCanvas.height = LAND_H;
    var coastCtx = coastCanvas.getContext('2d');

    landCtx.fillStyle = '#000';
    landCtx.fillRect(0, 0, LAND_W, LAND_H);
    coastCtx.fillStyle = '#000';
    coastCtx.fillRect(0, 0, LAND_W, LAND_H);

    function tracePath(target, ring) {
      for (var i = 0; i < ring.length; i += 1) {
        var x = (ring[i][0] + 180) / 360 * LAND_W;
        var y = (90 - ring[i][1]) / 180 * LAND_H;
        if (i === 0) target.moveTo(x, y);
        else target.lineTo(x, y);
      }
      target.closePath();
    }

    geo.features.forEach(function (feature) {
      var geometry = feature.geometry;
      if (!geometry) return;
      var polygons = geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];

      polygons.forEach(function (polygon) {
        if (!polygon.length) return;

        landCtx.beginPath();
        polygon.forEach(function (ring) { tracePath(landCtx, ring); });
        landCtx.fillStyle = '#fff';
        landCtx.fill('evenodd');

        polygon.forEach(function (ring) {
          coastCtx.beginPath();
          tracePath(coastCtx, ring);
          coastCtx.strokeStyle = '#fff';
          coastCtx.lineWidth = 2.6;
          coastCtx.lineJoin = 'round';
          coastCtx.stroke();
        });
      });
    });

    landMask = landCtx.getImageData(0, 0, LAND_W, LAND_H).data;
    coastMask = coastCtx.getImageData(0, 0, LAND_W, LAND_H).data;
    landReady = true;
  }

  function paintSphere() {
    if (!cache || Math.abs(pitch - cachePitch) > 0.0012) buildCache();

    var data = sphereData.data;
    var count = cache.count;
    var indices = cache.indices;
    var lonBase = cache.lonBase;
    var vRow = cache.vRow;
    var vMix = cache.vMix;
    var light = cache.light;
    var rim = cache.rim;

    for (var i = 0; i < count; i += 1) {
      var lon = lonBase[i] - yaw;
      var u = (lon / TAU + 0.5) * LAND_W;
      var uFloor = Math.floor(u);
      var uMix = u - uFloor;
      uFloor = ((uFloor % LAND_W) + LAND_W) % LAND_W;
      var uNext = uFloor + 1;
      if (uNext >= LAND_W) uNext = 0;

      var row = vRow[i];
      var rowNext = row + 1;
      if (rowNext >= LAND_H) rowNext = LAND_H - 1;
      var vMixValue = vMix[i];

      var i00 = (row * LAND_W + uFloor) * 4;
      var i10 = (row * LAND_W + uNext) * 4;
      var i01 = (rowNext * LAND_W + uFloor) * 4;
      var i11 = (rowNext * LAND_W + uNext) * 4;

      var top = landMask[i00] * (1 - uMix) + landMask[i10] * uMix;
      var bottom = landMask[i01] * (1 - uMix) + landMask[i11] * uMix;
      var cover = (top * (1 - vMixValue) + bottom * vMixValue) / 255;

      var coastTop = coastMask[i00] * (1 - uMix) + coastMask[i10] * uMix;
      var coastBottom = coastMask[i01] * (1 - uMix) + coastMask[i11] * uMix;
      var coast = (coastTop * (1 - vMixValue) + coastBottom * vMixValue) / 255;

      var lit = light[i];
      var edge = rim[i];

      var oceanR = 4 + 12 * lit + 16 * edge;
      var oceanG = 24 + 50 * lit + 42 * edge;
      var oceanB = 58 + 100 * lit + 76 * edge;

      var landR = 32 + 76 * lit;
      var landG = 136 + 108 * lit;
      var landB = 196 + 58 * lit;

      var r = oceanR + (landR - oceanR) * cover;
      var g = oceanG + (landG - oceanG) * cover;
      var b = oceanB + (landB - oceanB) * cover;

      var coastGlow = clamp(coast * 1.3, 0, 1);
      r += coastGlow * 58 + edge * 20;
      g += coastGlow * 78 + edge * 42;
      b += coastGlow * 72 + edge * 52;

      var offset = indices[i];
      data[offset] = r > 255 ? 255 : r;
      data[offset + 1] = g > 255 ? 255 : g;
      data[offset + 2] = b > 255 ? 255 : b;
      data[offset + 3] = 255;
    }

    sphereCtx.putImageData(sphereData, 0, 0);
  }

  function drawGlow() {
    var glow = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.8);
    glow.addColorStop(0, 'rgba(33, 143, 255, .22)');
    glow.addColorStop(0.5, 'rgba(33, 143, 255, .09)');
    glow.addColorStop(0.76, 'rgba(62, 190, 255, .035)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.8, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.setLineDash([2, 7]);
    ctx.strokeStyle = 'rgba(76, 201, 240, .22)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.16, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawRim() {
    ctx.save();
    ctx.strokeStyle = 'rgba(126, 231, 255, .5)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(76, 201, 240, .9)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawParallel(lat, steps) {
    var started = false;
    ctx.beginPath();

    for (var i = 0; i <= steps; i += 1) {
      var point = project(lat, -180 + (360 * i) / steps);
      if (point.z > 0.015) {
        if (!started) {
          ctx.moveTo(point.x, point.y);
          started = true;
        } else {
          ctx.lineTo(point.x, point.y);
        }
      } else {
        started = false;
      }
    }

    ctx.stroke();
  }

  function drawMeridian(lon, steps) {
    var started = false;
    ctx.beginPath();

    for (var i = 0; i <= steps; i += 1) {
      var point = project(-90 + (180 * i) / steps, lon);
      if (point.z > 0.015) {
        if (!started) {
          ctx.moveTo(point.x, point.y);
          started = true;
        } else {
          ctx.lineTo(point.x, point.y);
        }
      } else {
        started = false;
      }
    }

    ctx.stroke();
  }

  function drawGraticule() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.clip();
    ctx.strokeStyle = 'rgba(140, 230, 255, .09)';
    ctx.lineWidth = 0.55;

    for (var lat = -60; lat <= 60; lat += 30) {
      drawParallel(lat, 120);
    }

    for (var lon = -180; lon < 180; lon += 30) {
      drawMeridian(lon, 60);
    }

    ctx.restore();
  }

  function drawArcs(now) {
    ctx.save();

    arcs.forEach(function (arc) {
      var started = false;
      ctx.beginPath();

      for (var i = 0; i < arc.points.length; i += 1) {
        var point = projectVector(arc.points[i], 1);
        if (point.z > 0.04) {
          if (!started) {
            ctx.moveTo(point.x, point.y);
            started = true;
          } else {
            ctx.lineTo(point.x, point.y);
          }
        } else {
          started = false;
        }
      }

      ctx.strokeStyle = 'rgba(98, 214, 255, .3)';
      ctx.lineWidth = 0.8;
      ctx.shadowColor = 'rgba(76, 201, 240, .55)';
      ctx.shadowBlur = 5;
      ctx.stroke();

      if (!reducedMotion) {
        var t = (now * 0.000075 + arc.phase) % 1;
        var index = Math.min(arc.points.length - 1, Math.floor(t * arc.points.length));
        var pulse = projectVector(arc.points[index], 1);

        if (pulse.z > 0.06) {
          ctx.fillStyle = arc.color;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, 1.5, 0, TAU);
          ctx.fill();
        }
      }
    });

    ctx.restore();
  }

  function drawMarkers(now) {
    ctx.save();

    extraDots.forEach(function (dot) {
      var point = project(dot.lat, dot.lon, 1.006);
      if (point.z <= 0.02) return;
      ctx.fillStyle = dot.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.1, 0, TAU);
      ctx.fill();
    });

    var time = reducedMotion ? 0 : now;
    var home = project(HOME.lat, HOME.lon, 1.006);

    if (home.z > 0.02) {
      for (var ring = 0; ring < 2; ring += 1) {
        var phase = ((time * 0.00055) + ring * 0.5) % 1;
        ctx.strokeStyle = 'rgba(120, 230, 255, ' + (0.5 * (1 - phase)) + ')';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(home.x, home.y, 3 + phase * 13, 0, TAU);
        ctx.stroke();
      }

      ctx.fillStyle = '#eaffff';
      ctx.shadowColor = '#4CC9F0';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(home.x, home.y, 3, 0, TAU);
      ctx.fill();
    }

    nodes.slice(1).forEach(function (node) {
      var point = project(node.lat, node.lon, 1.008);
      if (point.z <= 0.02) return;
      ctx.fillStyle = node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.9, 0, TAU);
      ctx.fill();
    });

    ctx.restore();
  }

  function updateLabels() {
    nodes.forEach(function (node) {
      var label = labels[node.key];
      if (!label) return;

      var point = project(node.lat, node.lon, 1.006);
      if (point.z <= 0.02) {
        label.style.opacity = '0';
        return;
      }

      var size = labelSizes[node.key] || { width: 70, height: 18 };
      var gap = 9;
      var left = point.x - size.width / 2;
      var top = point.y - size.height - gap;

      left = clamp(left, 4, Math.max(4, width - size.width - 4));
      if (top < 4) top = point.y + gap;
      top = clamp(top, 4, Math.max(4, height - size.height - 4));

      label.style.transform = 'translate3d(' + left + 'px,' + top + 'px,0)';
      label.style.opacity = '1';
    });
  }

  function drawPlaceholder() {
    drawGlow();

    var body = ctx.createRadialGradient(
      cx - radius * 0.35, cy - radius * 0.4, radius * 0.05,
      cx, cy, radius
    );
    body.addColorStop(0, '#135b9e');
    body.addColorStop(0.55, '#083766');
    body.addColorStop(1, '#041426');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();
  }

  function draw(now) {
    if (!width || !height) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!landReady) {
      drawPlaceholder();
    } else {
      paintSphere();
      drawGlow();
      ctx.drawImage(sphere, cx - radius, cy - radius, radius * 2, radius * 2);
    }

    drawRim();
    drawGraticule();
    drawArcs(now);
    drawMarkers(now);
    updateLabels();
  }

  function resetGlobe() {
    yaw = START_YAW;
    pitch = START_PITCH;
    yawVelocity = 0;
    pitchVelocity = 0;
    cachePitch = null;
    lastInteraction = performance.now();
  }

  function markInteraction() {
    lastInteraction = performance.now();
    if (hint) hint.classList.add('is-used');
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    yawVelocity = 0;
    pitchVelocity = 0;
    canvas.classList.add('is-dragging');
    markInteraction();

    if (canvas.focus) {
      try { canvas.focus({ preventScroll: true }); } catch (error) { canvas.focus(); }
    }

    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(pointerId); } catch (error) {}
    }

    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== pointerId) return;

    var dx = event.clientX - pointerX;
    var dy = event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;

    var speed = 0.0065;
    yaw += dx * speed;
    pitch = clamp(pitch + dy * speed, -MAX_PITCH, MAX_PITCH);
    yawVelocity = dx * speed;
    pitchVelocity = dy * speed;
    lastInteraction = performance.now();
    event.preventDefault();
  }

  function endDrag(event) {
    if (!dragging || (event && event.pointerId !== pointerId)) return;
    dragging = false;
    pointerId = null;
    canvas.classList.remove('is-dragging');
    lastInteraction = performance.now();
  }

  function onKeyDown(event) {
    var step = 0.09;
    var handled = true;

    if (event.key === 'ArrowLeft') yaw -= step;
    else if (event.key === 'ArrowRight') yaw += step;
    else if (event.key === 'ArrowUp') pitch = clamp(pitch + step, -MAX_PITCH, MAX_PITCH);
    else if (event.key === 'ArrowDown') pitch = clamp(pitch - step, -MAX_PITCH, MAX_PITCH);
    else if (event.key === 'Home') resetGlobe();
    else handled = false;

    if (!handled) return;
    yawVelocity = 0;
    pitchVelocity = 0;
    markInteraction();
    event.preventDefault();
  }

  function frame(now) {
    raf = window.requestAnimationFrame(frame);
    if (!inView || document.hidden) return;

    if (!lastFrame) lastFrame = now - 33;
    var delta = now - lastFrame;
    if (delta < 33) return;
    lastFrame = now;

    var factor = Math.min(delta, 80) / 16.667;

    if (!dragging) {
      if (!reducedMotion) {
        yaw += yawVelocity * factor;
        pitch = clamp(pitch + pitchVelocity * factor, -MAX_PITCH, MAX_PITCH);

        var damp = Math.pow(0.93, factor);
        yawVelocity *= damp;
        pitchVelocity *= damp;
        if (Math.abs(yawVelocity) < 0.00005) yawVelocity = 0;
        if (Math.abs(pitchVelocity) < 0.00005) pitchVelocity = 0;

        if (now - lastInteraction > 4500) {
          yaw += 0.0019 * factor;
        }
      } else {
        yawVelocity = 0;
        pitchVelocity = 0;
      }
    }

    draw(now);
  }

  function start() {
    resize();
    lastInteraction = performance.now();
    raf = window.requestAnimationFrame(frame);

    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(function () { resize(); });
      observer.observe(panel);
    } else {
      window.addEventListener('resize', resize);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureLabels);
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('dblclick', resetGlobe);

  if ('IntersectionObserver' in window) {
    var visibilityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    visibilityObserver.observe(panel);
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      lastFrame = 0;
      lastInteraction = performance.now();
    }
  });

  start();

  fetch('assets/world-land-110m.json')
    .then(function (response) {
      if (!response.ok) throw new Error('land data unavailable');
      return response.json();
    })
    .then(buildLand)
    .catch(function () {
      landReady = false;
    });
})();
