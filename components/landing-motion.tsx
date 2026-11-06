"use client";

import { useEffect } from "react";

// Scroll reveal for the landing page. Anything marked data-reveal fades in and
// rises as it scrolls into view, once. Siblings stagger by 80ms.
// Nothing is hidden until this runs, so the page reads fine without JavaScript,
// and elements already on screen are never hidden at all.
export function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const siblings = new Map<Element | null, number>();
    for (const el of targets) {
      const index = siblings.get(el.parentElement) ?? 0;
      siblings.set(el.parentElement, index + 1);
      el.style.transitionDelay = `${index * 80}ms`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("reveal-hidden");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    for (const el of targets) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) continue;
      el.classList.add("reveal-hidden");
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      targets.forEach((el) => el.classList.remove("reveal-hidden"));
    };
  }, []);

  return null;
}
