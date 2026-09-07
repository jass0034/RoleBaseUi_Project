'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dot = useRef(null); const ring = useRef(null); const label = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const xDot = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' }); const yDot = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' });
    const xRing = gsap.quickTo(ring.current, 'x', { duration: 0.32, ease: 'power3.out' }); const yRing = gsap.quickTo(ring.current, 'y', { duration: 0.32, ease: 'power3.out' });
    const move = (e) => { xDot(e.clientX - 3.5); yDot(e.clientY - 3.5); xRing(e.clientX - 18); yRing(e.clientY - 18); };
    const activate = (e) => { const target = e.currentTarget; label.current.textContent = target.dataset.cursor || (target.tagName === 'BUTTON' ? 'TAP' : 'OPEN'); gsap.to(ring.current, { scale: 1.25, duration: .22, ease: 'power3.out' }); gsap.to(label.current, { autoAlpha: 1, duration: .16 }); gsap.to(dot.current, { scale: 0, duration: .15 }); };
    const deactivate = () => { gsap.to(ring.current, { scale: 1, duration: .3, ease: 'elastic.out(1, 0.55)' }); gsap.to(label.current, { autoAlpha: 0, duration: .12 }); gsap.to(dot.current, { scale: 1, duration: .15 }); };
    const press = () => gsap.to(ring.current, { scale: .84, duration: .12 }); const release = () => gsap.to(ring.current, { scale: 1.25, duration: .18 });
    const interactive = document.querySelectorAll('a, button, input, select'); window.addEventListener('mousemove', move);
    interactive.forEach((el) => { el.addEventListener('mouseenter', activate); el.addEventListener('mouseleave', deactivate); el.addEventListener('mousedown', press); el.addEventListener('mouseup', release); });
    return () => { window.removeEventListener('mousemove', move); interactive.forEach((el) => { el.removeEventListener('mouseenter', activate); el.removeEventListener('mouseleave', deactivate); el.removeEventListener('mousedown', press); el.removeEventListener('mouseup', release); }); };
  }, []);
  return <><div ref={ring} className="cursor-ring"><span ref={label} className="cursor-label" /></div><div ref={dot} className="cursor-dot" /></>;
}
