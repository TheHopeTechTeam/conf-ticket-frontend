import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const MetaPixelPageTracker = () => {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 跳過首次 render，避免與 index.html 的初始追蹤重複
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
      fbq('track', 'ViewContent');
    }
  }, [pathname]);

  return null;
};
