'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function MotionProvider() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
      });
      gsap.utils.toArray('[data-heading-hover], main h1, main h2').forEach((heading) => {
        const enter = () => gsap.to(heading, { scale: 1.018, y: -3, color: '#375dfb', duration: 0.32, ease: 'power3.out', overwrite: 'auto' });
        const leave = () => gsap.to(heading, { scale: 1, y: 0, color: '#0f172a', duration: 0.42, ease: 'elastic.out(1, 0.55)', overwrite: 'auto' });
        heading.addEventListener('mouseenter', enter);
        heading.addEventListener('mouseleave', leave);
        heading._headingCleanup = () => { heading.removeEventListener('mouseenter', enter); heading.removeEventListener('mouseleave', leave); };
      });
      gsap.utils.toArray('[data-magnetic], main a[class*="bg-slate-950"]').forEach((element) => {
        const move = (event) => { const box = element.getBoundingClientRect(); gsap.to(element, { x: (event.clientX - box.left - box.width / 2) * 0.16, y: (event.clientY - box.top - box.height / 2) * 0.18, duration: 0.35, ease: 'power3.out', overwrite: 'auto' }); };
        const leave = () => gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
        element.addEventListener('mousemove', move);
        element.addEventListener('mouseleave', leave);
        element._magneticCleanup = () => { element.removeEventListener('mousemove', move); element.removeEventListener('mouseleave', leave); };
      });
    });
    return () => { document.querySelectorAll('[data-heading-hover], main h1, main h2').forEach((el) => el._headingCleanup?.()); document.querySelectorAll('[data-magnetic], main a[class*="bg-slate-950"]').forEach((el) => el._magneticCleanup?.()); context.revert(); };
  }, []);
  return null;
}
