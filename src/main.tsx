import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Khởi tạo tính năng Đa Ngôn Ngữ
import { ThemeProvider } from './contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
