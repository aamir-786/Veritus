import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal wrapper component that triggers entrance animations
 * when elements enter the viewport.
 * 
 * Props:
 * - animation: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'fade'
 * - delay: delay in ms (e.g. 0, 100, 200, 300)
 * - duration: duration in ms (default 700)
 * - className: additional wrapper classes
 */
export default function ScrollReveal({
  children,
  animation = 'slide-up',
  delay = 0,
  duration = 700,
  className = '',
  once = false
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            // Re-trigger animation when scrolling back up/down if not once
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [once]);

  const getAnimStyles = () => {
    const baseTransition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    if (!isVisible) {
      switch (animation) {
        case 'slide-up':
          return { opacity: 0, transform: 'translateY(40px)', transition: baseTransition };
        case 'slide-down':
          return { opacity: 0, transform: 'translateY(-40px)', transition: baseTransition };
        case 'slide-left':
          return { opacity: 0, transform: 'translateX(-50px)', transition: baseTransition };
        case 'slide-right':
          return { opacity: 0, transform: 'translateX(50px)', transition: baseTransition };
        case 'zoom-in':
          return { opacity: 0, transform: 'scale(0.92)', transition: baseTransition };
        case 'fade':
        default:
          return { opacity: 0, transition: baseTransition };
      }
    }

    return {
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1)',
      transition: baseTransition
    };
  };

  return (
    <div ref={domRef} style={getAnimStyles()} className={className}>
      {children}
    </div>
  );
}
