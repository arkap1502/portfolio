/* ==========================================================================
   Arka Patra — entry dot playground
   Four ink balls in a pill-shaped pit: drag, fling, bounce, settle.
   Purely decorative — nothing on the entry screen depends on it.
   ========================================================================== */

(function () {
  'use strict';

  var field = document.querySelector('[data-entry-dots]');
  if (!field) return;

  var ballEls = Array.prototype.slice.call(field.querySelectorAll('i'));
  if (!ballEls.length) return;

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reducedMotion = motionQuery ? motionQuery.matches : false;

  var GRAVITY = 1500;
  var WALL_BOUNCE = 0.64;
  var BALL_BOUNCE = 0.9;
  var REST_SPEED = 16;
  var MAX_FLING = 1700;
  var STEP = 1 / 60;

  var width = 0;
  var height = 0;
  var pad = 6;
  var capRadius = 0;
  var capY = 0;
  var straightStart = 0;
  var straightEnd = 0;

  var balls = ballEls.map(function (el) {
    return {
      el: el,
      r: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      resting: true,
      contact: true,
      stillTime: 0
    };
  });

  var dragging = null;
  var activePointer = null;
  var dragStartX = 0;
  var dragStartY = 0;
  var lastX = 0;
  var lastY = 0;
  var lastTime = 0;
  var flingX = 0;
  var flingY = 0;
  var didMove = false;

  var running = false;
  var frameId = 0;
  var lastFrame = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function readGeometry() {
    width = field.clientWidth;
    height = field.clientHeight;

    if (!width || !height) return false;

    /* A little breathing room from the pill's border. */
    pad = clamp(height * 0.07, 4, 8);
    capRadius = height / 2 - pad;
    capY = height / 2;
    straightStart = pad + capRadius;
    straightEnd = width - pad - capRadius;

    if (straightEnd < straightStart) {
      straightStart = width / 2;
      straightEnd = width / 2;
    }

    return capRadius > 8;
  }

  function place(ball) {
    ball.el.style.transform =
      'translate3d(' + (ball.x - ball.r) + 'px, ' + (ball.y - ball.r) + 'px, 0)';
  }

  function layOut() {
    if (!readGeometry()) return false;

    var gap = clamp(height * 0.14, 8, 14);
    var total = 0;
    var index;

    for (index = 0; index < balls.length; index += 1) {
      balls[index].r = balls[index].el.offsetWidth / 2 || 14;
      total += balls[index].r * 2;
      if (index < balls.length - 1) total += gap;
    }

    var cursor = (width - total) / 2;
    var floor = capY + capRadius;

    for (index = 0; index < balls.length; index += 1) {
      var ball = balls[index];

      ball.x = cursor + ball.r;
      ball.y = floor - ball.r;
      ball.vx = 0;
      ball.vy = 0;
      ball.resting = true;
      ball.contact = true;
      ball.stillTime = 0;

      cursor += ball.r * 2 + gap;
      place(ball);
    }

    return true;
  }

  function localPoint(event) {
    var rect = field.getBoundingClientRect();

    return {
      x: event.clientX - rect.left - field.clientLeft,
      y: event.clientY - rect.top - field.clientTop
    };
  }

  /* Keep a dragged ball inside the capsule-shaped pit. */
  function clampToField(ball, x, y) {
    var allowed = Math.max(1, capRadius - ball.r - 0.5);

    if (x < straightStart) {
      var leftDx = x - straightStart;
      var leftDy = y - capY;
      var leftDistance = Math.sqrt(leftDx * leftDx + leftDy * leftDy) || 0.0001;

      if (leftDistance > allowed) {
        return {
          x: straightStart + (leftDx / leftDistance) * allowed,
          y: capY + (leftDy / leftDistance) * allowed
        };
      }
    } else if (x > straightEnd) {
      var rightDx = x - straightEnd;
      var rightDy = y - capY;
      var rightDistance = Math.sqrt(rightDx * rightDx + rightDy * rightDy) || 0.0001;

      if (rightDistance > allowed) {
        return {
          x: straightEnd + (rightDx / rightDistance) * allowed,
          y: capY + (rightDy / rightDistance) * allowed
        };
      }
    } else {
      return { x: x, y: clamp(y, capY - allowed, capY + allowed) };
    }

    return { x: x, y: y };
  }

  function wake(ball) {
    ball.resting = false;
    ball.stillTime = 0;

    /* If this ball was supporting a sleeping neighbour, that neighbour
       needs to fall too. */
    for (var index = 0; index < balls.length; index += 1) {
      var other = balls[index];
      if (other === ball || !other.resting) continue;

      var dx = other.x - ball.x;
      var dy = other.y - ball.y;
      var reach = ball.r + other.r + 0.5;

      if (dx * dx + dy * dy < reach * reach) {
        other.resting = false;
        other.stillTime = 0;
      }
    }
  }

  function bounceWalls(ball) {
    var allowed = Math.max(1, capRadius - ball.r - 0.5);
    var hit = false;

    if (ball.x < straightStart) {
      var leftDx = ball.x - straightStart;
      var leftDy = ball.y - capY;
      var leftDistance = Math.sqrt(leftDx * leftDx + leftDy * leftDy) || 0.0001;

      if (leftDistance > allowed) {
        var leftNx = leftDx / leftDistance;
        var leftNy = leftDy / leftDistance;
        ball.x = straightStart + leftNx * allowed;
        ball.y = capY + leftNy * allowed;
        var leftVn = ball.vx * leftNx + ball.vy * leftNy;
        if (leftVn > 0) {
          ball.vx -= (1 + WALL_BOUNCE) * leftVn * leftNx;
          ball.vy -= (1 + WALL_BOUNCE) * leftVn * leftNy;
        }
        hit = true;
      }
    } else if (ball.x > straightEnd) {
      var rightDx = ball.x - straightEnd;
      var rightDy = ball.y - capY;
      var rightDistance = Math.sqrt(rightDx * rightDx + rightDy * rightDy) || 0.0001;

      if (rightDistance > allowed) {
        var rightNx = rightDx / rightDistance;
        var rightNy = rightDy / rightDistance;
        ball.x = straightEnd + rightNx * allowed;
        ball.y = capY + rightNy * allowed;
        var rightVn = ball.vx * rightNx + ball.vy * rightNy;
        if (rightVn > 0) {
          ball.vx -= (1 + WALL_BOUNCE) * rightVn * rightNx;
          ball.vy -= (1 + WALL_BOUNCE) * rightVn * rightNy;
        }
        hit = true;
      }
    } else {
      if (ball.y < capY - allowed) {
        ball.y = capY - allowed;
        if (ball.vy < 0) ball.vy = -ball.vy * WALL_BOUNCE;
        hit = true;
      } else if (ball.y > capY + allowed) {
        ball.y = capY + allowed;
        if (ball.vy > 0) ball.vy = -ball.vy * WALL_BOUNCE;
        hit = true;
      }
    }

    if (hit) ball.contact = true;
  }

  function collidePair(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var minDistance = a.r + b.r;
    var distanceSq = dx * dx + dy * dy;

    if (distanceSq >= minDistance * minDistance) return;

    var distance = Math.sqrt(distanceSq);
    var nx;
    var ny;

    if (distance < 0.0001) {
      distance = 0.0001;
      nx = 1;
      ny = 0;
    } else {
      nx = dx / distance;
      ny = dy / distance;
    }

    var overlap = minDistance - distance;

    /* A held ball is immovable: it shoves the other ball aside instead of
       being knocked back under the pointer. */
    if (a === dragging || b === dragging) {
      if (a === dragging && b === dragging) return;

      if (a === dragging) {
        b.x += nx * overlap;
        b.y += ny * overlap;

        var bRelative = (b.vx - flingX) * nx + (b.vy - flingY) * ny;
        if (bRelative < 0) {
          b.vx -= (1 + BALL_BOUNCE) * bRelative * nx;
          b.vy -= (1 + BALL_BOUNCE) * bRelative * ny;
        }
        wake(b);
      } else {
        a.x -= nx * overlap;
        a.y -= ny * overlap;

        var aRelative = (a.vx - flingX) * nx + (a.vy - flingY) * ny;
        if (aRelative > 0) {
          a.vx -= (1 + BALL_BOUNCE) * aRelative * nx;
          a.vy -= (1 + BALL_BOUNCE) * aRelative * ny;
        }
        wake(a);
      }
      return;
    }

    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;

    var relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

    if (relative < 0) {
      var impulse = -(1 + BALL_BOUNCE) * relative * 0.5;
      a.vx -= impulse * nx;
      a.vy -= impulse * ny;
      b.vx += impulse * nx;
      b.vy += impulse * ny;
    }

    wake(a);
    wake(b);
  }

  function step(dt) {
    var index;
    var other;
    var ball;
    var pass;

    for (index = 0; index < balls.length; index += 1) {
      ball = balls[index];
      if (ball === dragging || ball.resting) continue;

      ball.contact = false;
      ball.vy += GRAVITY * dt;
      ball.vx *= Math.exp(-0.22 * dt);
      ball.vy *= Math.exp(-0.05 * dt);
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      bounceWalls(ball);

      if (ball.contact) {
        ball.vx *= Math.exp(-1.7 * dt);
      }
    }

    for (pass = 0; pass < 2; pass += 1) {
      for (index = 0; index < balls.length; index += 1) {
        for (other = index + 1; other < balls.length; other += 1) {
          collidePair(balls[index], balls[other]);
        }
      }

      for (index = 0; index < balls.length; index += 1) {
        ball = balls[index];
        if (ball === dragging || ball.resting) continue;
        bounceWalls(ball);
      }
    }

    for (index = 0; index < balls.length; index += 1) {
      ball = balls[index];
      if (ball === dragging || ball.resting) continue;

      if (Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) < REST_SPEED) {
        ball.stillTime += dt;

        if (ball.stillTime > 0.35) {
          ball.vx = 0;
          ball.vy = 0;
          ball.resting = true;
          ball.stillTime = 0;
        }
      } else {
        ball.stillTime = 0;
      }
    }
  }

  function anyMoving() {
    for (var index = 0; index < balls.length; index += 1) {
      if (balls[index] === dragging || !balls[index].resting) return true;
    }
    return false;
  }

  function frame(now) {
    frameId = 0;

    var delta = (now - lastFrame) / 1000;
    lastFrame = now;

    if (!isFinite(delta) || delta <= 0) delta = STEP;
    delta = Math.min(delta, 0.05);

    var steps = Math.max(1, Math.ceil(delta / STEP));
    var dt = delta / steps;

    for (var s = 0; s < steps; s += 1) step(dt);
    for (var index = 0; index < balls.length; index += 1) place(balls[index]);

    if (anyMoving()) {
      frameId = window.requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function startLoop() {
    if (reducedMotion || running) return;

    running = true;
    lastFrame = performance.now();
    frameId = window.requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    running = false;
  }

  function pointerDown(event) {
    if (reducedMotion) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    var el = event.target && event.target.closest ? event.target.closest('i') : null;
    var index = el ? ballEls.indexOf(el) : -1;
    if (index < 0) return;

    var ball = balls[index];

    event.preventDefault();

    if (dragging) finishDrag(null, true);

    dragging = ball;
    activePointer = event.pointerId;
    ball.contact = false;
    ball.vx = 0;
    ball.vy = 0;

    /* Waking the picked-up ball also wakes anything resting on it, so a
       stack cannot hang in mid-air when its support is dragged away. */
    wake(ball);

    var point = localPoint(event);
    ball.dragOffsetX = point.x - ball.x;
    ball.dragOffsetY = point.y - ball.y;
    dragStartX = point.x;
    dragStartY = point.y;
    lastX = point.x;
    lastY = point.y;
    lastTime = performance.now();
    flingX = 0;
    flingY = 0;
    didMove = false;

    ball.el.classList.add('is-grabbed');
    field.classList.add('is-playing');
    field.classList.add('is-played');

    if (field.setPointerCapture) {
      try {
        field.setPointerCapture(event.pointerId);
      } catch (error) {
        /* Pointer capture is a progressive enhancement. */
      }
    }

    startLoop();
  }

  function pointerMove(event) {
    if (!dragging || event.pointerId !== activePointer) return;

    event.preventDefault();

    var point = localPoint(event);
    var now = performance.now();
    var elapsed = Math.max(8, now - lastTime) / 1000;
    var dx = point.x - lastX;
    var dy = point.y - lastY;

    if (Math.abs(point.x - dragStartX) + Math.abs(point.y - dragStartY) > 4) {
      didMove = true;
    }

    flingX = flingX * 0.55 + (dx / elapsed) * 0.45;
    flingY = flingY * 0.55 + (dy / elapsed) * 0.45;

    lastX = point.x;
    lastY = point.y;
    lastTime = now;

    var clamped = clampToField(
      dragging,
      point.x - dragging.dragOffsetX,
      point.y - dragging.dragOffsetY
    );

    dragging.x = clamped.x;
    dragging.y = clamped.y;
    place(dragging);
  }

  function finishDrag(event, canceled) {
    if (!dragging) return;
    if (event && event.pointerId !== activePointer) return;

    var ball = dragging;
    var pointer = activePointer;
    var idle = performance.now() - lastTime;

    dragging = null;
    activePointer = null;

    ball.el.classList.remove('is-grabbed');
    field.classList.remove('is-playing');

    if (field.releasePointerCapture && pointer !== null &&
        field.hasPointerCapture && field.hasPointerCapture(pointer)) {
      try {
        field.releasePointerCapture(pointer);
      } catch (error) {
        /* Ignore a pointer that has already gone away. */
      }
    }

    if (canceled) {
      ball.vx = 0;
      ball.vy = 0;
    } else if (!didMove) {
      /* A plain tap gives the ball a small pop. */
      ball.vx = (Math.random() * 2 - 1) * 130;
      ball.vy = -(360 + Math.random() * 120);
      ball.resting = false;
    } else {
      ball.vx = clamp(idle > 140 ? 0 : flingX, -MAX_FLING, MAX_FLING);
      ball.vy = clamp(idle > 140 ? 0 : flingY, -MAX_FLING, MAX_FLING);
      ball.resting = false;
    }

    ball.stillTime = 0;
    startLoop();
  }

  function handleResize() {
    if (reducedMotion) return;

    if (dragging) finishDrag(null, true);
    stopLoop();

    field.classList.add('is-live');

    if (!layOut()) field.classList.remove('is-live');
  }

  field.addEventListener('pointerdown', pointerDown);
  field.addEventListener('lostpointercapture', function (event) {
    finishDrag(event, true);
  });

  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', function (event) {
    finishDrag(event, false);
  });
  window.addEventListener('pointercancel', function (event) {
    finishDrag(event, true);
  });

  window.addEventListener('blur', function () {
    finishDrag(null, true);
  });

  if (motionQuery) {
    var onMotionChange = function (event) {
      reducedMotion = event.matches;

      if (reducedMotion) {
        finishDrag(null, true);
        stopLoop();
        field.classList.remove('is-live');
        field.classList.remove('is-playing');

        for (var index = 0; index < balls.length; index += 1) {
          balls[index].el.classList.remove('is-grabbed');
          balls[index].el.style.transform = '';
          balls[index].vx = 0;
          balls[index].vy = 0;
          balls[index].resting = true;
          balls[index].contact = true;
          balls[index].stillTime = 0;
        }
      } else {
        handleResize();
      }
    };

    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(handleResize).observe(field);
  } else {
    window.addEventListener('resize', handleResize);
  }

  handleResize();
})();
