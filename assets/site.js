/* ==========================================================================
   ARKA PATRA — small interaction layer
   Mobile menu · skills readout · contact form. No theme logic, no libraries.
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------- menu */

  var head = document.querySelector('.site-head');
  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');

  if (head && toggle && menu) {
    function setMenu(open) {
      head.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && head.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------- hero scroll */

  /* The hero is pinned behind the flow on large screens; its content drifts up
     and fades as the first section slides over it. Everything is scrubbed by
     scroll position, so scrolling back up reverses it exactly. */

  var hero = document.querySelector('.home-hero');

  if (hero && head) {
    var heroInner = hero.querySelector('.home-hero__grid');
    var flow = document.querySelector('.home-flow');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var heroHeight = 0;
    var coverDistance = 0;
    var queued = false;

    function measureHero() {
      heroHeight = hero.offsetHeight || window.innerHeight;
      /* Distance the page scrolls before the next section's sheet reaches the
         top of the viewport and has fully covered the hero. */
      coverDistance = flow
        ? flow.getBoundingClientRect().top + window.scrollY
        : heroHeight;
    }

    function paintHero() {
      queued = false;
      var max = Math.max(heroHeight, 1);
      var travel = Math.max(coverDistance, 1);
      var progress = Math.min(Math.max(window.scrollY, 0) / travel, 1);

      /* The copy stays on screen until the sheet is on its way up, then fades
         out as it is covered — never leaving an empty stretch of pine. */
      var fade = Math.min(Math.max((progress - 0.45) / 0.5, 0), 1);

      heroInner.style.transform =
        'translate3d(0, ' + (-progress * max * 0.3).toFixed(2) + 'px, 0)' +
        ' scale(' + (1 - progress * 0.035).toFixed(3) + ')';
      heroInner.style.opacity = (1 - fade).toFixed(3);
    }

    function queueHero() {
      /* Background tabs neither fire rAF nor reliably deliver scroll events, so
         paint straight away there to keep the state truthful on return. */
      if (document.hidden) {
        paintHero();
        return;
      }
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paintHero);
    }

    if (heroInner && !reduced.matches) {
      document.documentElement.classList.add('hero-scroll');
      measureHero();
      paintHero();

      window.addEventListener('scroll', queueHero, { passive: true });
      window.addEventListener('resize', function () { measureHero(); queueHero(); });
      window.addEventListener('orientationchange', function () { measureHero(); queueHero(); });
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { measureHero(); paintHero(); }
      });

      /* Switching on reduced motion mid-session returns the hero to normal flow. */
      if (reduced.addEventListener) {
        reduced.addEventListener('change', function () {
          if (reduced.matches) {
            document.documentElement.classList.remove('hero-scroll');
            heroInner.style.transform = '';
            heroInner.style.opacity = '';
          } else {
            document.documentElement.classList.add('hero-scroll');
            measureHero();
            paintHero();
          }
        });
      }
    }
  }

  /* ------------------------------------------------------- ledger shuffle */

  /* The five project rows on the Work page start as a slightly overlapped
     deck and fan into the exact ledger as it rises into view. Progress comes
     from scroll position, so scrolling back up reverses the shuffle exactly.
     Only transforms are written — flow height, links and type stay put. */

  var workLedger = document.querySelector('.work-ledger');

  if (workLedger) {
    var ledgerRows = Array.prototype.slice.call(workLedger.querySelectorAll('.ledger__row'));
    var ledgerDeck = workLedger.querySelector('.ledger__rows');
    var deckReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var deckWide = window.matchMedia('(min-width: 901px)');
    var deckMetrics = [];
    var deckQueued = false;
    var deckProgress = -1;
    var deckSettled = false;
    var deckBound = false;
    /* Last value written per row, so a frame that changes nothing writes
       nothing — each write costs a style recalculation on scroll. */
    var deckLastY = [];
    var deckLastPlane = null;

    function measureDeck() {
      deckMetrics = ledgerRows.map(function (row) {
        return { row: row, height: row.offsetHeight || 78 };
      });
      deckProgress = -1;
      deckLastY = [];
      deckLastPlane = null;
    }

    function paintDeck() {
      deckQueued = false;

      var viewport = window.innerHeight || 1;
      var box = workLedger.getBoundingClientRect();
      /* A shorter travel distance lands the deck sooner: same motion, less
         scrolling, so it never feels like it is dragging behind the wheel. */
      var span = Math.max(viewport * 0.42, 1);
      var progress = Math.min(Math.max((viewport - box.top) / span, 0), 1);

      if (progress === deckProgress) return;
      deckProgress = progress;

      var wide = deckWide.matches;

      if (ledgerDeck) {
        var planeLocal = Math.min(Math.max(progress / 0.85, 0), 1);
        var planeEase = planeLocal * planeLocal * (3 - 2 * planeLocal);
        var plane = Math.round((wide ? 2.2 : 0) * (1 - planeEase) * 100) / 100;

        if (plane !== deckLastPlane) {
          deckLastPlane = plane;
          ledgerDeck.style.setProperty('--deck-plane', plane.toFixed(2) + 'deg');
        }
      }

      deckMetrics.forEach(function (item, index) {
        /* Each row starts its own settle a little later than the one above,
           so the deck fans from the top instead of moving as one block. */
        var local = Math.min(Math.max((progress - 0.05 - index * 0.03) / 0.7, 0), 1);
        var eased = local * local * (3 - 2 * local);
        var rest = 1 - eased;

        var overlap = Math.min(18, item.height * 0.26);
        /* Half-pixel steps: finer moves are invisible, and skipping them keeps
           fast scrolling off the style recalculation path. */
        var y = rest ? Math.round(-(index * overlap * rest) * 2) / 2 : 0;

        if (deckLastY[index] === y) return;
        deckLastY[index] = y;

        item.row.style.setProperty('--deck-y', y + 'px');
      });

      var finished = progress > 0.994;
      if (finished !== deckSettled) {
        deckSettled = finished;
        workLedger.classList.toggle('is-settled', finished);
      }
    }

    function queueDeck() {
      if (document.hidden) {
        paintDeck();
        return;
      }
      if (deckQueued) return;
      deckQueued = true;
      window.requestAnimationFrame(paintDeck);
    }

    function clearDeck() {
      workLedger.classList.remove('has-deck');
      workLedger.classList.remove('is-settled');
      if (ledgerDeck) ledgerDeck.style.removeProperty('--deck-plane');
      ledgerRows.forEach(function (row) {
        row.style.removeProperty('--deck-layer');
        row.style.removeProperty('--deck-y');
      });
      deckProgress = -1;
      deckSettled = false;
      deckLastY = [];
      deckLastPlane = null;
    }

    function enableDeck() {
      if (deckReduced.matches) return;

      workLedger.classList.add('has-deck');
      ledgerRows.forEach(function (row, index) {
        row.style.setProperty('--deck-layer', String(index + 1));
      });

      measureDeck();
      paintDeck();

      if (deckBound) return;
      deckBound = true;

      window.addEventListener('scroll', queueDeck, { passive: true });
      window.addEventListener('resize', function () { measureDeck(); queueDeck(); });
      window.addEventListener('orientationchange', function () { measureDeck(); queueDeck(); });
      window.addEventListener('load', function () { measureDeck(); queueDeck(); });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { measureDeck(); queueDeck(); });
      }
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { measureDeck(); paintDeck(); }
      });
    }

    if (ledgerRows.length) {
      enableDeck();

      if (deckReduced.addEventListener) {
        deckReduced.addEventListener('change', function () {
          if (deckReduced.matches) {
            clearDeck();
          } else {
            enableDeck();
          }
        });
      }
    }
  }

  /* --------------------------------------------------------- skill readout */

  /* Builds that exist on the Work page carry an href, so the readout can link
     to them. Everything else is plain text. */
  var builds = {
    copilot: { title: 'Website Security Copilot', href: 'projects.html#project-copilot' },
    netraksha: { title: 'Netraksha', href: 'projects.html#project-netraksha' },
    nexvault: { title: 'NexVault', href: 'projects.html#project-nexvault' },
    humanize: { title: 'Humanize AI', href: 'projects.html#project-humanize' },
    urlScanner: { title: 'URL Scanner', href: 'projects.html#project-url-scanner' },
    altron: { title: 'ALTRON' },
    quishing: { title: 'Quishing Guard' },
    prompt: { title: 'Hidden-Prompt Scanner' },
    portfolio: { title: 'Portfolio' },
    prototype: { title: 'Prototype Safety Check' }
  };

  /* Which builds each skill chip points at. A chip with no entry falls back to
     its column's USED IN builds (the data-used attribute). */
  var skillBuilds = {
    'Threat detection': ['urlScanner', 'quishing'],
    'Password audit': ['altron', 'nexvault'],
    'Network recon': ['urlScanner', 'copilot'],
    'Phishing analysis': ['quishing', 'netraksha'],
    'URL scanning': ['urlScanner', 'quishing', 'copilot'],

    'HTML5': ['portfolio', 'nexvault'],
    'CSS3': ['portfolio', 'nexvault'],
    'JavaScript': ['portfolio', 'nexvault', 'humanize'],
    'Responsive UI': ['portfolio', 'nexvault'],
    'Accessibility': ['portfolio', 'nexvault'],

    'Python': ['copilot', 'prompt'],
    'Prompt design': ['humanize', 'prompt'],
    'ML basics': ['netraksha', 'prompt'],
    'Text analysis': ['humanize', 'prompt'],
    'Forensics': ['copilot', 'netraksha'],
    'Automation': ['copilot', 'prototype']
  };

  var DEFAULT_NAME = 'Awaiting input';
  var DEFAULT_BODY = 'Select a skill chip to see the builds that use it.';

  var chips = document.querySelectorAll('.chip-btn');
  var readoutName = document.getElementById('skillReadoutName');
  var readoutBody = document.getElementById('skillReadoutBody');

  function resetReadout() {
    chips.forEach(function (chip) { chip.setAttribute('aria-pressed', 'false'); });
    readoutName.textContent = DEFAULT_NAME;
    readoutBody.textContent = DEFAULT_BODY;
  }

  function renderBuilds(ids) {
    readoutBody.textContent = '';

    ids.forEach(function (id) {
      var build = builds[id];
      if (!build) return;

      var element;
      if (build.href) {
        element = document.createElement('a');
        element.className = 'readout__build';
        element.href = build.href;
        element.appendChild(document.createTextNode(build.title));
        var arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        element.appendChild(arrow);
      } else {
        element = document.createElement('span');
        element.className = 'readout__build';
        element.textContent = build.title;
      }

      readoutBody.appendChild(element);
    });
  }

  if (chips.length && readoutName && readoutBody) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var active = chip.getAttribute('aria-pressed') === 'true';

        if (active) {
          resetReadout();
          return;
        }

        chips.forEach(function (other) { other.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', 'true');
        readoutName.textContent = chip.dataset.skill || chip.textContent.trim();

        var ids = skillBuilds[chip.dataset.skill] || [];

        if (!ids.length) {
          var column = chip.closest('[data-used]');
          ids = column ? column.dataset.used.split(/\s+/).filter(Boolean) : [];
        }

        renderBuilds(ids);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && readoutName.textContent !== DEFAULT_NAME) {
        resetReadout();
        var selected = document.querySelector('.chip-btn[aria-pressed="true"]');
        if (selected) selected.focus();
      }
    });
  }

  /* --------------------------------------------------------- contact form */

  var form = document.getElementById('contactForm');

  if (form) {
    var nameInput = document.getElementById('cfName');
    var emailInput = document.getElementById('cfEmail');
    var messageInput = document.getElementById('cfMessage');
    var status = document.getElementById('cfStatus');
    var submit = document.getElementById('cfSubmit');

    function setError(input, message) {
      var field = input.closest('.field');
      var error = field ? field.querySelector('.field-error') : null;
      if (field) field.classList.toggle('has-error', Boolean(message));
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (error) error.textContent = message || '';
    }

    [nameInput, emailInput, messageInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () { setError(input, ''); });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var valid = true;
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nameInput.value.trim()) {
        setError(nameInput, 'Please enter your name.');
        valid = false;
      }
      if (!emailPattern.test(emailInput.value.trim())) {
        setError(emailInput, 'Enter a valid email address.');
        valid = false;
      }
      if (!messageInput.value.trim()) {
        setError(messageInput, 'Please write a short message.');
        valid = false;
      }

      if (!valid) {
        status.textContent = '';
        status.classList.remove('is-error');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var inbox = 'f3400068730008743ebb2c550435c41d';
      status.classList.remove('is-error');
      status.textContent = 'Sending…';
      if (submit) {
        submit.disabled = true;
        submit.label = submit.textContent;
        submit.textContent = 'Sending…';
      }

      fetch('https://formsubmit.co/ajax/' + inbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          message: messageInput.value.trim(),
          _subject: 'Portfolio contact — from ' + nameInput.value.trim()
        })
      })
        .then(function (response) {
          if (!response.ok) throw new Error('send failed');
          return response.json();
        })
        .then(function () {
          status.classList.remove('is-error');
          status.textContent = 'Message received — I reply within a day.';
          form.reset();
          [nameInput, emailInput, messageInput].forEach(function (input) { setError(input, ''); });
        })
        .catch(function () {
          status.classList.add('is-error');
          status.textContent = 'Could not send — email me directly at arkap1502@gmail.com.';
        })
        .then(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.label || 'Send message →';
          }
        });
    });
  }
})();
