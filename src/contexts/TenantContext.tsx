import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';

export interface TenantConfig {
  domain: string;
  app_name: string;
  logo_url: string;
  primary_color: string;
  contact_email: string;
  zalo_url: string;
  facebook_url: string;
  sepay_md5: string;
  bank_id?: string;
  bank_account?: string;
  bank_owner?: string;
  status: string;
  fallback?: boolean;
}

interface TenantContextType {
  tenant: TenantConfig | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        let tenantDomain = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'coach.online' : window.location.hostname;
        try {
          const override = new URLSearchParams(window.location.search).get('test_domain');
          if (override) tenantDomain = override;
        } catch(e) {}
        
        const config = await googleSheetsService.fetchTenantConfig(tenantDomain);
        setTenant(config);
        
        if (config?.primary_color) {
          document.documentElement.style.setProperty('--color-primary', config.primary_color);
        }
      } catch (err) {
        console.error('Failed to fetch tenant config', err);
        setError('Failed to load tenant configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0B0E17]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = () => useContext(TenantContext);
