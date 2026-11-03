/* ==========================================================================
   Arka Patra — landing globe
   A real Earth on the home hero: an equirectangular atlas texture sampled by
   a WebGL sphere shader, with drag rotation and momentum. A transparent 2D
   overlay carries the atmosphere, orbit ring and the West Bengal marker.

   The atlas texture is rendered from Natural Earth 1:110m admin-0 country
   and lake data (public domain) into assets/earth-atlas.png.
   ========================================================================== */

(function () {
  'use strict';

  var canvas = document.getElementById('landingGlobe');
  var overlay = document.getElementById('landingGlobeOverlay');
  if (!canvas || !overlay || !overlay.getContext) return;

  var ctx = overlay.getContext('2d');
  var hint = document.querySelector('.globe-hint');
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  if (!ctx) return;

  var TWO_PI = Math.PI * 2;
  var DEG = Math.PI / 180;
  var ROTATE_PER_PX = 0.0055;
  var TILT_PER_PX = 0.004;
  var CRIMSON = '#B5303C';
  var MARKER_LAT = 22.57 * DEG;
  var MARKER_LON = 88.36 * DEG;
  var TEXTURE_URL = 'assets/earth-atlas.png';

  var reducedMotion = motionQuery ? motionQuery.matches : false;
  var dpr = 1;
  var size = 0;
  var centerX = 0;
  var centerY = 0;
  var radius = 0;
  var yaw = -1.25;
  var pitch = 0.2;
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

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* WebGL sphere ---------------------------------------------------------- */

  var gl = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    }) || canvas.getContext('experimental-webgl');
  } catch (error) {
    gl = null;
  }

  var program = null;
  var texture = null;
  var uniforms = {};

  var VERTEX_SHADER = [
    'attribute vec2 aPosition;',
    'void main() {',
    '  gl_Position = vec4(aPosition, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAGMENT_SHADER = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    '',
    'uniform vec2 uResolution;',
    'uniform float uRadius;',
    'uniform float uYaw;',
    'uniform float uPitch;',
    'uniform vec3 uLight;',
    'uniform sampler2D uTexture;',
    '',
    'const float PI = 3.141592653589793;',
    '',
    'void main() {',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uRadius;',
    '  float r2 = dot(p, p);',
    '  float edge = 1.4 / uRadius;',
    '  if (r2 > (1.0 + edge) * (1.0 + edge)) discard;',
    '',
    '  float z = sqrt(max(0.0, 1.0 - r2));',
    '  float cp = cos(uPitch);',
    '  float sp = sin(uPitch);',
    '  float cy = cos(uYaw);',
    '  float sy = sin(uYaw);',
    '',
    '  // View space back to Earth-fixed coordinates.',
    '  vec3 v = vec3(p.x, p.y * cp + z * sp, -p.y * sp + z * cp);',
    '  vec3 e = vec3(v.x * cy - v.z * sy, v.y, v.x * sy + v.z * cy);',
    '',
    '  float lat = asin(clamp(e.y, -1.0, 1.0));',
    '  float lon = atan(e.x, e.z);',
    '  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);',
    '',
    '  vec3 color = texture2D(uTexture, uv).rgb;',
    '',
    '  // Gentle upper-left light and a soft limb, so the map reads as a sphere.',
    '  vec3 normal = vec3(p.x, p.y, z);',
    '  float diffuse = max(dot(normal, normalize(uLight)), 0.0);',
    '  float rim = smoothstep(0.55, 1.0, sqrt(r2));',
    '  float shade = (0.9 + 0.15 * diffuse) * (1.0 - 0.13 * rim);',
    '  color *= shade;',
    '  color = mix(color, vec3(0.54, 0.65, 0.79), 0.16 * smoothstep(0.86, 1.0, sqrt(r2)));',
    '',
    '  float alpha = 1.0 - smoothstep(1.0 - edge, 1.0, sqrt(r2));',
    '  gl_FragColor = vec4(color, alpha);',
    '}'
  ].join('\n');

  function compileShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initGL() {
    if (!gl) return false;

    var vertex = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    var fragment = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return false;

    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      program = null;
      return false;
    }

    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    var position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    uniforms.resolution = gl.getUniformLocation(program, 'uResolution');
    uniforms.radius = gl.getUniformLocation(program, 'uRadius');
    uniforms.yaw = gl.getUniformLocation(program, 'uYaw');
    uniforms.pitch = gl.getUniformLocation(program, 'uPitch');
    uniforms.light = gl.getUniformLocation(program, 'uLight');
    uniforms.texture = gl.getUniformLocation(program, 'uTexture');

    // The shader is the only thing drawn, so keep its unpremultiplied output
    // untouched and let the browser composite the antialiased sphere edge.
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);

    loadTexture();
    return true;
  }

  function loadTexture() {
    var image = new Image();

    image.onload = function () {
      try {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        // Keep coastlines crisp where the sphere turns away from the viewer.
        var anisotropy = gl.getExtension('EXT_texture_filter_anisotropic') ||
          gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (anisotropy) {
          var maxAnisotropy = gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
          gl.texParameterf(
            gl.TEXTURE_2D,
            anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
            Math.min(maxAnisotropy || 1, 8)
          );
        }

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
      } catch (error) {
        // A local file:// texture is blocked as cross-origin; keep the fallback.
        texture = null;
      }

      dirty = true;
    };

    image.src = TEXTURE_URL;
  }

  var glReady = initGL();

  function renderGL() {
    if (!glReady || !texture) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.radius, radius * dpr);
    gl.uniform1f(uniforms.yaw, yaw);
    gl.uniform1f(uniforms.pitch, pitch);
    gl.uniform3f(uniforms.light, -0.42, 0.52, 0.74);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /* Overlay art ----------------------------------------------------------- */

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

  function drawAtmosphere() {
    var outer = radius * 1.16;
    var inner = radius * 0.985;

    var glow = ctx.createRadialGradient(centerX, centerY, inner, centerX, centerY, outer);
    glow.addColorStop(0, 'rgba(108, 143, 184, .34)');
    glow.addColorStop(0.35, 'rgba(108, 143, 184, .16)');
    glow.addColorStop(1, 'rgba(108, 143, 184, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, outer, 0, TWO_PI);
    ctx.arc(centerX, centerY, inner, 0, TWO_PI, true);
    ctx.fillStyle = glow;
    ctx.fill();
  }

  function drawRim() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(74, 92, 116, .32)';
    ctx.stroke();
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
    ctx.strokeStyle = 'rgba(181, 48, 60, .3)';
    ctx.stroke();
    ctx.restore();
    ctx.setLineDash([]);

    // A single crimson satellite travelling the ring.
    var angle = (performance.now() / 16000) % TWO_PI;
    var satelliteX = Math.cos(angle) * radius * 1.163;
    var satelliteY = Math.sin(angle) * radius * 0.571;
    var cos = Math.cos(-22 * DEG);
    var sin = Math.sin(-22 * DEG);

    ctx.beginPath();
    ctx.arc(
      centerX + satelliteX * cos - satelliteY * sin,
      centerY + satelliteX * sin + satelliteY * cos,
      Math.max(1.8, radius * 0.012),
      0,
      TWO_PI
    );
    ctx.fillStyle = CRIMSON;
    ctx.fill();
  }

  function drawMarker(now) {
    var marker = project(MARKER_LAT, MARKER_LON);
    var depth = marker[2];
    var fade = depth > 0.02 ? clamp((depth - 0.02) / 0.26, 0, 1) : 0;
    if (!fade) return;

    var dot = Math.max(3.4, radius * 0.035);
    var ring = dot * 2.35;

    ctx.globalAlpha = fade;

    ctx.beginPath();
    ctx.arc(marker[0], marker[1], ring, 0, TWO_PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(181, 48, 60, .32)';
    ctx.stroke();

    if (!reducedMotion) {
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

  /* Fallback: an ocean-filled wireframe if WebGL or the texture is missing. */

  var LATITUDES = [-60, -40, -20, 0, 20, 40, 60].map(function (value) {
    return value * DEG;
  });

  function fallbackLine(points, frontAlpha, backAlpha) {
    var front = new Path2D();
    var back = new Path2D();

    for (var i = 0; i < points.length - 1; i += 1) {
      var a = points[i];
      var b = points[i + 1];
      var path = (a[2] + b[2]) * 0.5 >= 0 ? front : back;
      path.moveTo(a[0], a[1]);
      path.lineTo(b[0], b[1]);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(207, 214, 225, ' + backAlpha + ')';
    ctx.stroke(back);
    ctx.strokeStyle = 'rgba(207, 214, 225, ' + frontAlpha + ')';
    ctx.stroke(front);
  }

  function drawFallback(now) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    ctx.fillStyle = '#dfe9f3';
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 101, 120, .4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    var latIndex;
    var lonIndex;
    var step;
    var points;

    for (latIndex = 0; latIndex < LATITUDES.length; latIndex += 1) {
      points = [];
      for (step = 0; step <= TWO_PI + 0.08; step += 0.08) {
        points.push(project(LATITUDES[latIndex], step));
      }
      fallbackLine(points, .5, .16);
    }

    for (lonIndex = 0; lonIndex < 12; lonIndex += 1) {
      points = [];
      for (step = -Math.PI / 2; step <= Math.PI / 2 + 0.07; step += 0.07) {
        points.push(project(step, lonIndex * (TWO_PI / 12)));
      }
      fallbackLine(points, .42, .13);
    }

    drawMarker(now);
  }

  function render(now) {
    if (!size) return;

    ctx.clearRect(0, 0, size, size);
    drawAtmosphere();

    if (glReady && texture) {
      renderGL();
      drawRim();
      drawOrbitRing();
      drawMarker(now);
    } else {
      drawFallback(now);
    }
  }

  /* Sizing --------------------------------------------------------------- */

  function resize() {
    var nextSize = canvas.getBoundingClientRect().width;
    if (!nextSize) return;

    var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (Math.abs(nextSize - size) < 0.5 && nextDpr === dpr) return;

    size = nextSize;
    dpr = nextDpr;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    overlay.width = Math.round(size * dpr);
    overlay.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = size / 2;
    centerY = size / 2;
    radius = size * 0.382;
    dirty = true;
  }

  /* Interaction ---------------------------------------------------------- */

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

    yaw += dx * ROTATE_PER_PX;
    pitch = clamp(pitch + dy * TILT_PER_PX, -1.2, 1.2);
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
          pitch = clamp(pitch + tiltSpinVelocity * delta, -1.2, 1.2);
          tiltSpinVelocity *= Math.exp(-3.2 * delta);
          if (Math.abs(tiltSpinVelocity) < 0.003) tiltSpinVelocity = 0;
        }

        if (!reducedMotion && now - lastInteraction > 2200) {
          yaw += 0.055 * delta;
        }
      }

      render(now);
      dirty = false;
    }

    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();
