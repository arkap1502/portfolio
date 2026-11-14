/* ==========================================================================
   ARKA PATRA — SECURE HUD behaviour
   Boot sequence · page wipe · navigation · reveals · 3D tilt · counters
   live threat monitor · project dialogs and filters · skill readout
   identity flip · contact form
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  /* -----------------------------------------------------------------------
     Page navigation
     Internal pages are fetched as soon as a pointer or focus reaches their
     link, so a click paints the next document from cache instead of
     waiting on a network round trip.
     ----------------------------------------------------------------------- */

  function isInternalPage(link) {
    if (!link || !link.getAttribute) return false;
    if (link.target === '_blank' || link.hasAttribute('download')) return false;
    if (link.protocol !== 'http:' && link.protocol !== 'https:') return false;
    if (link.host !== window.location.host) return false;
    if (link.pathname === window.location.pathname) return false;
    if (!/\.html?$/i.test(link.pathname)) return false;
    return true;
  }

  var prefetched = Object.create(null);

  function prefetch(link) {
    if (!isInternalPage(link) || prefetched[link.href]) return;
    prefetched[link.href] = true;

    var hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.as = 'document';
    hint.href = link.href;
    document.head.appendChild(hint);
  }

  function linkOf(event) {
    var target = event.target;
    return target && target.closest ? target.closest('a') : null;
  }

  document.addEventListener('pointerover', function (event) {
    prefetch(linkOf(event));
  }, { passive: true });

  document.addEventListener('focusin', function (event) {
    prefetch(linkOf(event));
  });

  function prefetchNavigation() {
    document.querySelectorAll('.nav-links a, .mobile-menu a, .site-foot a').forEach(prefetch);
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prefetchNavigation, { timeout: 2500 });
  } else {
    window.setTimeout(prefetchNavigation, 1500);
  }

  /* -----------------------------------------------------------------------
     Page wipe
     The curtain rises over the outgoing page and navigation starts as soon
     as it is covered. Because the next page is normally prefetched, this
     costs one short transition instead of a full network wait.
     ----------------------------------------------------------------------- */

  var wipe = document.createElement('div');
  wipe.className = 'page-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(wipe);

  var wipeDuration = 180;
  var leaving = false;

  document.addEventListener('click', function (event) {
    if (leaving || reducedMotion) return;
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = linkOf(event);
    if (!isInternalPage(link)) return;

    leaving = true;
    event.preventDefault();
    wipe.classList.add('is-active');

    window.setTimeout(function () {
      window.location.href = link.href;

      /* If the navigation never commits, put the page back rather than
         leaving the curtain over content the visitor can still reach. */
      window.setTimeout(function () {
        leaving = false;
        wipe.classList.remove('is-active');
      }, 4000);
    }, wipeDuration);
  });

  window.addEventListener('pageshow', function (event) {
    leaving = false;
    if (event.persisted) wipe.classList.remove('is-active');
  });

  /* -----------------------------------------------------------------------
     Mobile navigation
     ----------------------------------------------------------------------- */

  var header = document.querySelector('.site-header');
  var menu = document.getElementById('mobileMenu');
  var toggle = document.getElementById('menuToggle');

  function closeMenu() {
    if (!header || !menu || !toggle) return;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
  }

  if (header && menu && toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      closeMenu();
      toggle.focus();
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  /* -----------------------------------------------------------------------
     Scroll reveals + journey line
     ----------------------------------------------------------------------- */

  var revealItems = document.querySelectorAll('[data-reveal]');

  if (!reducedMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });

    revealItems.forEach(function (item) { revealObserver.observe(item); });

    window.setTimeout(function () {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }, 5000);
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* -----------------------------------------------------------------------
     Pointer tilt
     ----------------------------------------------------------------------- */

  if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (target) {
      var strength = parseFloat(target.getAttribute('data-tilt')) || 5;

      target.addEventListener('pointermove', function (event) {
        var box = target.getBoundingClientRect();
        if (!box.width || !box.height) return;
        var x = (event.clientX - box.left) / box.width - .5;
        var y = (event.clientY - box.top) / box.height - .5;
        target.style.setProperty('--tilt-y', (x * strength).toFixed(2) + 'deg');
        target.style.setProperty('--tilt-x', (-y * strength).toFixed(2) + 'deg');
        target.classList.add('is-tilting');
      });

      target.addEventListener('pointerleave', function () {
        target.style.setProperty('--tilt-y', '0deg');
        target.style.setProperty('--tilt-x', '0deg');
        target.classList.remove('is-tilting');
      });
    });
  }

  /* -----------------------------------------------------------------------
     HUD counters
     ----------------------------------------------------------------------- */

  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var digits = el.getAttribute('data-pad');
    if (isNaN(end)) return;

    if (reducedMotion) {
      el.textContent = digits === '2' ? pad(end) : String(end);
      return;
    }

    var start = performance.now();
    var duration = 900;

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.round(end * eased);
      el.textContent = digits === '2' ? pad(value) : String(value);
      if (t < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: .5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* -----------------------------------------------------------------------
     Live threat monitor
     ----------------------------------------------------------------------- */

  var threatMessage = document.getElementById('threatMessage');
  var threatLevel = document.getElementById('threatLevel');

  if (threatMessage && threatLevel) {
    var threats = [
      { text: 'Typosquatted domain detected', level: 'High' },
      { text: 'Phishing link intercepted', level: 'High' },
      { text: 'Weak password pattern found', level: 'Medium' },
      { text: 'Certificate expiring in 6 days', level: 'Low' },
      { text: 'Lookalike login page blocked', level: 'High' }
    ];
    var threatIndex = 0;

    if (!reducedMotion) {
      window.setInterval(function () {
        if (document.hidden) return;
        threatIndex = (threatIndex + 1) % threats.length;
        threatMessage.textContent = threats[threatIndex].text;
        threatLevel.textContent = threats[threatIndex].level;
      }, 5200);
    }
  }

  /* -----------------------------------------------------------------------
     Project data
     ----------------------------------------------------------------------- */

  var projects = {
    url: {
      index: '01',
      title: 'URL Scanner',
      category: 'URL security scanner · Threat detection',
      status: 'Completed',
      desc: 'A cybersecurity-focused URL scanner that flags raw IPs, uncommon TLDs, lookalike brand spellings, phishing keywords and weak security headers, then combines the signals into a 0–100 risk score with a plain-language verdict.',
      stack: ['JavaScript', 'HTML', 'CSS'],
      links: [
        { label: 'Live demo', href: 'https://arkap1502.github.io/URL-Scanner/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/URL-Scanner' }
      ]
    },
    copilot: {
      index: '02',
      title: 'Website Security Copilot',
      category: 'Cybersecurity · Browser extension',
      status: 'Completed',
      desc: 'A FastAPI engine checks security headers, TLS certificates, cookie flags, DNS email records, open ports and phishing signals. The MV3 extension watches tabs and blocks harmful pages before they load. AI explains the tool output — it never invents findings.',
      stack: ['Next.js', 'FastAPI', 'Python', 'SQLite', 'Docker', 'MV3'],
      links: [
        { label: 'Live demo', href: 'https://website-security-copilot-3m0hij8jl-arkap1502-9053s-projects.vercel.app/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/Website-Security-Copilot' }
      ]
    },
    altron: {
      index: '03',
      title: 'ALTRON Password Inspector',
      category: 'Security · Web tool',
      status: 'Completed',
      desc: 'Passwords are generated with crypto.getRandomValues(), never Math.random(). Strength scoring checks character classes and a 15+ character length threshold. Everything runs in the browser.',
      stack: ['JavaScript', 'Web Crypto API', 'HTML', 'CSS'],
      links: [
        { label: 'Live demo', href: 'https://arkap1502.github.io/password-making/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/password-making' }
      ]
    },
    humanize: {
      index: '04',
      title: 'Humanize AI',
      category: 'AI · Text tool',
      status: 'Ongoing',
      desc: 'A React frontend with an Express backend, plus a zero-build client-side fallback so it runs offline. Light, Medium and Strong modes transform text in real time with a word-count diff.',
      stack: ['React', 'Express', 'JavaScript'],
      links: [
        { label: 'Live demo', href: 'https://arkap1502.github.io/Humanize-AI/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/Humanize-AI' }
      ]
    },
    nexvault: {
      index: '05',
      title: 'NexVault',
      category: 'Security · Web app',
      status: 'Ongoing',
      desc: 'A group-built web vault following a “your data, your vault, your control” model. Vault data is gated behind authentication, with encrypted, access-controlled storage and a personal dashboard per user.',
      stack: ['Web App', 'Authentication', 'Data Security'],
      links: [
        { label: 'Live demo', href: 'https://secure-vault-system.onrender.com/' }
      ]
    },
    prompt: {
      index: '06',
      title: 'Hidden-Prompt Scanner',
      category: 'AI security · Document analysis',
      status: 'Completed',
      desc: 'Extracts visible text and layout signals — colour, font size, opacity, position — to flag hidden text, zero-width characters, metadata, comments and injection phrases. Ships as a CLI and Flask UI, fully local.',
      stack: ['Python', 'Flask', 'PyPDF2', 'python-docx'],
      links: [
        { label: 'Live demo', href: 'https://hidden-prompt-scanner-for-documents.onrender.com/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/Hidden-prompt-scanner-for-documents%2E' }
      ]
    },
    prototype: {
      index: '07',
      title: 'Prototype Safety Check',
      category: 'Web security · Passive checks',
      status: 'Ongoing',
      desc: 'Passive checks for exposed parameters, database errors, missing security headers, suspicious scripts and HTTPS signals. Ships a web UI, CLI and REST API — no exploitation.',
      stack: ['Python', 'Flask', 'REST API'],
      links: [
        { label: 'Live demo', href: 'https://prototype-safety-check.onrender.com/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/prototype-safety-check' }
      ]
    },
    quishing: {
      index: '08',
      title: 'Quishing Guard',
      category: 'Web security · QR phishing',
      status: 'Completed',
      desc: 'Scans QR codes from your camera or an uploaded image, decodes the payload locally and scores the risk before anything opens. Flags shortened links, lookalike and punycode domains, IP-address URLs, suspicious TLDs and UPI payee mismatches — with scan history kept on the device.',
      stack: ['React', 'TypeScript', 'Vite', 'jsQR', 'PWA'],
      links: [
        { label: 'Live demo', href: 'https://quishing-guard.vercel.app/' },
        { label: 'Source code', href: 'https://github.com/arkap1502/Quishing-Guard' }
      ]
    }
  };

  /* -----------------------------------------------------------------------
     Project dialog
     ----------------------------------------------------------------------- */

  var dialog = document.getElementById('projectDialog');

  if (dialog && typeof dialog.showModal === 'function') {
    var dialogEyebrow = document.getElementById('dialogEyebrow');
    var dialogTitle = document.getElementById('dialogTitle');
    var dialogMeta = document.getElementById('dialogMeta');
    var dialogDesc = document.getElementById('dialogDesc');
    var dialogStack = document.getElementById('dialogStack');
    var dialogLinks = document.getElementById('dialogLinks');
    var lastTrigger = null;

    function fillDialog(project) {
      dialogEyebrow.textContent = project.index + ' / Project';
      dialogTitle.textContent = project.title;
      dialogMeta.textContent = project.category + ' · ' + project.status;
      dialogDesc.textContent = project.desc;

      dialogStack.textContent = '';
      project.stack.forEach(function (item) {
        var chip = document.createElement('span');
        chip.textContent = item;
        dialogStack.appendChild(chip);
      });

      dialogLinks.textContent = '';
      project.links.forEach(function (link) {
        var anchor = document.createElement('a');
        anchor.className = 'link-arrow';
        anchor.href = link.href;
        if (link.href.indexOf('http') === 0) {
          anchor.target = '_blank';
          anchor.rel = 'noopener';
        }
        anchor.innerHTML = link.label + ' <span class="arrow" aria-hidden="true">↗</span>';
        dialogLinks.appendChild(anchor);
      });
    }

    document.querySelectorAll('[data-open-project]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var key = trigger.getAttribute('data-open-project');
        var project = projects[key];
        if (!project) return;
        lastTrigger = trigger;
        fillDialog(project);
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    });

    dialog.querySelectorAll('[data-close-dialog]').forEach(function (button) {
      button.addEventListener('click', function () { dialog.close(); });
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
      if (lastTrigger) lastTrigger.focus();
    });
  }

  /* -----------------------------------------------------------------------
     Project filters
     ----------------------------------------------------------------------- */

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll('.featured-project, .project-card'));
  var projectDeck = document.querySelector('.projects-deck');
  var filterCount = document.getElementById('filterCount');
  var emptyState = document.getElementById('buildEmpty');

  function applyFilter(filter) {
    var shown = 0;

    projectCards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-status') === filter;
      card.classList.toggle('is-hidden', !match);
      if (match) shown += 1;
    });

    if (projectDeck) {
      var featured = projectDeck.querySelector('.featured-project');
      projectDeck.classList.toggle('projects-deck--solo', !!(featured && featured.classList.contains('is-hidden')));
    }

    if (filterCount) {
      filterCount.textContent = pad(shown) + (shown === 1 ? ' build' : ' builds');
    }
    if (emptyState) {
      emptyState.hidden = shown !== 0;
    }

    filterButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
    });
  }

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-filter') || 'all');
      });
    });
    applyFilter('all');
  }

  /* -----------------------------------------------------------------------
     Skill → related build readout
     ----------------------------------------------------------------------- */

  var skillButtons = Array.prototype.slice.call(document.querySelectorAll('.skill-chip'));
  var skillName = document.getElementById('skillReadoutName');
  var skillBody = document.getElementById('skillReadoutBody');

  function resetSkillReadout() {
    if (skillName) skillName.textContent = 'Awaiting input';
    if (skillBody) {
      skillBody.innerHTML = '<p class="skill-readout__empty">Select a skill badge to see the builds that use it.</p>';
    }
  }

  function showSkill(button) {
    var label = button.getAttribute('data-skill') || 'Skill';
    var keys = (button.getAttribute('data-projects') || '').split(',').filter(Boolean);
    if (skillName) skillName.textContent = label;

    if (!skillBody) return;
    skillBody.textContent = '';

    if (!keys.length) {
      var empty = document.createElement('p');
      empty.className = 'skill-readout__empty';
      empty.textContent = 'No public build mapped to this skill yet.';
      skillBody.appendChild(empty);
      return;
    }

    var list = document.createElement('div');
    list.className = 'skill-readout__list';

    keys.forEach(function (key) {
      var project = projects[key];
      if (!project) return;
      var link = document.createElement('a');
      link.className = 'skill-readout__link';
      link.href = 'projects.html#project-' + key;
      link.innerHTML = project.title + ' <span aria-hidden="true">↗</span>';
      list.appendChild(link);
    });

    skillBody.appendChild(list);
  }

  skillButtons.forEach(function (button) {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', function () {
      var wasActive = button.classList.contains('is-active');
      skillButtons.forEach(function (other) {
        other.classList.remove('is-active');
        other.setAttribute('aria-pressed', 'false');
      });

      if (wasActive) {
        resetSkillReadout();
        return;
      }

      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
      showSkill(button);
    });
  });

  /* -----------------------------------------------------------------------
     Identity card flip
     ----------------------------------------------------------------------- */

  var idCard = document.getElementById('idCard');
  var idFlip = document.getElementById('idFlip');

  if (idCard && idFlip) {
    idFlip.addEventListener('click', function () {
      var flipped = idCard.classList.toggle('is-flipped');
      idFlip.setAttribute('aria-pressed', String(flipped));
      idFlip.querySelector('span').textContent = flipped ? 'Flip to identity' : 'Flip to stats';
    });
  }

  /* -----------------------------------------------------------------------
     Boot sequence — entry cover only, once per tab
     ----------------------------------------------------------------------- */

  var boot = document.getElementById('bootOverlay');

  if (boot) {
    var bootFill = boot.querySelector('.boot__fill');
    var bootSkip = boot.querySelector('.boot__skip');
    var bootDone = false;
    var bootTimer = 0;

    function finishBoot() {
      if (bootDone) return;
      bootDone = true;
      window.clearTimeout(bootTimer);

      try { sessionStorage.setItem('arka-booted', '1'); } catch (error) {}

      boot.classList.add('is-done');
      document.body.classList.remove('is-booting');
      window.setTimeout(function () { boot.hidden = true; }, 480);
    }

    var alreadyBooted = false;
    try { alreadyBooted = sessionStorage.getItem('arka-booted') === '1'; } catch (error) {}

    if (alreadyBooted || reducedMotion) {
      boot.hidden = true;
    } else {
      boot.hidden = false;
      document.body.classList.add('is-booting');
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (bootFill) bootFill.style.width = '100%';
        });
      });
      bootTimer = window.setTimeout(finishBoot, 2050);
    }

    if (bootSkip) bootSkip.addEventListener('click', finishBoot);

    var enterLink = document.querySelector('[data-enter]');
    if (enterLink) {
      enterLink.addEventListener('click', function () {
        try { sessionStorage.setItem('arka-booted', '1'); } catch (error) {}
      });
    }

    var replayBoot = document.querySelector('[data-boot-replay]');
    if (replayBoot) {
      replayBoot.addEventListener('click', function () {
        bootDone = false;
        boot.hidden = false;
        boot.classList.remove('is-done');
        document.body.classList.add('is-booting');
        if (bootFill) bootFill.style.width = '0';
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            if (bootFill) bootFill.style.width = '100%';
          });
        });
        bootTimer = window.setTimeout(finishBoot, 2050);
      });
    }
  }

  /* -----------------------------------------------------------------------
     Contact form
     ----------------------------------------------------------------------- */

  var form = document.getElementById('contactForm');

  if (form) {
    var nameInput = document.getElementById('cfName');
    var emailInput = document.getElementById('cfEmail');
    var messageInput = document.getElementById('cfMessage');
    var status = document.getElementById('cfStatus');
    var submit = document.getElementById('cfSubmit');
    var submitLabel = submit ? submit.querySelector('.btn-label') : null;

    function fieldOf(input) { return input.closest('.field'); }

    function setError(input, message) {
      if (!input) return;
      var field = fieldOf(input);
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
      status.textContent = 'Transmitting…';
      if (submit) {
        submit.disabled = true;
        if (submitLabel) submitLabel.textContent = 'Transmitting…';
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
          status.textContent = 'Channel open — message received. I reply within 24 hours.';
          form.reset();
          [nameInput, emailInput, messageInput].forEach(function (input) { setError(input, ''); });
        })
        .catch(function () {
          status.classList.add('is-error');
          status.textContent = 'Channel busy — email me directly at arkap1502@gmail.com.';
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            if (submitLabel) submitLabel.textContent = 'Send message';
          }
        });
    });
  }
})();
