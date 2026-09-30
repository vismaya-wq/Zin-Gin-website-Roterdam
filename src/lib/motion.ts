import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

const navOffset = () =>
  -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 84) - 12;

export function scrollToTarget(target: string | HTMLElement, extraOffset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const offset = navOffset() - extraOffset;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}

declare global {
  interface Window {
    zgScrollTo?: typeof scrollToTarget;
    zgLockScroll?: typeof lockScroll;
  }
}

function initSmoothScroll(reduced: boolean) {
  if (!reduced) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.zgScrollTo = scrollToTarget;
  window.zgLockScroll = lockScroll;

  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', url.hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    scrollToTarget(target, Number(target.dataset.scrollOffset ?? 0));
  });

  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      requestAnimationFrame(() => window.scrollTo(0, 0));
      setTimeout(() => scrollToTarget(target, Number(target.dataset.scrollOffset ?? 0)), 450);
    }
  }
}

function revealLines(root: Element, immediate: boolean) {
  const spans = root.querySelectorAll('.line > span');
  gsap.to(spans, {
    yPercent: 0,
    y: 0,
    duration: 1.35,
    ease: 'expo.out',
    stagger: 0.11,
    delay: immediate ? 0.25 + Number((root as HTMLElement).dataset.delay ?? 0) : 0,
    scrollTrigger: immediate ? undefined : { trigger: root, start: 'top 86%', once: true },
  });
}

function initReveals() {
  gsap.set('[data-reveal="lines"] .line > span', { yPercent: 110, y: 0 });

  document.querySelectorAll('[data-reveal="lines"]').forEach((el) => {
    revealLines(el, el.hasAttribute('data-immediate'));
  });

  document.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    const immediate = el.hasAttribute('data-immediate');
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay: Number(el.dataset.delay ?? 0) + (immediate ? 0.5 : 0),
      onComplete: () => {
        el.classList.add('is-revealed');
        gsap.set(el, { clearProps: 'transform,opacity' });
      },
      scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 90%', once: true },
    });
  });

  document.querySelectorAll<HTMLElement>('[data-reveal="image"]').forEach((el) => {
    const immediate = el.hasAttribute('data-immediate');
    const tl = gsap.timeline({
      delay: Number(el.dataset.delay ?? 0) + (immediate ? 0.2 : 0),
      scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%', once: true },
    });
    tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' }).to(
      el.querySelectorAll('img'),
      { scale: 1, duration: 2, ease: 'expo.out' },
      0.15,
    );
  });
}

function initParallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 0.12);
    const frame = el.closest('.media') ?? el.parentElement!;
    gsap.fromTo(
      el,
      { yPercent: -amount * 50 },
      {
        yPercent: amount * 50,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  document.querySelectorAll<HTMLElement>('[data-drift]').forEach((el) => {
    const amount = Number(el.dataset.drift || 60);
    gsap.fromTo(
      el,
      { y: amount },
      {
        y: -amount,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function initHorizontal(mm: gsap.MatchMedia) {
  mm.add('(min-width: 1024px)', () => {
    document.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const progress = section.querySelector<HTMLElement>('[data-hscroll-progress]');
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => progress && gsap.set(progress, { scaleX: self.progress }),
        },
      });
      section.querySelectorAll<HTMLElement>('[data-hscroll-item] img').forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -6 },
          {
            xPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('[data-hscroll-item]')!,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });
    });
  });
}

function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const autoHide = document.body.dataset.page !== 'menu';
  let lastY = window.scrollY;
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (autoHide) {
      if (y > 420 && y > lastY + 4 && !nav.classList.contains('is-open')) nav.classList.add('is-hidden');
      if (y < lastY - 4 || y < 420) nav.classList.remove('is-hidden');
    }
    lastY = y;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

export function initMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  initSmoothScroll(reduced);
  initNav();
  if (reduced) {
    document.documentElement.classList.remove('js-motion');
    return;
  }

  // Pinned sections first so later triggers are measured with pin spacing in place.
  const mm = gsap.matchMedia();
  initHorizontal(mm);
  initReveals();
  initParallax();

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };
