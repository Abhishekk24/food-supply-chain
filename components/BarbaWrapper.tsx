"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function BarbaWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Barba-like transitions
    const container = wrapperRef.current?.querySelector('[data-barba="container"]');
    if (!container) return;

    // Initial animation
    gsap.from(container, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out"
    });

    // Route change animation
    const handleRouteChange = () => {
      gsap.to(container, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => {
          gsap.from(container, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power3.out"
          });
        }
      });
    };

    // Simulate Barba's beforeEnter and enter hooks
    handleRouteChange();
  }, [pathname]);

  return (
    <div ref={wrapperRef} data-barba="wrapper">
      {children}
    </div>
  );
}