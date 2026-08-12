import { useEffect, useRef } from 'react';

/**
 * Every screen in this app is a fixed 390×844 design (the same convention
 * the static prototype used) scaled to fit whatever viewport it's opened
 * in — a phone, a desktop browser window, anything. This hook owns that
 * scaling: it measures the viewport, computes a --scale custom property,
 * and writes it onto the returned ref's element (expected to be the
 * .stage wrapper div).
 */
export default function useStageScale(designWidth = 390, designHeight = 844) {
  const stageRef = useRef(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    function fit() {
      const pad = window.innerWidth < 480 ? 0 : 32;
      const scale = Math.min(
        (window.innerWidth - pad) / designWidth,
        (window.innerHeight - pad) / designHeight
      );
      el.style.setProperty('--scale', Math.max(0.3, Math.min(scale, 1.6)));
    }

    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, [designWidth, designHeight]);

  return stageRef;
}
