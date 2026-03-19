import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { googleSheetsService } from '../services/googleSheetsService';

export interface SaaSConfig {
  appName: string;
  companyName: string;
  logoUrl?: string;
  seoDescription?: string;
  supportEmail: string;
  adminZalo: string;
  adminTelegram: string;
  fbGroupUrl: string;
  zaloGroupUrl: string;
  telegramGroupUrl: string;
  whatsappGroupUrl: string;
  whatsappChannelUrl: string;
  adminWhatsappLink?: string;
  heroTitle1?: string;
  heroTitle2?: string;
  heroSubtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  loading: boolean;
}

export const useSaaSConfig = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'vi';
  
  const [config, setConfig] = useState<SaaSConfig>({
    appName: import.meta.env.VITE_APP_NAME || 'CoachAI',
    companyName: import.meta.env.VITE_COMPANY_NAME || 'CoachAI',
    logoUrl: '',
    seoDescription: '',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@coachai.vn',
    adminZalo: import.meta.env.VITE_ADMIN_ZALO_PHONE || '0989.890.022',
    adminTelegram: import.meta.env.VITE_ADMIN_TELEGRAM_USER || '@victorchuyen',
    fbGroupUrl: import.meta.env.VITE_FB_GROUP_URL || '',
    zaloGroupUrl: import.meta.env.VITE_ZALO_GROUP_URL || '',
    telegramGroupUrl: import.meta.env.VITE_TELEGRAM_GROUP_URL || '',
    whatsappGroupUrl: import.meta.env.VITE_WHATSAPP_GROUP_URL || '',
    whatsappChannelUrl: import.meta.env.VITE_WHATSAPP_CHANNEL_URL || '',
    adminWhatsappLink: '',
    loading: true
  });

  useEffect(() => {
    const fetchRemoteConfig = async () => {
      try {
        const remoteData = await googleSheetsService.fetchPageContent(lang);
        if (remoteData && Object.keys(remoteData).length > 0) {
          setConfig(prev => ({
            ...prev,
            appName: remoteData.app_name || prev.appName,
            companyName: remoteData.company_name || prev.companyName,
            logoUrl: remoteData.logo_url || prev.logoUrl,
            seoDescription: remoteData.seo_description || prev.seoDescription,
            supportEmail: remoteData.support_email || prev.supportEmail,
            adminZalo: remoteData.admin_zalo_phone || prev.adminZalo,
            adminTelegram: remoteData.admin_telegram_user || prev.adminTelegram,
            fbGroupUrl: remoteData.fb_group_url || prev.fbGroupUrl,
            zaloGroupUrl: remoteData.zalo_group_url || prev.zaloGroupUrl,
            telegramGroupUrl: remoteData.telegram_group_url || prev.telegramGroupUrl,
            whatsappGroupUrl: remoteData.whatsapp_group_url || prev.whatsappGroupUrl,
            whatsappChannelUrl: remoteData.whatsapp_channel_url || prev.whatsappChannelUrl,
            adminWhatsappLink: remoteData.admin_whatsapp_link || prev.adminWhatsappLink,
            // Hero config
            heroTitle1: remoteData.hero_title?.includes('|') ? remoteData.hero_title.split('|')[0] : remoteData.hero_title,
            heroTitle2: remoteData.hero_title?.includes('|') ? remoteData.hero_title.split('|')[1] : '',
            heroSubtitle: remoteData.hero_subtitle,
            ctaPrimary: remoteData.cta_primary,
            ctaSecondary: remoteData.cta_secondary,
            loading: false
          }));
        } else {
          setConfig(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error in useSaaSConfig:', error);
        setConfig(prev => ({ ...prev, loading: false }));
      }
    };

    fetchRemoteConfig();
  }, [lang]);

  useEffect(() => {
    // Update SEO Meta Description
    if (config.seoDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', config.seoDescription);

      // Update Open Graph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', config.seoDescription);
    }

    // Update Favicon / App Logo in Meta
    if (config.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = config.logoUrl;

      // Update OG Image
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', config.logoUrl);
    }
  }, [config.seoDescription, config.logoUrl]);

  return config;
};
