import React, { useEffect, useRef } from 'react';

export function LegacyStepper({ id }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let timer;
    const tryMount = () => {
      if (window.VIZ && mountRef.current) {
        window.VIZ.mount(id, mountRef.current);
      } else {
        timer = setTimeout(tryMount, 100);
      }
    };
    tryMount();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  return <div ref={mountRef} className="legacy-stepper" />;
}
