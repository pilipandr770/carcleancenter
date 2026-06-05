// Car Clean Center – Main JS

document.addEventListener('DOMContentLoaded', () => {
  // ── CONSENT MANAGEMENT ──
  const CONSENT_KEY = 'ccc_cookie_consent_v1';
  const cookieBanner = document.getElementById('cookieBanner');
  const consentModal = document.getElementById('consentModal');
  const consentExternalMedia = document.getElementById('consentExternalMedia');
  const consentOpenSettings = document.getElementById('consentOpenSettings');
  const consentAcceptAll = document.getElementById('consentAcceptAll');
  const consentEssentialOnly = document.getElementById('consentEssentialOnly');
  const consentSave = document.getElementById('consentSave');
  let memoryConsent = null;

  const defaultConsent = {
    essential: true,
    externalMedia: false,
    updatedAt: null,
  };

  const readConsent = () => {
    if (memoryConsent) return memoryConsent;
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const normalized = {
        essential: true,
        externalMedia: Boolean(parsed.externalMedia),
        updatedAt: parsed.updatedAt || null,
      };
      memoryConsent = normalized;
      return normalized;
    } catch (e) {
      return null;
    }
  };

  const writeConsent = (consent) => {
    const payload = {
      essential: true,
      externalMedia: Boolean(consent.externalMedia),
      updatedAt: new Date().toISOString(),
    };
    memoryConsent = payload;
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    } catch (e) {
      // localStorage may be unavailable in strict privacy mode; keep working in memory.
    }
    return payload;
  };

  const openConsentModal = () => {
    if (!consentModal) return;
    const state = readConsent() || defaultConsent;
    if (consentExternalMedia) consentExternalMedia.checked = Boolean(state.externalMedia);
    consentModal.hidden = false;
    consentModal.setAttribute('aria-hidden', 'false');
  };

  const closeConsentModal = () => {
    if (!consentModal) return;
    consentModal.hidden = true;
    consentModal.setAttribute('aria-hidden', 'true');
  };

  const applyExternalMediaConsent = (enabled) => {
    document.querySelectorAll('[data-consent="external-media"]').forEach((container) => {
      const frame = container.querySelector('iframe[data-consent-src]');
      if (!frame) return;

      if (enabled) {
        const src = frame.getAttribute('data-consent-src');
        if (src && !frame.getAttribute('src')) {
          frame.setAttribute('src', src);
        }
        container.classList.add('is-active');
      } else {
        frame.removeAttribute('src');
        container.classList.remove('is-active');
      }
    });
  };

  const applyConsent = (consent) => {
    const state = consent || defaultConsent;
    applyExternalMediaConsent(Boolean(state.externalMedia));
  };

  const setConsentAndApply = (consent) => {
    const saved = writeConsent(consent);
    applyConsent(saved);
    if (cookieBanner) cookieBanner.hidden = true;
    closeConsentModal();
  };

  const existingConsent = readConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
    if (cookieBanner) cookieBanner.hidden = true;
  } else if (cookieBanner) {
    cookieBanner.hidden = false;
    applyConsent(defaultConsent);
  }

  document.querySelectorAll('[data-consent-open]').forEach((el) => {
    el.addEventListener('click', openConsentModal);
  });

  document.querySelectorAll('[data-consent-close]').forEach((el) => {
    el.addEventListener('click', closeConsentModal);
  });

  if (consentOpenSettings) {
    consentOpenSettings.addEventListener('click', openConsentModal);
  }
  if (consentAcceptAll) {
    consentAcceptAll.addEventListener('click', () => {
      setConsentAndApply({ essential: true, externalMedia: true });
    });
  }
  if (consentEssentialOnly) {
    consentEssentialOnly.addEventListener('click', () => {
      setConsentAndApply({ essential: true, externalMedia: false });
    });
  }
  if (consentSave) {
    consentSave.addEventListener('click', () => {
      setConsentAndApply({
        essential: true,
        externalMedia: Boolean(consentExternalMedia?.checked),
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeConsentModal();
  });

  // ── HEADER SCROLL ──
  const header = document.getElementById('header');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── MOBILE NAV ──
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close on nav-link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── FAQ ACCORDION ──
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-question.open').forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll(
    '.service-card, .blog-card, .value-item, .price-section, .contact-card, .gallery-item, .package-card, .home-ba-card, .review-card, .results-wall-item, .area-chip, .why-kpi-card'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
      io.observe(el);
    });
  }

  // ── COUNTER ANIMATION ──
  const counters = document.querySelectorAll('.hero-stat-number');
  counters.forEach(el => {
    const target = el.textContent;
    // Only animate if pure numbers
    if (/^\d+$/.test(target)) {
      const end = parseInt(target);
      let start = 0;
      const step = Math.ceil(end / 30);
      const timer = setInterval(() => {
        start = Math.min(start + step, end);
        el.textContent = start;
        if (start >= end) clearInterval(timer);
      }, 50);
    }
  });

  // ── SMOOTH ANCHOR ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── HERO BACKGROUND SLIDER ──
  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (heroSlides.length > 1) {
    let activeIndex = heroSlides.findIndex(s => s.classList.contains('active'));
    if (activeIndex < 0) activeIndex = 0;

    const setSlide = (index) => {
      activeIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === activeIndex);
      });
      heroDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    };

    let heroTimer = setInterval(() => {
      setSlide(activeIndex + 1);
    }, 5000);

    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        setSlide(i);
        clearInterval(heroTimer);
        heroTimer = setInterval(() => {
          setSlide(activeIndex + 1);
        }, 5000);
      });
    });
  }

  // ── HERO PARALLAX + BEFORE/AFTER MOTION ──
  const heroBgTrack = document.getElementById('heroBgTrack');
  const homeBaCards = document.querySelectorAll('.home-ba-card');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && (heroBgTrack || homeBaCards.length)) {
    if (heroBgTrack) {
      heroBgTrack.style.transform = 'translateY(0)';
    }
    homeBaCards.forEach((card) => {
      const divider = card.querySelector('.home-ba-divider');
      const afterWrap = card.querySelector('.home-ba-after-wrap');
      if (!divider || !afterWrap) return;
      divider.style.left = '50%';
      afterWrap.style.clipPath = 'inset(0 0 0 50%)';
    });
  }

  // ── PROMO COUNTDOWN (resets weekly) ──
  const promoTimerValue = document.getElementById('promoTimerValue');
  if (promoTimerValue) {
    const getNextMonday = () => {
      const now = new Date();
      const day = now.getDay(); // 0..6
      const daysToAdd = day === 1 ? 7 : ((8 - day) % 7);
      const target = new Date(now);
      target.setDate(now.getDate() + daysToAdd);
      target.setHours(0, 0, 0, 0);
      return target;
    };

    let deadline = getNextMonday();

    const formatDiff = (ms) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const d = Math.floor(totalSeconds / 86400);
      const h = Math.floor((totalSeconds % 86400) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    };

    const tick = () => {
      const now = new Date();
      if (deadline <= now) {
        deadline = getNextMonday();
      }
      promoTimerValue.textContent = formatDiff(deadline - now);
    };

    tick();
    setInterval(tick, 1000);
  }

});
