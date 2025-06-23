document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour formater les montants
    function formatMontant(montant, devise) {
        // Supprimer tous les caractères non numériques sauf le point
        const nombre = parseFloat(montant.toString().replace(/[^\d.-]/g, ''));
        if (isNaN(nombre)) return montant;
        
        // Formater le nombre avec des séparateurs de milliers
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(nombre) + ' ' + (devise || '');
    }

    // Récupérer les données du transfert depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const transfertData = {
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
    paysDepartDiv.innerHTML = '';
    const flagDepart = document.createElement('img');
    flagDepart.src = fallbackFlags[transfertData.paysDepart];
    flagDepart.alt = transfertData.paysDepart;
    flagDepart.className = 'flag-icon';
    paysDepartDiv.appendChild(flagDepart);
    paysDepartDiv.append(' ' + (transfertData.paysDepartLabel || transfertData.paysDepart));

    const paysDestinationDiv = document.getElementById('pays-destination-display');
    paysDestinationDiv.innerHTML = '';
    const flagDest = document.createElement('img');
    flagDest.src = fallbackFlags[transfertData.paysDestination];
    flagDest.alt = transfertData.paysDestination;
    flagDest.className = 'flag-icon';
    paysDestinationDiv.appendChild(flagDest);
    paysDestinationDiv.append(' ' + (transfertData.paysDestinationLabel || transfertData.paysDestination));
    document.getElementById('montant-display').value = formatMontant(transfertData.montant, transfertData.deviseDepart);
    document.getElementById('montant-recu-display').value = formatMontant(transfertData.montantRecu, transfertData.deviseDestination);
    document.getElementById('frais-display').value = formatMontant(transfertData.frais, transfertData.deviseDepart);
    document.getElementById('total-display').value = formatMontant(transfertData.total, transfertData.deviseDepart);

    // Remplir le récapitulatif de la dernière étape avec les montants formatés
    document.getElementById('summary-montant-envoyer').textContent = formatMontant(transfertData.montant, transfertData.deviseDepart);
    document.getElementById('summary-montant-recu').textContent = formatMontant(transfertData.montantRecu, transfertData.deviseDestination);
    document.getElementById('summary-frais').textContent = formatMontant(transfertData.frais, transfertData.deviseDepart);
    document.getElementById('summary-total').textContent = formatMontant(transfertData.total, transfertData.deviseDepart);

    // Gestion des étapes
    const form = document.getElementById('transfert-form');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    let currentStep = 1;

    // Fonction pour afficher une étape spécifique
    function showStep(stepNumber) {
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('active');
            }
        });

        progressSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) <= stepNumber) {
                step.classList.add('active');
            }
        });

        currentStep = stepNumber;
    }

    // Gestion des boutons "Continuer"
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                showStep(currentStep + 1);
            }
        });
    });

    // Gestion des boutons "Retour"
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', () => {
            showStep(currentStep - 1);
        });
    });

    // Validation des étapes
    function validateStep(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
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

        return isValid;
    }

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Empêcher la soumission par défaut
    });

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

        const nom = document.getElementById('nom').value;
        const telephone = document.getElementById('telephone').value;
        const email = document.getElementById('email').value;
        const beneficiaireNom = document.getElementById('beneficiaire-nom').value;
        const beneficiaireTelephone = document.getElementById('beneficiaire-telephone').value;
        const beneficiaireAdresse = document.getElementById('beneficiaire-adresse').value;
        const message = document.getElementById('message').value;
        
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
            `- ${t.amountToSend} : ${formatMontant(transfertData.montant, transfertData.deviseDepart)}\n` +
            `- ${t.fees} : ${formatMontant(transfertData.frais, transfertData.deviseDepart)}\n` +
            `- ${t.totalToPay} : ${formatMontant(transfertData.total, transfertData.deviseDepart)}\n` +
            `- ${t.amountToReceive} : ${formatMontant(transfertData.montantRecu, transfertData.deviseDestination)}\n\n` +
            `${t.message} : ${message}`;
    }

    // Afficher l'aperçu à chaque fois qu'on arrive à l'étape 4 ou qu'on modifie un champ
    function updateWhatsAppPreview() {
        const preview = document.getElementById('whatsapp-preview');
        const whatsappLink = document.getElementById('whatsapp-continue');
        if (preview && currentStep === 4) {
            const message = getMessageWhatsAppLisible();
            preview.textContent = message;
            // Mettre à jour le lien WhatsApp
            whatsappLink.href = `https://wa.me/774062102?text=${encodeURIComponent(message)}`;
        }
    }

    // Mettre à jour l'aperçu lors du passage à l'étape 4
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', () => {
            setTimeout(updateWhatsAppPreview, 100); // Laisse le temps au DOM de changer d'étape
        });
    });
    // Mettre à jour l'aperçu en temps réel sur les champs de l'étape 4
    const confirmationStep = document.querySelector('.form-step[data-step="4"]');
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
}); 