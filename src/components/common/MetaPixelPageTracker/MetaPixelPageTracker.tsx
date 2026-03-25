import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const MetaPixelPageTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
      fbq('track', 'ViewContent');
    }
  }, [pathname]);

  return null;
};
