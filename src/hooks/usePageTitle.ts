import { useEffect } from 'react';

/**
 * P3.6: Per-page document title hook.
 * Call this in any page component to update <title> and improve SEO.
 *
 * @example
 * usePageTitle('Khóa học AI - Edu Victor Chuyen');
 *
 * Appends the brand suffix automatically unless the title already includes it.
 */
const BRAND = 'Edu Victor Chuyen';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
    document.title = fullTitle;

    // Restore to default on unmount
    return () => {
      document.title = `${BRAND} | Nền tảng học AI & Coaching hàng đầu Việt Nam`;
    };
  }, [title]);
};
