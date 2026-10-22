import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import 3 languages
import en from './locales/en.json';
import pt from './locales/pt.json';
import br from './locales/br.json';

const resources = {
    en: { translation: en },
    pt: { translation: pt },
    br: { translation: br }
};

i18n
    .use(LanguageDetector)   // Automatically browser language detect karega
    .use(initReactI18next)   // React ke saath connect karega
    .init({
        resources,
        fallbackLng: 'en',    // Agar koi language na mile to English
        supportedLngs: ['en', 'pt', 'br'],
        debug: false,
        
        interpolation: {
            escapeValue: false
        },
        
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'winzopay_language'
        }
    });

export default i18n;