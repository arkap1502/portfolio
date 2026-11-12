/* ==========================================================================
   Arka Patra — LUNAR interface behaviour
   Theme and palette · header menu · scroll reveals · live threat monitor
   project filters and details · contact form
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paletteNames = {
    pearl: 'Pearl',
    obsidian: 'Obsidian',
    glacier: 'Glacier',
    nebula: 'Nebula',
    lunar: 'Lunar'
  };
  /* Hero art is a dedicated 1200px square per visor set; the strip keeps the
     small thumbnails so the picker stays light. */
  var paletteArt = {
    pearl: { src: 'assets/theme-pearl-hero.webp?v=3', alt: 'Astronaut in a white suit with a gold mirrored visor' },
    obsidian: { src: 'assets/theme-obsidian-hero.webp?v=3', alt: 'Astronaut in a dark suit with a blue visor' },
    glacier: { src: 'assets/theme-glacier-hero.webp?v=3', alt: 'Astronaut in a white suit with a teal visor' },
    nebula: { src: 'assets/theme-nebula-hero.webp?v=3', alt: 'Astronaut in a dark suit with a violet visor' },
    lunar: { src: 'assets/lunar-hero.webp?v=3', alt: 'Astronaut in a polished white suit with a dark reflective visor' }
  };

  /* -----------------------------------------------------------------------
     Theme and palette
     ----------------------------------------------------------------------- */

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  /* The browser chrome follows the active theme, whatever canvas it uses. */
  function syncMetaColor() {
    var meta = document.getElementById('metaTheme');
    if (!meta) return;
    var bg = window.getComputedStyle(root).getPropertyValue('--bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }

  function syncTheme() {
    var theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    document.querySelectorAll('[data-set-theme]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-set-theme') === theme));
    });
    syncMetaColor();
  }

  function syncHero(palette, animate) {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;

    var art = paletteArt[palette] || paletteArt.lunar;
    var current = hero.getAttribute('src');
    if (current === art.src) return;

    if (!animate || reducedMotion) {
      hero.setAttribute('src', art.src);
      hero.setAttribute('alt', art.alt);
      return;
    }

    hero.classList.add('is-swapping');
    window.setTimeout(function () {
      hero.setAttribute('src', art.src);
      hero.setAttribute('alt', art.alt);
      hero.classList.remove('is-swapping');
    }, 170);
  }

  function syncPalette(animate) {
    var palette = root.getAttribute('data-palette') || 'lunar';
    var label = document.getElementById('paletteName');
    if (label) label.textContent = paletteNames[palette] || 'Lunar';
    document.querySelectorAll('.theme-thumb[data-palette]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-palette') === palette));
    });
    syncHero(palette, animate);
    syncMetaColor();
  }

  function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    root.setAttribute('data-theme', theme);
    store('arka-theme', theme);
    syncTheme();
  }

  function setPalette(palette) {
    if (!paletteNames[palette]) return;
    root.setAttribute('data-palette', palette);
    store('arka-palette', palette);
    syncPalette(true);
  }

  syncTheme();
  syncPalette(false);

  /* Warm the other visor portraits on first interaction with the strip, so a
     palette change swaps instantly without loading every hero up front. */
  var strip = document.querySelector('.theme-strip');

  if (strip) {
    var warmed = false;
    var warmArt = function () {
      if (warmed) return;
      warmed = true;
      var heroSrc = document.querySelector('[data-hero]') ? document.querySelector('[data-hero]').getAttribute('src') : '';
      Object.keys(paletteArt).forEach(function (key) {
        if (paletteArt[key].src === heroSrc) return;
        var preload = new Image();
        preload.src = paletteArt[key].src;
      });
    };
    strip.addEventListener('pointerenter', warmArt);
    strip.addEventListener('focusin', warmArt);
  }

  document.querySelectorAll('[data-set-theme]').forEach(function (button) {
    button.addEventListener('click', function () {
      setTheme(button.getAttribute('data-set-theme'));
    });
  });

  document.querySelectorAll('.theme-thumb[data-palette]').forEach(function (button) {
    button.addEventListener('click', function () {
      setPalette(button.getAttribute('data-palette'));
    });
  });

  /* -----------------------------------------------------------------------
     Mobile menu
     ----------------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    var menu = document.getElementById('mobileMenu');
    var toggle = document.getElementById('menuToggle');

    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      menu.setAttribute('aria-hidden', 'true');
    }

    if (menu && toggle) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.classList.toggle('is-open', open);
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
        if (window.innerWidth > 900) closeMenu();
      });
    }

    /* ---------------------------------------------------------------------
       Scroll reveals
       --------------------------------------------------------------------- */

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

      /* Safety net: never leave content permanently hidden if the observer misses it. */
      window.setTimeout(function () {
        revealItems.forEach(function (item) { item.classList.add('is-visible'); });
      }, 5000);
    } else {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }

    /* ---------------------------------------------------------------------
       Live threat monitor
       --------------------------------------------------------------------- */

    var threatMessage = document.getElementById('threatMessage');
    var threatLevel = document.getElementById('threatLevel');

    if (threatMessage && threatLevel && !reducedMotion) {
      var threats = [
        { text: 'Typosquatted domain detected', level: 'High' },
        { text: 'Phishing link intercepted', level: 'High' },
        { text: 'Weak password pattern found', level: 'Medium' },
        { text: 'Certificate expiring in 6 days', level: 'Low' },
        { text: 'Lookalike login page blocked', level: 'High' }
      ];
      var threatIndex = 0;

      window.setInterval(function () {
        if (document.hidden) return;
        threatIndex = (threatIndex + 1) % threats.length;
        threatMessage.textContent = threats[threatIndex].text;
        threatLevel.textContent = threats[threatIndex].level;
      }, 5200);
    }

    /* ---------------------------------------------------------------------
       Project data
       --------------------------------------------------------------------- */

    var projects = {
      copilot: {
        index: '01',
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
        index: '02',
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
      url: {
        index: '03',
        title: 'URL Threat Scanner',
        category: 'Web security · Phishing detection',
        status: 'Completed',
        desc: 'Client-side URL analysis flags raw IPs, uncommon TLDs, lookalike brand spellings and phishing keywords, then combines them into a 0–100 risk score with a plain-language verdict.',
        stack: ['JavaScript', 'HTML', 'CSS'],
        links: [
          { label: 'Live demo', href: 'https://arkap1502.github.io/URL-Scanner/' },
          { label: 'Source code', href: 'https://github.com/arkap1502/URL-Scanner' }
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

    /* ---------------------------------------------------------------------
       Project links — live demo and source on the card itself
       --------------------------------------------------------------------- */

    document.querySelectorAll('.project-card[data-project]').forEach(function (card) {
      var project = projects[card.getAttribute('data-project')];
      var body = card.querySelector('.project-card__body');
      if (!project || !body || !project.links || !project.links.length) return;
      if (body.querySelector('.project-card__links')) return;

      var row = document.createElement('div');
      row.className = 'project-card__links';

      project.links.forEach(function (link) {
        var anchor = document.createElement('a');
        anchor.className = 'project-card__link';
        anchor.href = link.href;
        if (link.href.indexOf('http') === 0) {
          anchor.target = '_blank';
          anchor.rel = 'noopener';
        }
        anchor.innerHTML = link.label + ' <span aria-hidden="true">↗</span>';
        row.appendChild(anchor);
      });

      body.appendChild(row);
    });

    /* ---------------------------------------------------------------------
       Project details dialogue
       --------------------------------------------------------------------- */

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

      function openProject(card, trigger) {
        var project = projects[card.getAttribute('data-project')];
        if (!project) return;
        lastTrigger = trigger;
        fillDialog(project);
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }

      function closeDialog() {
        if (!dialog.open) return;
        dialog.close();
      }

      document.querySelectorAll('.project-card').forEach(function (card) {
        var trigger = card.querySelector('.project-open');
        if (!trigger) return;
        trigger.addEventListener('click', function () {
          openProject(card, trigger);
        });
      });

      dialog.querySelectorAll('[data-close-dialog]').forEach(function (button) {
        button.addEventListener('click', closeDialog);
      });

      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) closeDialog();
      });

      dialog.addEventListener('close', function () {
        document.body.style.overflow = '';
        if (lastTrigger) lastTrigger.focus();
      });
    }

    /* ---------------------------------------------------------------------
       Project filters
       --------------------------------------------------------------------- */

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
    var filterCount = document.getElementById('filterCount');
    var emptyState = document.getElementById('buildEmpty');
    var moreHead = document.getElementById('moreHead');
    var moreGrid = document.getElementById('moreGrid');
    var moreCount = document.getElementById('moreCount');

    function applyFilter(filter) {
      var shown = 0;
      var shownMore = 0;

      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-status') === filter;
        card.classList.toggle('is-hidden', !match);
        if (!match) return;
        shown += 1;
        if (moreGrid && moreGrid.contains(card)) shownMore += 1;
      });

      if (filterCount) {
        filterCount.textContent = String(shown).padStart(2, '0') + (shown === 1 ? ' build' : ' builds');
      }
      if (moreCount) {
        moreCount.textContent = String(shownMore).padStart(2, '0');
      }
      if (moreHead) {
        moreHead.hidden = shownMore === 0;
      }
      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }

      filterButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
      });
    }

    if (filterButtons.length && cards.length) {
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          applyFilter(button.getAttribute('data-filter') || 'all');
        });
      });
    }

    /* ---------------------------------------------------------------------
       Contact form
       --------------------------------------------------------------------- */

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
        status.textContent = 'Sending…';
        if (submit) {
          submit.disabled = true;
          if (submitLabel) submitLabel.textContent = 'Sending…';
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
            status.textContent = 'Message sent — I reply within 24 hours.';
            form.reset();
            [nameInput, emailInput, messageInput].forEach(function (input) { setError(input, ''); });
          })
          .catch(function () {
            status.classList.add('is-error');
            status.textContent = 'Could not send just now — email me directly at arkap1502@gmail.com.';
          })
          .finally(function () {
            if (submit) {
              submit.disabled = false;
              if (submitLabel) submitLabel.textContent = 'Send message';
            }
          });
      });
    }
  });
})();
