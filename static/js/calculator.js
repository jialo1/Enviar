// Fonction pour mettre à jour la devise affichée
function updateDevise() {
    const paysDepart = document.getElementById('pays-depart').value;
    const deviseMontant = document.getElementById('devise-montant');
    
    if (paysDepart === 'guinee') {
        deviseMontant.textContent = 'GNF';
    } else if (paysDepart === 'senegal') {
        deviseMontant.textContent = 'XOF';
    } else if (paysDepart === 'canada') {
        deviseMontant.textContent = 'CAD';
    } else {
        deviseMontant.textContent = '';
    }
}

// Fonction pour formater les montants
function formatMontant(montant, devise) {
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
    
    return new Intl.NumberFormat('fr-FR', options).format(montant) + ' ' + devise;
}

// Fonction pour calculer le transfert
async function calculerTransfert(event) {
    event.preventDefault();
    
    const paysDepart = document.getElementById('pays-depart').value;
    const paysDestination = document.getElementById('pays-destination').value;
    const montant = parseFloat(document.getElementById('montant').value);

    // Charger les taux et frais depuis le backend
    let tauxCadGnf, tauxXofGnf, frais;
    try {
        const [tauxResponse, fraisResponse] = await Promise.all([
            fetch('/get_taux'),
            fetch('/get_frais')
        ]);
        const taux = await tauxResponse.json();
        const fraisData = await fraisResponse.json();
        
        tauxCadGnf = taux.taux_cad_gnf;
        tauxXofGnf = taux.taux_xof_gnf;
        
        // Déterminer les frais selon la destination
        if (paysDepart === 'canada' && paysDestination === 'guinee') {
            frais = fraisData.frais_canada_guinee / 100;
        } else if (paysDepart === 'canada' && paysDestination === 'senegal') {
            frais = fraisData.frais_canada_senegal / 100;
        } else if (paysDepart === 'guinee' && paysDestination === 'canada') {
            frais = fraisData.frais_guinee_canada / 100;
        } else if (paysDepart === 'guinee' && paysDestination === 'senegal') {
            frais = fraisData.frais_guinee_senegal / 100;
        } else if (paysDepart === 'senegal' && paysDestination === 'canada') {
            frais = fraisData.frais_senegal_canada / 100;
        } else if (paysDepart === 'senegal' && paysDestination === 'guinee') {
            frais = fraisData.frais_senegal_guinee / 100;
        } else {
            frais = 0.03; // Frais par défaut si combinaison non prévue
        }
    } catch (error) {
        console.error('Erreur lors du chargement des taux et frais :', error);
        alert("Impossible de charger les taux et frais. Veuillez réessayer.");
        return;
    }
    
    if (isNaN(montant) || montant <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }
    
    // Calculer les frais selon le taux spécifique
    const fraisMontant = montant * frais;
    const totalPayer = montant + fraisMontant;
    
    // Calculer le montant à recevoir selon les pays de départ et destination
    let montantRecu;
    let deviseDepart, deviseDestination, tauxAffiche;

    // Définir les devises pour chaque pays
    const devises = {
        'canada': 'CAD',
        'guinee': 'GNF', 
        'senegal': 'XOF'
    };

    deviseDepart = devises[paysDepart];
    deviseDestination = devises[paysDestination];

    // Calculer selon toutes les combinaisons possibles
    if (paysDepart === 'canada' && paysDestination === 'guinee') {
        // Le montant saisi est le montant à envoyer (après frais)
        // Il faut calculer le montant avant frais pour la conversion
        const montantAvantFrais = montant / (1 + frais);
        montantRecu = montantAvantFrais * tauxCadGnf;
        tauxAffiche = `1 CAD = ${Math.round(tauxCadGnf)} GNF`;
    } else if (paysDepart === 'canada' && paysDestination === 'senegal') {
        // CAD -> XOF (via GNF)
        const montantAvantFrais = montant / (1 + frais);
        const gnfAmount = montantAvantFrais * tauxCadGnf;
        montantRecu = gnfAmount / tauxXofGnf;
        const tauxCadXof = tauxCadGnf / tauxXofGnf;
        tauxAffiche = `1 CAD = ${tauxCadXof.toFixed(4)} XOF`;
    } else if (paysDepart === 'guinee' && paysDestination === 'canada') {
        // GNF -> CAD
        const montantAvantFrais = montant / (1 + frais);
        montantRecu = montantAvantFrais / tauxCadGnf;
        tauxAffiche = `1 GNF = ${(1/tauxCadGnf).toFixed(6)} CAD`;
    } else if (paysDepart === 'guinee' && paysDestination === 'senegal') {
        // GNF -> XOF
        const montantAvantFrais = montant / (1 + frais);
        montantRecu = montantAvantFrais / tauxXofGnf;
        tauxAffiche = `1 XOF = ${tauxXofGnf.toFixed(2)} GNF`;
    } else if (paysDepart === 'senegal' && paysDestination === 'canada') {
        // XOF -> CAD (via GNF)
        const montantAvantFrais = montant / (1 + frais);
        const gnfAmount = montantAvantFrais * tauxXofGnf;
        montantRecu = gnfAmount / tauxCadGnf;
        const tauxXofCad = tauxXofGnf / tauxCadGnf;
        tauxAffiche = `1 XOF = ${tauxXofCad.toFixed(6)} CAD`;
    } else if (paysDepart === 'senegal' && paysDestination === 'guinee') {
        // XOF -> GNF
        const montantAvantFrais = montant / (1 + frais);
        montantRecu = montantAvantFrais * tauxXofGnf;
        tauxAffiche = `1 XOF = ${Math.round(tauxXofGnf)} GNF`;
    } else if (paysDepart === paysDestination) {
        // Même pays - pas de conversion
        montantRecu = montant;
        tauxAffiche = `Aucune conversion nécessaire`;
    } else {
        // Combinaison non prévue - utiliser une conversion générique
        montantRecu = montant;
        tauxAffiche = `Taux non disponible pour cette combinaison`;
    }
    
    // Afficher les résultats dans la modal
    document.getElementById('taux-jour').textContent = tauxAffiche;
    document.getElementById('montant-envoyer').textContent = formatMontant(montant, deviseDepart);
    document.getElementById('frais').textContent = formatMontant(fraisMontant, deviseDepart);
    document.getElementById('total-payer').textContent = formatMontant(totalPayer, deviseDepart);
    document.getElementById('montant-recu').textContent = formatMontant(montantRecu, deviseDestination);
    
    // Afficher la modal
    const modal = document.getElementById('resultat-modal');
    modal.style.display = 'block';
    
    // Empêcher le défilement du body quand la modal est ouverte
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer la modal
function closeModal() {
    const modal = document.getElementById('resultat-modal');
    modal.style.display = 'none';
    // Réactiver le défilement du body
    document.body.style.overflow = 'auto';
}

// Fonction pour afficher le formulaire de contact
function showContactForm() {
    // Récupérer les données du calcul
    const paysDepart = document.getElementById('pays-depart').value;
    const paysDestination = document.getElementById('pays-destination').value;
    const montant = document.getElementById('montant').value;
    const montantRecu = document.getElementById('montant-recu').textContent.replace(/\s+/g, '');
    const frais = document.getElementById('frais').textContent.replace(/\s+/g, '');
    const total = document.getElementById('total-payer').textContent.replace(/\s+/g, '');

    // Déduire les noms et devises
    const paysLabels = {
        'canada': 'Canada (CAD)',
        'guinee': 'Guinée (GNF)',
        'senegal': 'Sénégal (XOF)'
    };
    const deviseLabels = {
        'canada': 'CAD',
        'guinee': 'GNF',
        'senegal': 'XOF'
    };

    const paysDepartLabel = paysLabels[paysDepart] || paysDepart;
    const paysDestinationLabel = paysLabels[paysDestination] || paysDestination;
    const deviseDepart = deviseLabels[paysDepart] || '';
    const deviseDestination = deviseLabels[paysDestination] || '';

    // Construire l'URL avec les paramètres
    const params = new URLSearchParams({
        paysDepart: paysDepart,
        paysDepartLabel: paysDepartLabel,
        paysDestination: paysDestination,
        paysDestinationLabel: paysDestinationLabel,
        montant: montant,
        montantRecu: montantRecu,
        frais: frais,
        total: total,
        deviseDepart: deviseDepart,
        deviseDestination: deviseDestination
    });

    // Rediriger vers la page de transfert
    window.location.href = `/transfert?${params.toString()}`;
}

// Fonction pour envoyer le formulaire de contact
function envoyerFormulaire(event) {
    event.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const nom = document.getElementById('nom').value;
    const telephone = document.getElementById('telephone').value;
    const email = document.getElementById('email').value;
    const beneficiaireNom = document.getElementById('beneficiaire-nom').value;
    const beneficiaireTelephone = document.getElementById('beneficiaire-telephone').value;
    const beneficiaireAdresse = document.getElementById('beneficiaire-adresse').value;
    const message = document.getElementById('message').value;
    
    // Construire le message WhatsApp
    const messageWhatsApp = `Bonjour, je souhaite effectuer un transfert d'argent.%0A%0A` +
        `Mes informations :%0A` +
        `- Nom : ${nom}%0A` +
        `- Téléphone : ${telephone}%0A` +
        `- Email : ${email}%0A%0A` +
        `Informations du bénéficiaire :%0A` +
        `- Nom : ${beneficiaireNom}%0A` +
        `- Téléphone : ${beneficiaireTelephone}%0A` +
        `- Adresse : ${beneficiaireAdresse}%0A%0A` +
        `Détails du transfert :%0A` +
        `- Montant à envoyer : ${document.getElementById('montant-envoyer').textContent}%0A` +
        `- Frais : ${document.getElementById('frais').textContent}%0A` +
        `- Total à payer : ${document.getElementById('total-payer').textContent}%0A` +
        `- Montant à recevoir : ${document.getElementById('montant-recu').textContent}%0A%0A` +
        `Message : ${message}`;
    
    // Mettre à jour le lien WhatsApp
    const whatsappLink = document.getElementById('whatsapp-link');
    whatsappLink.href = `https://wa.me/15142295522?text=${encodeURIComponent(messageWhatsApp)}`;
    
    // Afficher le bouton WhatsApp
    document.getElementById('contact-form-container').style.display = 'none';
    document.getElementById('whatsapp-button-container').style.display = 'block';
}

// Ajouter les écouteurs d'événements
document.addEventListener('DOMContentLoaded', function() {
    
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(event) {
            calculerTransfert(event).catch(err => {
                console.error("Erreur dans le calcul du transfert :", err);
                alert("Une erreur est survenue. Veuillez réessayer.");
            });
        });
    }

    const contactForm = document.getElementById('contact-form');
    const paysDepartSelect = document.getElementById('custom-pays-depart');
    const closeModalBtn = document.querySelector('.close-modal');
    
    if (contactForm) {
        contactForm.addEventListener('submit', envoyerFormulaire);
    }

    if (paysDepartSelect) {
        // Utiliser un MutationObserver pour détecter les changements d'attributs
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === "attributes" && mutation.attributeName === "data-value") {
            updateDevise();
                }
            });
        });

        observer.observe(paysDepartSelect.querySelector('.selected-option'), {
            attributes: true // écouter les changements d'attributs
        });
        
        // Appeler updateDevise au chargement pour initialiser la devise
        updateDevise();
    } else {
        console.error('Élément custom-pays-depart non trouvé');
    }

    // Gestionnaire pour fermer la modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Fermer la modal si on clique en dehors
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('resultat-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
});