/* ==========================================================================
   Arka Patra — shared site behaviour
   Header state · mobile menu · scroll reveals · project filters
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
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      syncHeader();
      window.addEventListener('scroll', syncHeader, { passive: true });
    }

    /* Mobile menu -------------------------------------------------------- */
    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    }

    if (menu && toggle) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
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
        if (window.innerWidth > 980) closeMenu();
      });
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
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

      revealItems.forEach(function (item) { revealObserver.observe(item); });
    } else {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }

    /* Project filters ---------------------------------------------------- */
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
    var buildCards = Array.prototype.slice.call(document.querySelectorAll('.build-card'));
    var buildCount = document.getElementById('buildCount');
    var emptyState = document.getElementById('buildEmpty');

    if (filterButtons.length && buildCards.length) {
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.dataset.filter || 'all';

          filterButtons.forEach(function (item) {
            var active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });

          var shown = 0;
          buildCards.forEach(function (card) {
            var match = filter === 'all' || card.dataset.category === filter;
            card.hidden = !match;
            if (match) shown += 1;
            if (!match) {
              var details = card.querySelector('details');
              if (details) details.open = false;
            }
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
      var status = button.parentElement.querySelector('.copy-status');
      var resetTimer;

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
        var value = button.querySelector('.method-value');
        if (!value || !window.getSelection) return false;
        var range = document.createRange();
        range.selectNodeContents(value);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }

      button.addEventListener('click', function () {
        var value = button.dataset.copy;
        if (!value) return;

        function confirmCopy(message) {
          if (!status) return;
          status.textContent = message;
          clearTimeout(resetTimer);
          resetTimer = setTimeout(function () { status.textContent = ''; }, 2600);
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

      function fieldOf(input) { return input.closest('.field'); }

      function setError(input, message) {
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
              submit.textContent = 'Send message';
            }
          });
      });
    }
  });
})();
