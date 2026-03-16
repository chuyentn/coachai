import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * P3.6: Per-page document title hook.
 * Call this in any page component to update <title> and improve SEO.
 *
 * @example
 * usePageTitle('Khóa học AI - Edu Victor Chuyen');
 *
 * Appends the brand suffix automatically unless the title already includes it.
 */
const BRAND = 'CoachAI';

export const usePageTitle = (title: string) => {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    const suffix = t('common.pageTitleSuffix');
    const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND} - ${suffix}`;
    document.title = fullTitle;

    // Restore to default on unmount
    return () => {
      document.title = `${BRAND} | ${t('home.pageTitle')}`;
    };
  }, [title, i18n.language, t]);
};
