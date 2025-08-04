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

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
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
                name: "Nom",
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
                name: "Name",
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
        const telephone = document.getElementById('telephone')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const beneficiaireNom = document.getElementById('beneficiaire-nom')?.value || '';
        const beneficiaireTelephone = document.getElementById('beneficiaire-telephone')?.value || '';
        const beneficiaireAdresse = document.getElementById('beneficiaire-adresse')?.value || '';
        const message = document.getElementById('message')?.value || '';
        
        return `${t.greeting}\n\n` +
            `${t.myInfo}\n` +
            `- ${t.name} : ${nom}\n` +
            `- ${t.phone} : ${telephone}\n` +
            `- ${t.email} : ${email}\n\n` +
            `${t.beneficiaryInfo}\n` +
            `- ${t.name} : ${beneficiaireNom}\n` +
            `- ${t.phone} : ${beneficiaireTelephone}\n` +
            `- ${t.address} : ${beneficiaireAdresse}\n\n` +
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
    
    // Mettre à jour l'aperçu en temps réel sur les champs de l'étape 3
    const confirmationStep = document.querySelector('.form-step[data-step="3"]');
    if (confirmationStep) {
        confirmationStep.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateWhatsAppPreview);
        });
    }

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