document.addEventListener('DOMContentLoaded', function() {
    
    // Fonction pour formater les montants
    function formatMontant(montant, devise) {
        // Si montant est undefined ou null, retourner une valeur par défaut
        if (!montant) return '0 ' + (devise || '');
        
        // Si c'est déjà une chaîne formatée, la retourner telle quelle
        if (typeof montant === 'string' && montant.includes(' ')) {
            return montant;
        }
        
        // Supprimer tous les caractères non numériques sauf le point
        const nombre = parseFloat(montant.toString().replace(/[^\d.-]/g, ''));
        if (isNaN(nombre)) return montant;
        
        let options = {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };
        
        // Pour le franc guinéen, pas de décimales
        if (devise === 'GNF') {
            options = {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            };
        }
        
        return new Intl.NumberFormat('fr-FR', options).format(nombre) + ' ' + (devise || '');
    }

    // Récupérer les données du transfert depuis localStorage
    const storedData = localStorage.getItem('transfertData');
    let transfertData;
    
    if (storedData) {
        transfertData = JSON.parse(storedData);
        // Ajouter les devises
        const devises = {
            'canada': 'CAD',
            'guinee': 'GNF',
            'senegal': 'XOF'
        };
        transfertData.deviseDepart = devises[transfertData.paysDepart] || '';
        transfertData.deviseDestination = devises[transfertData.paysDestination] || '';
    } else {
        // Fallback vers les paramètres URL si localStorage vide
        const urlParams = new URLSearchParams(window.location.search);
        transfertData = {
            paysDepart: urlParams.get('paysDepart'),
            paysDepartLabel: urlParams.get('paysDepartLabel'),
            paysDestination: urlParams.get('paysDestination'),
            paysDestinationLabel: urlParams.get('paysDestinationLabel'),
            montant: urlParams.get('montant'),
            montantRecu: urlParams.get('montantRecu'),
            frais: urlParams.get('frais'),
            total: urlParams.get('total'),
            deviseDepart: urlParams.get('deviseDepart'),
            deviseDestination: urlParams.get('deviseDestination')
        };
    }

    // Valeurs de secours si la devise n'est pas transmise
    const fallbackDevises = {
        'canada': 'CAD',
        'guinee': 'GNF',
        'senegal': 'XOF'
    };
    const fallbackFlags = {
        'canada': '/static/images/flags/canada.png',
        'guinee': '/static/images/flags/guinee.png',
        'senegal': '/static/images/flags/senegal.png'
    };
    transfertData.deviseDepart = transfertData.deviseDepart || fallbackDevises[transfertData.paysDepart] || '';
    transfertData.deviseDestination = transfertData.deviseDestination || fallbackDevises[transfertData.paysDestination] || '';

    // Formater les noms des pays
    const paysNames = {
        'guinee': 'Guinée (GNF)',
        'senegal': 'Sénégal (XOF)'
    };

    // Remplir les champs de la première étape avec les montants formatés et les drapeaux
    const paysDepartDiv = document.getElementById('pays-depart-display');
    if (paysDepartDiv) {
    paysDepartDiv.innerHTML = '';
    const flagDepart = document.createElement('img');
    flagDepart.src = fallbackFlags[transfertData.paysDepart];
    flagDepart.alt = transfertData.paysDepart;
    flagDepart.className = 'flag-icon';
    paysDepartDiv.appendChild(flagDepart);
    paysDepartDiv.append(' ' + (transfertData.paysDepartLabel || transfertData.paysDepart));
    }

    const paysDestinationDiv = document.getElementById('pays-destination-display');
    if (paysDestinationDiv) {
    paysDestinationDiv.innerHTML = '';
    const flagDest = document.createElement('img');
    flagDest.src = fallbackFlags[transfertData.paysDestination];
    flagDest.alt = transfertData.paysDestination;
    flagDest.className = 'flag-icon';
    paysDestinationDiv.appendChild(flagDest);
    paysDestinationDiv.append(' ' + (transfertData.paysDestinationLabel || transfertData.paysDestination));
    }

    // Remplir les montants avec les valeurs exactes du localStorage
    if (storedData) {
        console.log('Données localStorage:', transfertData);
        
        // Remplir le récapitulatif final avec les valeurs exactes
        const summaryMontantEnvoyer = document.getElementById('summary-montant-envoyer');
        if (summaryMontantEnvoyer) {
            summaryMontantEnvoyer.textContent = transfertData.montantEnvoi || '100,00 CAD';
        }
        
        const summaryMontantRecu = document.getElementById('summary-montant-recu');
        if (summaryMontantRecu) {
            summaryMontantRecu.textContent = transfertData.montantRecu || '645 000 GNF';
        }
        
        const summaryFrais = document.getElementById('summary-frais');
        if (summaryFrais) {
            summaryFrais.textContent = transfertData.fraisMontant || '3,90 CAD';
        }
        
        const summaryTotal = document.getElementById('summary-total');
        if (summaryTotal) {
            summaryTotal.textContent = transfertData.totalPayer || '103,90 CAD';
        }
        
        console.log('Valeurs affichées:', {
            montantEnvoi: transfertData.montantEnvoi || '100,00 CAD',
            montantRecu: transfertData.montantRecu || '645 000 GNF',
            frais: transfertData.fraisMontant || '3,90 CAD',
            total: transfertData.totalPayer || '103,90 CAD'
        });
    }

    // Fonction pour remplir les informations du récapitulatif
    function fillSummaryInfo() {
        // Informations du destinataire
        const summaryNom = document.getElementById('summary-nom');
        const summaryPrenom = document.getElementById('summary-prenom');
        const summaryTelephone = document.getElementById('summary-telephone');
        const summaryEmail = document.getElementById('summary-email');
        
        if (summaryNom) {
            const nom = document.getElementById('nom')?.value || '';
            summaryNom.textContent = nom || 'Non renseigné';
        }
        
        if (summaryPrenom) {
            const prenom = document.getElementById('prenom')?.value || '';
            summaryPrenom.textContent = prenom || 'Non renseigné';
        }
        
        if (summaryTelephone) {
            const indicatif = document.getElementById('indicatif')?.value || '';
            const telephone = document.getElementById('telephone')?.value || '';
            const fullPhone = indicatif && telephone ? `${indicatif} ${telephone}` : '';
            summaryTelephone.textContent = fullPhone || 'Non renseigné';
        }
        
        if (summaryEmail) {
            const email = document.getElementById('email')?.value || '';
            summaryEmail.textContent = email || 'Non renseigné';
        }
        
        // Informations du bénéficiaire
        const summaryBeneficiaireNom = document.getElementById('summary-beneficiaire-nom');
        const summaryBeneficiairePrenom = document.getElementById('summary-beneficiaire-prenom');
        const summaryBeneficiaireTelephone = document.getElementById('summary-beneficiaire-telephone');
        const summaryBeneficiaireAdresse = document.getElementById('summary-beneficiaire-adresse');
        
        if (summaryBeneficiaireNom) {
            const beneficiaireNom = document.getElementById('beneficiaire-nom')?.value || '';
            summaryBeneficiaireNom.textContent = beneficiaireNom || 'Non renseigné';
        }
        
        if (summaryBeneficiairePrenom) {
            const beneficiairePrenom = document.getElementById('beneficiaire-prenom')?.value || '';
            summaryBeneficiairePrenom.textContent = beneficiairePrenom || 'Non renseigné';
        }
        
        if (summaryBeneficiaireTelephone) {
            const beneficiaireIndicatif = document.getElementById('beneficiaire-indicatif')?.value || '';
            const beneficiaireTelephone = document.getElementById('beneficiaire-telephone')?.value || '';
            const fullBeneficiairePhone = beneficiaireIndicatif && beneficiaireTelephone ? `${beneficiaireIndicatif} ${beneficiaireTelephone}` : '';
            summaryBeneficiaireTelephone.textContent = fullBeneficiairePhone || 'Non renseigné';
        }
        
        if (summaryBeneficiaireAdresse) {
            const beneficiaireAdresse = document.getElementById('beneficiaire-adresse')?.value || '';
            summaryBeneficiaireAdresse.textContent = beneficiaireAdresse || 'Non renseigné';
        }
    }

    // Fonction pour obtenir le drapeau selon le pays
    function getFlagForCountry(pays) {
        const flagMap = {
            'canada': '/static/images/flags/canada.png',
            'guinee': '/static/images/flags/guinee.png',
            'senegal': '/static/images/flags/senegal.png',
            'sierra-leone': '/static/images/flags/Sierraleone.jpg'
        };
        return flagMap[pays] || '/static/images/flags/canada.png'; // drapeau par défaut
    }

    // Fonction pour créer l'élément avec drapeau
    function createCountryWithFlag(pays, paysLabel) {
        const flagSrc = getFlagForCountry(pays);
        const flagImg = `<img src="${flagSrc}" alt="${paysLabel}" class="flag-icon" style="vertical-align:middle; width: 20px; height: 15px; margin-right: 5px;">`;
        return flagImg + (paysLabel || pays || '');
    }

    // Remplir les pays et devises dans le récapitulatif
    const summaryPaysDepart = document.getElementById('summary-pays-depart');
    if (summaryPaysDepart) {
        const paysDepartLabel = transfertData.paysDepartLabel || transfertData.paysDepart || '';
        summaryPaysDepart.innerHTML = createCountryWithFlag(transfertData.paysDepart, paysDepartLabel);
    }
    const summaryPaysDestination = document.getElementById('summary-pays-destination');
    if (summaryPaysDestination) {
        const paysDestinationLabel = transfertData.paysDestinationLabel || transfertData.paysDestination || '';
        summaryPaysDestination.innerHTML = createCountryWithFlag(transfertData.paysDestination, paysDestinationLabel);
    }

    // Gestion des étapes
    const form = document.getElementById('transfert-form');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    let currentStep = 1; // Commencer directement à l'étape 1 (Vos informations)

    // Fonction pour afficher une étape spécifique
    function showStep(stepNumber) {
        
        // Masquer toutes les étapes
        steps.forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });

        // Afficher l'étape actuelle
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
            currentStepElement.style.display = 'block';
        } else {
            console.error('Étape non trouvée:', stepNumber);
        }
        
        // Si on arrive à l'étape 3 (récapitulatif), remplir les informations
        if (stepNumber === 3) {
            fillSummaryInfo();
            // Mettre à jour l'aperçu WhatsApp après avoir rempli les informations
            setTimeout(updateWhatsAppPreview, 100);
        }

        // Mettre à jour la barre de progression
        progressSteps.forEach(step => {
            step.classList.remove('active', 'completed');
            const n = parseInt(step.dataset.step);
            if (n < stepNumber) {
                step.classList.add('completed');
            } else if (n === stepNumber) {
                step.classList.add('active');
            }
        });

        currentStep = stepNumber;
        
        // Faire défiler vers le haut sur mobile
        if (window.innerWidth <= 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Gestion des boutons "Continuer"
    const nextButtons = document.querySelectorAll('.next-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateStep(currentStep)) {
                showStep(currentStep + 1);
            }
        });
    });

    // Gestion des boutons "Retour"
    const prevButtons = document.querySelectorAll('.prev-step');
    
    prevButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showStep(currentStep - 1);
        });
    });

    // Validation des étapes
    function validateStep(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!currentStepElement) {
            console.error('Élément d\'étape non trouvé:', step);
            return false;
        }
        
        const requiredInputs = currentStepElement.querySelectorAll('input[required]');
        let isValid = true;

        // Fonction de validation pour les noms (lettres, espaces, tirets, apostrophes)
        function validateName(name) {
            return /^[a-zA-ZÀ-ÿ\s\-']+$/.test(name.trim());
        }

        // Fonction de validation pour les numéros de téléphone (chiffres uniquement)
        function validatePhone(phone) {
            return /^[0-9\s\-\(\)]+$/.test(phone.trim()) && phone.trim().length >= 6;
        }

        // Fonction de validation pour les emails
        function validateEmail(email) {
            if (!email.trim()) return true; // Email optionnel
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        }

        requiredInputs.forEach(input => {
            const value = input.value.trim();
            let fieldValid = true;
            let errorMessage = '';

            // Vérifier si le champ est vide
            if (!value) {
                fieldValid = false;
                errorMessage = 'Ce champ est obligatoire';
            } else {
                // Validation spécifique selon le type de champ
                switch (input.id) {
                    case 'nom':
                    case 'prenom':
                    case 'beneficiaire-nom':
                    case 'beneficiaire-prenom':
                        if (!validateName(value)) {
                            fieldValid = false;
                            errorMessage = 'Ce champ ne doit contenir que des lettres';
                        }
                        break;
                    
                    case 'telephone':
                    case 'beneficiaire-telephone':
                        if (!validatePhone(value)) {
                            fieldValid = false;
                            errorMessage = 'Ce champ ne doit contenir que des chiffres';
                        }
                        break;
                    
                    case 'email':
                        if (!validateEmail(value)) {
                            fieldValid = false;
                            errorMessage = 'Veuillez entrer une adresse email valide';
                        }
                        break;
                }
            }

            // Appliquer les styles d'erreur
            if (!fieldValid) {
                isValid = false;
                input.classList.add('error');
                // Afficher le message d'erreur
                showFieldError(input, errorMessage);
            } else {
                input.classList.remove('error');
                hideFieldError(input);
            }
        });
        
        // Validation spécifique pour l'indicatif bénéficiaire
        const indicatifBenef = currentStepElement.querySelector('#beneficiaire-indicatif');
        if (indicatifBenef && !indicatifBenef.value.trim()) {
            isValid = false;
            indicatifBenef.classList.add('error');
        } else if (indicatifBenef) {
            indicatifBenef.classList.remove('error');
        }
        
        // Validation spécifique pour l'indicatif utilisateur
        const indicatifUser = currentStepElement.querySelector('#indicatif');
        if (indicatifUser && !indicatifUser.value.trim()) {
            isValid = false;
            indicatifUser.classList.add('error');
        } else if (indicatifUser) {
            indicatifUser.classList.remove('error');
        }

        return isValid;
    }

    // Fonction pour afficher les messages d'erreur
    function showFieldError(input, message) {
        // Supprimer l'ancien message d'erreur s'il existe
        hideFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.8em; margin-top: 0.25em; display: block;';
        
        input.parentNode.appendChild(errorDiv);
    }

    // Fonction pour masquer les messages d'erreur
    function hideFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Gestion de la soumission du formulaire
    if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Empêcher la soumission par défaut
    });
    }

    // Fonction pour générer le message WhatsApp lisible
    function getMessageWhatsAppLisible() {
        const lang = document.documentElement.lang || 'fr';

        const labels = {
            fr: {
                greeting: "Bonjour, je souhaite effectuer un transfert d'argent.",
                myInfo: "Mes informations :",
                name: "Nom complet",
                phone: "Téléphone",
                email: "Email",
                beneficiaryInfo: "Informations du bénéficiaire :",
                beneficiaryName: "Nom",
                beneficiaryPhone: "Téléphone",
                beneficiaryAddress: "Adresse",
                transferDetails: "Détails du transfert :",
                sendingCountry: "Pays d'envoi",
                receivingCountry: "Pays de réception",
                amountToSend: "Montant à envoyer",
                fees: "Frais",
                totalToPay: "Total à payer",
                amountToReceive: "Montant à recevoir",
                message: "Message"
            },
            en: {
                greeting: "Hello, I would like to make a money transfer.",
                myInfo: "My information:",
                name: "Full name",
                phone: "Phone",
                email: "Email",
                beneficiaryInfo: "Beneficiary's information:",
                beneficiaryName: "Name",
                beneficiaryPhone: "Phone",
                beneficiaryAddress: "Address",
                transferDetails: "Transfer details:",
                sendingCountry: "Sending country",
                receivingCountry: "Receiving country",
                amountToSend: "Amount to send",
                fees: "Fees",
                totalToPay: "Total to pay",
                amountToReceive: "Amount to receive",
                message: "Message"
            }
        };

        const t = labels[lang];

        const nom = document.getElementById('nom')?.value || '';
        const prenom = document.getElementById('prenom')?.value || '';
        const indicatif = document.getElementById('indicatif')?.value || '';
        const telephone = document.getElementById('telephone')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const beneficiaireNom = document.getElementById('beneficiaire-nom')?.value || '';
        const beneficiairePrenom = document.getElementById('beneficiaire-prenom')?.value || '';
        const beneficiaireIndicatif = document.getElementById('beneficiaire-indicatif')?.value || '';
        const beneficiaireTelephone = document.getElementById('beneficiaire-telephone')?.value || '';
        const beneficiaireAdresse = document.getElementById('beneficiaire-adresse')?.value || '';
        const message = document.getElementById('message')?.value || '';
        
        // Formater les numéros de téléphone complets
        const telephoneComplet = indicatif && telephone ? `${indicatif} ${telephone}` : telephone;
        const beneficiaireTelephoneComplet = beneficiaireIndicatif && beneficiaireTelephone ? `${beneficiaireIndicatif} ${beneficiaireTelephone}` : beneficiaireTelephone;
        
        return `${t.greeting}\n\n` +
            `${t.myInfo}\n` +
            `- ${t.name} : ${nom} ${prenom}\n` +
            `- ${t.phone} : ${telephoneComplet}\n` +
            `- ${t.email} : ${email}\n\n` +
            `${t.beneficiaryInfo}\n` +
            `- ${t.name} : ${beneficiaireNom} ${beneficiairePrenom}\n` +
            `- ${t.phone} : ${beneficiaireTelephoneComplet}\n` +
            `- ${t.beneficiaryAddress} : ${beneficiaireAdresse}\n\n` +
            `${t.transferDetails}\n` +
            `- ${t.sendingCountry} : ${transfertData.paysDepartLabel || transfertData.paysDepart}\n` +
            `- ${t.receivingCountry} : ${transfertData.paysDestinationLabel || transfertData.paysDestination}\n` +
            `- ${t.amountToSend} : ${transfertData.montantEnvoi || formatMontant(transfertData.montant, transfertData.deviseDepart)}\n` +
            `- ${t.fees} : ${transfertData.fraisMontant || formatMontant(transfertData.frais, transfertData.deviseDepart)}\n` +
            `- ${t.totalToPay} : ${transfertData.totalPayer || formatMontant(transfertData.total, transfertData.deviseDepart)}\n` +
            `- ${t.amountToReceive} : ${transfertData.montantRecu || formatMontant(transfertData.montantRecu, transfertData.deviseDestination)}\n\n` +
            `${t.message} : ${message}`;
    }

    // Afficher l'aperçu à chaque fois qu'on arrive à l'étape 3 ou qu'on modifie un champ
    function updateWhatsAppPreview() {
        const whatsappLink = document.getElementById('whatsapp-continue');
        if (whatsappLink && currentStep === 3) {
            const message = getMessageWhatsAppLisible();
            // Mettre à jour le lien WhatsApp
            whatsappLink.href = `https://wa.me/15142295522?text=${encodeURIComponent(message)}`;
        }
    }

    // Mettre à jour l'aperçu lors du passage à l'étape 4
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            setTimeout(updateWhatsAppPreview, 100); // Laisse le temps au DOM de changer d'étape
        });
    });
    
    // Mettre à jour l'aperçu en temps réel sur tous les champs du formulaire
    const allFormInputs = document.querySelectorAll('#transfert-form input, #transfert-form textarea, #transfert-form select');
    allFormInputs.forEach(input => {
        input.addEventListener('input', updateWhatsAppPreview);
        input.addEventListener('change', updateWhatsAppPreview);
        
        // Validation en temps réel pour les champs spécifiques
        if (input.id === 'nom' || input.id === 'prenom' || input.id === 'beneficiaire-nom' || input.id === 'beneficiaire-prenom') {
            input.addEventListener('input', function(e) {
                // Supprimer les chiffres et caractères spéciaux (sauf espaces, tirets, apostrophes)
                this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '');
            });
        }
        
        if (input.id === 'telephone' || input.id === 'beneficiaire-telephone') {
            input.addEventListener('input', function(e) {
                // Supprimer tout sauf les chiffres, espaces, tirets et parenthèses
                this.value = this.value.replace(/[^0-9\s\-\(\)]/g, '');
            });
        }
    });

    // Gestion du bouton de copie
    const copyButton = document.getElementById('copy-message');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const message = getMessageWhatsAppLisible();
            navigator.clipboard.writeText(message).then(() => {
                const lang = document.documentElement.lang || 'fr';
                const buttonText = lang === 'en' ? 'Copied!' : 'Copié !';
                // Changer temporairement le texte du bouton
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = `<i class="fas fa-check"></i> ${buttonText}`;
                copyButton.style.background = '#128C7E';
                
                // Remettre le texte original après 2 secondes
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                    copyButton.style.background = '#25D366';
                }, 2000);
            }).catch(err => {
                console.error('Erreur lors de la copie :', err);
                const lang = document.documentElement.lang || 'fr';
                const alertMessage = lang === 'en' ? 'Could not copy the message. Please try again.' : 'Impossible de copier le message. Veuillez réessayer.';
                alert(alertMessage);
            });
        });
    }

    // Gestion des champs d'indicatif téléphonique
    const indicatifInputs = document.querySelectorAll('#indicatif, #beneficiaire-indicatif');
    indicatifInputs.forEach(input => {
        // Effacer le placeholder au focus
        input.addEventListener('focus', function() {
            if (this.value === '') {
                this.placeholder = '';
            }
        });
        
        // Remettre le placeholder si le champ est vide au blur
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.placeholder = '+224';
            }
        });
    });

    // Initialisation : afficher directement l'étape 1 (Vos informations)
    showStep(1);
}); 