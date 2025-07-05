// Système de traduction pour Enviar Transfert
class Translator {
    constructor() {
        this.currentLang = 'fr';
        this.translations = {
            fr: {
                // Navigation
                'nav-home': 'Accueil',
                'nav-how-it-works': 'Fonctionnement',
                'nav-about': 'À propos',
                'nav-contact': 'Contact',
                'nav-whatsapp': 'Nous contacter',
                
                // Page d'accueil
                'hero-title': 'Envoyez de l\'argent vers la Guinée en toute simplicité',
                'hero-subtitle': 'Transferts rapides, sécurisés et économiques vers vos proches en Guinée',
                'send-country': 'Pays d\'envoi',
                'amount': 'Montant à envoyer',
                'receive-country': 'Pays de réception',
                'calculate': 'Calculer',
                'instant-transfers': 'Transferts instantanés',
                'secure': '100% sécurisé',
                'low-fees': 'Frais réduits',
                'transfers': 'Transferts',
                'reception-countries': 'Pays de réception',
                'support': 'Support',
                
                // Calculatrice
                'current-rates': 'Taux de change actuels :',
                'result-title': 'Résultat du calcul',
                'day-rate': 'Taux du jour :',
                'amount-to-send': 'Montant à envoyer :',
                'fees': 'Frais à payer :',
                'total-to-pay': 'Total à payer :',
                'total-to-receive': 'Total à recevoir :',
                'amount-to-receive': 'Montant à recevoir :',
                'lets-go': 'C\'est parti',
                
                // Contact
                'contact-title': 'Contactez-nous pour finaliser votre transfert',
                'your-info': 'Vos informations',
                'full-name': 'Nom complet',
                'phone': 'Téléphone',
                'email': 'Email',
                'beneficiary-info': 'Informations du bénéficiaire',
                'beneficiary-name': 'Nom complet du bénéficiaire',
                'beneficiary-phone': 'Téléphone du bénéficiaire',
                'beneficiary-address': 'Adresse du bénéficiaire',
                'message': 'Message (optionnel)',
                'send-request': 'Envoyer la demande',
                
                // Page Fonctionnement
                'how-it-works-title': 'Comment ça marche',
                'how-it-works-subtitle': 'Découvrez notre processus simple et sécurisé',
                'step-1-title': 'Calculez votre transfert',
                'step-1-desc': 'Utilisez notre calculateur pour connaître le montant exact que votre bénéficiaire recevra en XOF.',
                'step-2-title': 'Contactez-nous sur WhatsApp',
                'step-2-desc': 'Envoyez-nous un message sur WhatsApp avec le montant calculé pour finaliser votre transfert.',
                'step-3-title': 'Recevez votre argent',
                'step-3-desc': 'Votre bénéficiaire reçoit l\'argent instantanément après la confirmation du transfert.',
                'served-countries': 'Pays desservis',
                'sending-from': 'Envoi depuis :',
                'receiving-in': 'Réception en :',
                'faq-title': 'Questions fréquentes',
                'faq-1-question': 'Combien de temps prend un transfert ?',
                'faq-1-answer': 'La plupart de nos transferts sont instantanés. Dans certains cas, le délai peut aller jusqu\'à 24 heures selon le pays de destination.',
                'faq-2-question': 'Quels documents sont nécessaires ?',
                'faq-2-answer': 'Une pièce d\'identité valide (passeport ou carte d\'identité) et un justificatif de domicile de moins de 3 mois.',
                'faq-3-question': 'Comment mon bénéficiaire reçoit-il l\'argent ?',
                'faq-3-answer': 'Votre bénéficiaire peut retirer l\'argent dans l\'un de nos points de retrait partenaires ou recevoir directement sur son compte bancaire.',
                
                // Page À propos
                'about-title': 'À propos d\'Enviar',
                'about-subtitle': 'Notre mission et notre vision',
                'about-story': 'Notre Histoire',
                'about-mission': 'Notre mission',
                'about-values': 'Notre Mission et Nos Valeurs',
                'about-team': 'Notre équipe',
                'about-security': 'Sécurité et Conformité',
                'security': 'Sécurité',
                'innovation': 'Innovation',
                'customer-service': 'Service Client',
                'licenses-regulations': 'Licences et Réglementations',
                'data-protection': 'Protection des Données',
                'secure-transactions': 'Transactions Sécurisées',
                
                // Page Contact
                'contact-page-title': 'Contactez-nous',
                'contact-page-subtitle': 'Notre équipe est disponible 24/7 pour vous aider',
                'contact-info-title': 'Informations de contact',
                'contact-form-title': 'Formulaire de contact',
                'contact-faq-title': 'Questions fréquentes',
                'by-phone': 'Par téléphone',
                'by-whatsapp': 'Par WhatsApp',
                'by-email': 'Par email',
                'quick-response': 'Réponse rapide',
                'response-24h': 'Réponse sous 24h',
                'send-us-message': 'Envoyez-nous un message',
                'subject': 'Sujet',
                'choose-subject': 'Choisir un sujet',
                'transfer-question': 'Question sur un transfert',
                'account-question': 'Question sur mon compte',
                'rates-info': 'Information sur les tarifs',
                'other': 'Autre',
                'send-message': 'Envoyer le message',
                'faq-track-transfer': 'Comment suivre mon transfert ?',
                'faq-track-answer': 'Suivez votre transfert en temps réel depuis votre espace client ou contactez-nous directement.',
                'faq-delays': 'Quels sont les délais ?',
                'faq-delays-answer': 'Les transferts sont traités dans les 24h ouvrables après réception du paiement.',
                'faq-modify': 'Comment modifier un transfert ?',
                'faq-modify-answer': 'Modifiez ou annulez votre transfert depuis votre espace client avant son traitement.',
                'faq-documents': 'Documents requis ?',
                'faq-documents-answer': 'Une pièce d\'identité valide et un justificatif de domicile sont nécessaires.',
                
                // Footer
                'footer-about': 'À propos d\'Enviar',
                'footer-description': 'Service de transfert d\'argent rapide et sécurisé vers l\'Afrique',
                'footer-links': 'Liens utiles',
                'footer-legal': 'Mentions légales',
                'footer-contact': 'Contact',
                'footer-follow': 'Suivez-nous',
                'footer-copyright': '© 2024 Enviar Transfert. Tous droits réservés.',
                
                // Pages légales
                'terms-title': 'Conditions d\'utilisation',
                'terms-subtitle': 'Lisez attentivement nos conditions d\'utilisation',
                'privacy-title': 'Politique de confidentialité',
                'privacy-subtitle': 'Comment nous protégeons vos données',
                'cookies-title': 'Politique des cookies',
                'cookies-subtitle': 'Utilisation des cookies sur notre site',
                
                // Contenu des pages légales
                'terms-intro': 'En utilisant nos services, vous acceptez les conditions suivantes.',
                'privacy-intro': 'Nous nous engageons à protéger votre vie privée et vos données personnelles.',
                'cookies-intro': 'Ce site utilise des cookies pour améliorer votre expérience.',
                
                // Contenu général
                'available-24h': 'Disponible 24h/24',
                'fast-transfer': 'Transfert rapide',
                'secure-payment': 'Paiement sécurisé',
                'customer-support': 'Support client',
                'learn-more': 'En savoir plus',
                'get-started': 'Commencer',
                'contact-us': 'Nous contacter',
                'back-to-top': 'Retour en haut',
                
                // Messages d'erreur et succès
                'error-occurred': 'Une erreur s\'est produite',
                'success-message': 'Opération réussie',
                'loading': 'Chargement...',
                'please-wait': 'Veuillez patienter...',
                
                // Nouvelles traductions ajoutées
                'avantages-title': 'Pourquoi choisir Enviar ?',
                'avantage-rapidite': 'Rapidité',
                'avantage-rapidite-desc': 'Transferts instantanés vers vos proches en Guinée',
                'avantage-securite': 'Sécurité',
                'avantage-securite-desc': 'Transactions 100% sécurisées et conformes aux réglementations',
                'avantage-tarifs': 'Tarifs compétitifs',
                'avantage-tarifs-desc': 'Les meilleurs taux de change et les frais les plus bas du marché',
                'avantage-support': 'Support 24/7',
                'avantage-support-desc': 'Notre équipe est disponible 24h/24 pour vous accompagner',
                'process-title': 'Comment ça marche ?',
                'canada': 'Canada',
                'guinea': 'Guinée Conakry',
                'senegal': 'Sénégal',
                'france': 'France',
                'usa': 'États-Unis',
                'mali': 'Mali',
                'cote-ivoire': 'Côte d\'Ivoire',
                'burkina-faso': 'Burkina Faso',
                
                // Formulaires de transfert
                'transfer-details': 'Détails du transfert',
                'sending-country': 'Pays de départ',
                'receiving-country': 'Pays de destination',
                'transfer-fees': 'Frais de transfert',
                'continue': 'Continuer',
                'back': 'Retour',
                'confirmation': 'Confirmation',
                'transfer-summary': 'Récapitulatif de votre transfert',
                'step-details': 'Détails',
                'step-your-info': 'Vos infos',
                'step-beneficiary': 'Bénéficiaire',
                'step-confirm': 'Confirmer',
                'sending': 'Envoi :',
                'additional-info': 'Informations complémentaires (optionnel)',
                'continue-whatsapp': 'Continuer sur WhatsApp',
                
                // Formulaires d'administration
                'admin-title': 'Exchange Rate Administration',
                'cad-gnf-rate': 'CAD to GNF Exchange Rate',
                'gnf-xof-rate': 'GNF to XOF Exchange Rate',
                'success-update': 'Rates have been updated successfully!',
                'new-cad-rate': 'New rate (1 CAD = ? GNF)',
                'new-xof-rate': 'New rate (1 GNF = ? XOF)',
                'update-rates': 'Update rates',
                
                // Formulaire de connexion
                'admin-login': 'Administration Login',
                'username': 'Username',
                'password': 'Password',
                'login': 'Login'
            },
            en: {
                // Navigation
                'nav-home': 'Home',
                'nav-how-it-works': 'How it works',
                'nav-about': 'About',
                'nav-contact': 'Contact',
                'nav-whatsapp': 'Contact us',
                
                // Page d'accueil
                'hero-title': 'Send money to Guinea with ease',
                'hero-subtitle': 'Fast, secure and economical transfers to your loved ones in Guinea',
                'send-country': 'Sending country',
                'amount': 'Amount to send',
                'receive-country': 'Receiving country',
                'calculate': 'Calculate',
                'instant-transfers': 'Instant transfers',
                'secure': '100% secure',
                'low-fees': 'Low fees',
                'transfers': 'Transfers',
                'reception-countries': 'Reception countries',
                'support': 'Support',
                
                // Calculatrice
                'current-rates': 'Current exchange rates:',
                'result-title': 'Calculation result',
                'day-rate': 'Day rate:',
                'amount-to-send': 'Amount to send:',
                'fees': 'Fees to pay:',
                'total-to-pay': 'Total to pay:',
                'total-to-receive': 'Total to receive:',
                'lets-go': 'Let\'s go',
                
                // Contact
                'contact-title': 'Contact us to finalize your transfer',
                'your-info': 'Your information',
                'full-name': 'Full name',
                'phone': 'Phone',
                'email': 'Email',
                'beneficiary-info': 'Beneficiary information',
                'beneficiary-name': 'Beneficiary full name',
                'beneficiary-phone': 'Beneficiary phone',
                'beneficiary-address': 'Beneficiary Address',
                'message': 'Message (optional)',
                'send-request': 'Send Request',
                
                // Page Fonctionnement
                'how-it-works-title': 'How it works',
                'how-it-works-subtitle': 'Discover our simple and secure process',
                'step-1-title': 'Calculate your transfer',
                'step-1-desc': 'Use our calculator to know the exact amount your beneficiary will receive in XOF.',
                'step-2-title': 'Contact us on WhatsApp',
                'step-2-desc': 'Send us a message on WhatsApp with the calculated amount to finalize your transfer.',
                'step-3-title': 'Receive your money',
                'step-3-desc': 'Your beneficiary receives the money instantly after transfer confirmation.',
                'served-countries': 'Served countries',
                'sending-from': 'Sending from:',
                'receiving-in': 'Receiving in:',
                'faq-title': 'Frequently asked questions',
                'faq-1-question': 'How long does a transfer take?',
                'faq-1-answer': 'Most of our transfers are instant. In some cases, the delay can be up to 24 hours depending on the destination country.',
                'faq-2-question': 'What documents are required?',
                'faq-2-answer': 'A valid ID (passport or identity card) and a proof of residence less than 3 months old.',
                'faq-3-question': 'How does my beneficiary receive the money?',
                'faq-3-answer': 'Your beneficiary can withdraw the money at one of our partner pickup points or receive it directly to their bank account.',
                
                // Page À propos
                'about-title': 'About Enviar',
                'about-subtitle': 'Our mission and vision',
                'about-story': 'Our Story',
                'about-mission': 'Our mission',
                'about-values': 'Our Mission and Values',
                'about-team': 'Our team',
                'about-security': 'Security and Compliance',
                'security': 'Security',
                'innovation': 'Innovation',
                'customer-service': 'Customer Service',
                'licenses-regulations': 'Licenses and Regulations',
                'data-protection': 'Data Protection',
                'secure-transactions': 'Secure Transactions',
                
                // Page Contact
                'contact-page-title': 'Contact us',
                'contact-page-subtitle': 'Our team is available 24/7 to help you',
                'contact-info-title': 'Contact information',
                'contact-form-title': 'Contact form',
                'contact-faq-title': 'Frequently asked questions',
                'by-phone': 'By phone',
                'by-whatsapp': 'By WhatsApp',
                'by-email': 'By email',
                'quick-response': 'Quick response',
                'response-24h': 'Response within 24h',
                'send-us-message': 'Send us a message',
                'subject': 'Subject',
                'choose-subject': 'Choose a subject',
                'transfer-question': 'Transfer question',
                'account-question': 'Account question',
                'rates-info': 'Rates information',
                'other': 'Other',
                'send-message': 'Send message',
                'faq-track-transfer': 'How to track my transfer?',
                'faq-track-answer': 'Track your transfer in real time from your client area or contact us directly.',
                'faq-delays': 'What are the delays?',
                'faq-delays-answer': 'Transfers are processed within 24 business hours after payment receipt.',
                'faq-modify': 'How to modify a transfer?',
                'faq-modify-answer': 'Modify or cancel your transfer from your client area before processing.',
                'faq-documents': 'Required documents?',
                'faq-documents-answer': 'A valid ID and proof of residence are required.',
                
                // Footer
                'footer-about': 'About Enviar',
                'footer-description': 'Fast and secure money transfer service to Africa',
                'footer-links': 'Useful links',
                'footer-legal': 'Legal notices',
                'footer-contact': 'Contact',
                'footer-follow': 'Follow us',
                'footer-copyright': '© 2024 Enviar Transfert. All rights reserved.',
                
                // Pages légales
                'terms-title': 'Terms of use',
                'terms-subtitle': 'Please read our terms of use carefully',
                'privacy-title': 'Privacy policy',
                'privacy-subtitle': 'How we protect your data',
                'cookies-title': 'Cookie policy',
                'cookies-subtitle': 'Use of cookies on our website',
                
                // Contenu des pages légales
                'terms-intro': 'By using our services, you accept the following terms.',
                'privacy-intro': 'We are committed to protecting your privacy and personal data.',
                'cookies-intro': 'This website uses cookies to improve your experience.',
                
                // Contenu général
                'available-24h': 'Available 24/7',
                'fast-transfer': 'Fast transfer',
                'secure-payment': 'Secure payment',
                'customer-support': 'Customer support',
                'learn-more': 'Learn more',
                'get-started': 'Get started',
                'contact-us': 'Contact us',
                'back-to-top': 'Back to top',
                
                // Messages d'erreur et succès
                'error-occurred': 'An error occurred',
                'success-message': 'Operation successful',
                'loading': 'Loading...',
                'please-wait': 'Please wait...',
                
                // Nouvelles traductions ajoutées
                'avantages-title': 'Why choose Enviar?',
                'avantage-rapidite': 'Speed',
                'avantage-rapidite-desc': 'Instant transfers to your loved ones in Guinea',
                'avantage-securite': 'Security',
                'avantage-securite-desc': '100% secure transactions compliant with regulations',
                'avantage-tarifs': 'Competitive rates',
                'avantage-tarifs-desc': 'Best exchange rates and lowest fees in the market',
                'avantage-support': '24/7 Support',
                'avantage-support-desc': 'Our team is available 24/7 to assist you',
                'process-title': 'How does it work?',
                'canada': 'Canada',
                'guinea': 'Guinea Conakry',
                'senegal': 'Senegal',
                'france': 'France',
                'usa': 'United States',
                'mali': 'Mali',
                'cote-ivoire': 'Ivory Coast',
                'burkina-faso': 'Burkina Faso',
                
                // Formulaires de transfert
                'transfer-details': 'Transfer Details',
                'sending-country': 'Sending country',
                'receiving-country': 'Receiving country',
                'transfer-fees': 'Transfer fees',
                'continue': 'Continue',
                'back': 'Back',
                'confirmation': 'Confirmation',
                'transfer-summary': 'Transfer Summary',
                'sending': 'Sending',
                'additional-info': 'Additional Information (optional)',
                'continue-whatsapp': 'Continue on WhatsApp',
                'copy-button': 'Copy',
                'transfer-confirmation-title': 'Confirm Your Transfer',
                
                // Formulaires d'administration
                'admin-title': 'Admin Panel - Exchange Rates',
                'cad-gnf-rate': 'CAD to GNF Exchange Rate',
                'gnf-xof-rate': 'GNF to XOF Exchange Rate',
                'success-update': 'Rates have been updated successfully!',
                'new-cad-rate': 'New rate (1 CAD = ? GNF)',
                'new-xof-rate': 'New rate (1 GNF = ? XOF)',
                'update-rates': 'Update rates',
                
                // Formulaire de connexion
                'admin-login': 'Administration Login',
                'username': 'Username',
                'password': 'Password',
                'login': 'Login',
                
                // Page Transfert
                'transfer-page-title': 'Enviar - New Transfer',
                'step-details': 'Details',
                'step-your-info': 'Your Info',
                'step-beneficiary': 'Beneficiary',
                'step-confirm': 'Confirm',
                'amount-to-receive': 'Amount to receive',
                'beneficiary-info': 'Beneficiary information',
                'confirmation': 'Confirmation',
                'transfer-summary': 'Transfer summary',
                'sending': 'Sending',
                'additional-info': 'Additional information (optional)',
                'continue-whatsapp': 'Continue on WhatsApp',
                'copy-button': 'Copy',
                'transfer-confirmation-title': 'Confirm Your Transfer',
                
                // Page Fonctionnement
                'how-it-works-title': 'How It Works'
            }
        };
        
        this.init();
    }
    
    init() {
        // Récupérer la langue sauvegardée ou utiliser le français par défaut
        const savedLang = localStorage.getItem('enviar_language') || 'fr';
        this.setLanguage(savedLang);
        
        // Initialiser le sélecteur de langue
        this.updateLanguageSelector();
        
        // Traduire la page
        this.translatePage();
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('enviar_language', lang);
        this.updateLanguageSelector();
        this.translatePage();
    }
    
    updateLanguageSelector() {
        const selector = document.querySelector('.language-selector');
        if (selector) {
            selector.value = this.currentLang;
        }
    }
    
    translatePage() {
        // Traduire tous les éléments avec l'attribut data-translate
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getText(key);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        // Traduire les placeholders
        const inputs = document.querySelectorAll('input[data-translate-placeholder]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-translate-placeholder');
            const translation = this.getText(key);
            if (translation) {
                input.placeholder = translation;
            }
        });
        
        // Traduire les textareas
        const textareas = document.querySelectorAll('textarea[data-translate-placeholder]');
        textareas.forEach(textarea => {
            const key = textarea.getAttribute('data-translate-placeholder');
            const translation = this.getText(key);
            if (translation) {
                textarea.placeholder = translation;
            }
        });
        
        // Traduire les titres
        const titles = document.querySelectorAll('[data-translate-title]');
        titles.forEach(title => {
            const key = title.getAttribute('data-translate-title');
            const translation = this.getText(key);
            if (translation) {
                title.title = translation;
            }
        });
    }
    
    getText(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }
}

// Initialiser le traducteur quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.translator = new Translator();
    window.translator.init();
    
    // Écouter les changements du sélecteur de langue
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
            window.translator.setLanguage(e.target.value);
        });
    }
}); 