import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = i18n.language || 'vi';

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flagUrl: 'https://flagcdn.com/w40/vn.png' },
    { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const activeLang = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
        title="Đổi ngôn ngữ / Change Language"
      >
        <img src={activeLang.flagUrl} alt={activeLang.label} className="w-6 h-auto rounded-sm shadow-sm" />
        <span className="text-xs font-bold text-slate-600 hidden lg:block uppercase">{activeLang.code}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[120]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all ${
                  currentLang === lang.code 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <img src={lang.flagUrl} alt={lang.label} className="w-5 h-auto rounded-sm shadow-sm" />
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
