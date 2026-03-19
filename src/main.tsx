import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Khởi tạo tính năng Đa Ngôn Ngữ
import { ThemeProvider } from './contexts/ThemeContext';
import { TenantProvider } from './contexts/TenantContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TenantProvider>
        <App />
      </TenantProvider>
    </ThemeProvider>
  </StrictMode>,
);
