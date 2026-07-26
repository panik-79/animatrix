import { useState, useEffect, RefObject } from 'react';

export function useIntersection(
  ref: RefObject<Element | null>,
  options: IntersectionObserverInit = { threshold: 0, rootMargin: '0px' }
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry?.isIntersecting ?? false);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.rootMargin, options.root]);

  return isIntersecting;
}
