import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// P2.1 Fix: Load GA script only once at module level, not inside an effect.
// Previously, the effect with cleanup removed and re-added the scripts on every
// component unmount/remount (e.g., during React Strict Mode double-invoke, or HMR).
let gaLoaded = false;
if (GA_MEASUREMENT_ID && !gaLoaded) {
  gaLoaded = true;
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
  `;
  document.head.appendChild(script2);
}

export const GoogleAnalytics = () => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

// Add gtag to window type
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
