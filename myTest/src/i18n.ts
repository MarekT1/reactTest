import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        app: {
          title: 'Profile',
        },
        contact: {
          group: 'Contact data',
          phone: 'Mobile phone',
          email: 'Email',
          edit: 'Edit data',
          editTitle: 'Edit contact data',
          save: 'Save',
          saving: 'Saving',
          cancel: 'Cancel',
          invalidEmail: 'Enter a valid email address',
          updated: 'Updated {{date}}',
          loading: 'Loading contact data',
          loadError: 'Could not load contact data',
          saveError: 'Could not save email',
          phoneLocked: 'Mobile phone cannot be changed',
          retry: 'Try again',
        },
      },
    },
  },
})

export default i18n
