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

  /* --------------------------------------------------------- skill readout */

  /* Builds that exist on the Work page carry an href, so the readout can link
     to them. Everything else is plain text. */
  var builds = {
    copilot: { title: 'Website Security Copilot', href: 'projects.html#project-copilot' },
    netraksha: { title: 'Netraksha', href: 'projects.html#project-netraksha' },
    nexvault: { title: 'NexVault', href: 'projects.html#project-nexvault' },
    humanize: { title: 'Humanize AI', href: 'projects.html#project-humanize' },
    urlScanner: { title: 'URL Scanner' },
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
