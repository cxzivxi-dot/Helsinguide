
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'en' | 'fi';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('helsinguide-language');
    return savedLanguage === 'fi' ? 'fi' : 'en';
  });

  function setLanguage(language: Language) {
    setLanguageState(language);
    localStorage.setItem('helsinguide-language', language);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
