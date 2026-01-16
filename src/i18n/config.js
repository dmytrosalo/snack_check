import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ua from './locales/ua';
import en from './locales/en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ua,
            en
        },
        lng: 'ua', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
