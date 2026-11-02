/* ==========================================================================
   Arka Patra — shared site behaviour
   Header state · mobile menu · scroll reveals · project filters & details
   email copy · contact form
   ========================================================================== */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.getElementById('siteHeader');
    var menu = document.getElementById('mobileMenu');
    var toggle = document.getElementById('menuToggle');

    /* Header shadow after scrolling -------------------------------------- */
    if (header) {
      var syncHeader = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
      };
      syncHeader();
      window.addEventListener('scroll', syncHeader, { passive: true });
    }

    /* Mobile menu -------------------------------------------------------- */
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
        if (event.key === 'Escape') {
          closeMenu();
          toggle.focus();
        }
      });

      document.addEventListener('click', function (event) {
        if (toggle.getAttribute('aria-expanded') !== 'true') return;
        if (menu.contains(event.target) || toggle.contains(event.target)) return;
        closeMenu();
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 1080) closeMenu();
      });
    }

    /* Entry screen — the inactive device is a visual preview only -------- */
    var entryLaptop = document.querySelector('.entry-devices .device--laptop');
    var entryPhone = document.querySelector('.entry-devices .device--phone');
    var compactEntry = window.matchMedia('(max-width: 1024px)');

    function setDevicePreview(device, previewOnly) {
      if (!device) return;
      device.classList.toggle('is-static', previewOnly);

      if (previewOnly) {
        device.setAttribute('tabindex', '-1');
        device.setAttribute('aria-hidden', 'true');
      } else {
        device.removeAttribute('tabindex');
        device.removeAttribute('aria-hidden');
      }
    }

    function syncEntryDevices() {
      /* Phone screens open with the phone; larger screens open with the laptop. */
      setDevicePreview(entryLaptop, compactEntry.matches);
      setDevicePreview(entryPhone, !compactEntry.matches);
    }

    syncEntryDevices();

    if (compactEntry.addEventListener) {
      compactEntry.addEventListener('change', syncEntryDevices);
    } else if (compactEntry.addListener) {
      compactEntry.addListener(syncEntryDevices);
    }

    /* Scroll reveals ----------------------------------------------------- */
    var revealItems = document.querySelectorAll('[data-reveal]');

    if (!reducedMotion && 'IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .1, rootMargin: '0px 0px -5% 0px' });

      revealItems.forEach(function (item) { revealObserver.observe(item); });
    } else {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }

    /* Project filters ---------------------------------------------------- */
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
    var buildCards = Array.prototype.slice.call(document.querySelectorAll('.build-card'));
    var buildCount = document.getElementById('buildCount');
    var emptyState = document.getElementById('buildEmpty');

    /* Project details ---------------------------------------------------- */
    var buildToggles = Array.prototype.slice.call(document.querySelectorAll('.build-toggle'));

    function setCardOpen(card, button, open) {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var title = card.querySelector('.build-title');
      if (!panel) return;

      card.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      if ('inert' in panel) panel.inert = !open;
      button.setAttribute('aria-label', (open ? 'Hide' : 'Show') + ' technical details for ' + (title ? title.textContent.trim() : 'this project'));

      if (open && !reducedMotion) {
        window.setTimeout(function () {
          if (!card.classList.contains('is-open')) return;
          var rect = card.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 380);
      }
    }

    function closeAllCards() {
      buildToggles.forEach(function (button) {
        var card = button.closest('.build-card');
        if (card && card.classList.contains('is-open')) setCardOpen(card, button, false);
      });
    }

    buildToggles.forEach(function (button) {
      var card = button.closest('.build-card');
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      if (panel && 'inert' in panel) panel.inert = true;

      button.addEventListener('click', function () {
        if (!card) return;
        var willOpen = button.getAttribute('aria-expanded') !== 'true';
        if (willOpen) {
          buildToggles.forEach(function (other) {
            if (other === button) return;
            var otherCard = other.closest('.build-card');
            if (otherCard) setCardOpen(otherCard, other, false);
          });
        }
        setCardOpen(card, button, willOpen);
      });
    });

    /* Open the matching project when arriving from the home preview */
    function openHashProject() {
      var hash = window.location.hash;
      if (!hash || hash.indexOf('#build-') !== 0) return;
      var target = document.querySelector(hash);
      if (!target || !target.classList.contains('build-card')) return;
      var button = target.querySelector('.build-toggle');
      if (button) setCardOpen(target, button, true);
    }

    window.addEventListener('hashchange', openHashProject);
    openHashProject();

    if (filterButtons.length && buildCards.length) {
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.dataset.filter || 'all';

          filterButtons.forEach(function (item) {
            var active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });

          closeAllCards();

          var shown = 0;
          buildCards.forEach(function (card) {
            var match = filter === 'all' || card.dataset.category === filter;
            card.hidden = !match;
            if (match) shown += 1;
          });

          if (buildCount) {
            buildCount.textContent = String(shown).padStart(2, '0') + (shown === 1 ? ' build' : ' builds');
          }
          if (emptyState) emptyState.hidden = shown !== 0;
        });
      });
    }

    /* Click-to-copy email ------------------------------------------------ */
    document.querySelectorAll('[data-copy]').forEach(function (button) {
      var row = button.closest('.contact-row');
      var status = row ? row.querySelector('.copy-status') : null;
      var resetTimer;
      var buttonTimer;

      function legacyCopy(value) {
        var input = document.createElement('textarea');
        input.value = value;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        var copied = false;
        try {
          copied = document.execCommand('copy');
        } catch (error) {
          copied = false;
        }
        document.body.removeChild(input);
        return copied;
      }

      function selectEmail() {
        var value = row ? row.querySelector('.contact-value') : null;
        if (!value || !window.getSelection) return false;
        var range = document.createRange();
        range.selectNodeContents(value);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }

      function setButtonLabel(label) {
        button.textContent = label;
        clearTimeout(buttonTimer);
        buttonTimer = setTimeout(function () { button.textContent = 'Copy'; }, 2600);
      }

      button.addEventListener('click', function () {
        var value = button.dataset.copy;
        if (!value) return;

        function confirmCopy(message) {
          if (status) {
            status.textContent = message;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(function () { status.textContent = ''; }, 2600);
          }
          setButtonLabel('Copied');
        }

        function fallbackCopy() {
          if (legacyCopy(value)) {
            confirmCopy('Copied to clipboard');
          } else if (selectEmail()) {
            confirmCopy('Press Ctrl/Cmd+C to copy');
          } else {
            confirmCopy('Copy failed — select the address');
          }
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value)
            .then(function () { confirmCopy('Copied to clipboard'); })
            .catch(fallbackCopy);
        } else {
          fallbackCopy();
        }
      });
    });

    /* Contact form ------------------------------------------------------- */
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
