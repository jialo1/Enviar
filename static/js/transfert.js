document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', 
                menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Fermer le menu lors du clic sur un lien
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Fermer le menu lors du clic en dehors
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

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
        const nom = document.getElementById('nom').value;
        const telephone = document.getElementById('telephone').value;
        const email = document.getElementById('email').value;
        const beneficiaireNom = document.getElementById('beneficiaire-nom').value;
        const beneficiaireTelephone = document.getElementById('beneficiaire-telephone').value;
        const beneficiaireAdresse = document.getElementById('beneficiaire-adresse').value;
        const message = document.getElementById('message').value;
        return `Bonjour, je souhaite effectuer un transfert d'argent.\n\n` +
            `Mes informations :\n` +
            `- Nom : ${nom}\n` +
            `- Téléphone : ${telephone}\n` +
            `- Email : ${email}\n\n` +
            `Informations du bénéficiaire :\n` +
            `- Nom : ${beneficiaireNom}\n` +
            `- Téléphone : ${beneficiaireTelephone}\n` +
            `- Adresse : ${beneficiaireAdresse}\n\n` +
            `Détails du transfert :\n` +
            `- Pays d'envoi : ${transfertData.paysDepartLabel || transfertData.paysDepart}\n` +
            `- Pays de réception : ${transfertData.paysDestinationLabel || transfertData.paysDestination}\n` +
            `- Montant à envoyer : ${formatMontant(transfertData.montant, transfertData.deviseDepart)}\n` +
            `- Frais : ${formatMontant(transfertData.frais, transfertData.deviseDepart)}\n` +
            `- Total à payer : ${formatMontant(transfertData.total, transfertData.deviseDepart)}\n` +
            `- Montant à recevoir : ${formatMontant(transfertData.montantRecu, transfertData.deviseDestination)}\n\n` +
            `Message : ${message}`;
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
                // Changer temporairement le texte du bouton
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copié !';
                copyButton.style.background = '#128C7E';
                
                // Remettre le texte original après 2 secondes
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                    copyButton.style.background = '#25D366';
                }, 2000);
            }).catch(err => {
                console.error('Erreur lors de la copie :', err);
                alert('Impossible de copier le message. Veuillez réessayer.');
            });
        });
    }
}); 