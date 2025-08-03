// Fonction pour mettre à jour la devise affichée
function updateDevise() {
    const paysDepart = document.getElementById('pays-depart').value;
    const deviseSpan = document.getElementById('devise-montant');
    
    const devises = {
        'canada': 'CAD',
        'guinee': 'GNF',
        'senegal': 'XOF'
    };
    
    deviseSpan.textContent = devises[paysDepart] || '';
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
        // Le montant saisi est le montant à envoyer (avant frais)
        // Calculer le montant à recevoir directement
        montantRecu = montant * tauxCadGnf;
        tauxAffiche = `1 CAD = ${Math.round(tauxCadGnf)} GNF`;
    } else if (paysDepart === 'canada' && paysDestination === 'senegal') {
        // CAD -> XOF (via GNF)
        const gnfAmount = montant * tauxCadGnf;
        montantRecu = gnfAmount / tauxXofGnf;
        const tauxCadXof = tauxCadGnf / tauxXofGnf;
        tauxAffiche = `1 CAD = ${tauxCadXof.toFixed(4)} XOF`;
    } else if (paysDepart === 'guinee' && paysDestination === 'canada') {
        // GNF -> CAD
        montantRecu = montant / tauxCadGnf;
        tauxAffiche = `1 GNF = ${(1/tauxCadGnf).toFixed(6)} CAD`;
    } else if (paysDepart === 'guinee' && paysDestination === 'senegal') {
        // GNF -> XOF
        montantRecu = montant / tauxXofGnf;
        tauxAffiche = `1 XOF = ${tauxXofGnf.toFixed(2)} GNF`;
    } else if (paysDepart === 'senegal' && paysDestination === 'canada') {
        // XOF -> CAD (via GNF)
        const gnfAmount = montant * tauxXofGnf;
        montantRecu = gnfAmount / tauxCadGnf;
        const tauxXofCad = tauxXofGnf / tauxCadGnf;
        tauxAffiche = `1 XOF = ${tauxXofCad.toFixed(6)} CAD`;
    } else if (paysDepart === 'senegal' && paysDestination === 'guinee') {
        // XOF -> GNF
        montantRecu = montant * tauxXofGnf;
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

    // Pré-remplir le formulaire de contact
    document.getElementById('contact-pays-depart').value = paysDepart;
    document.getElementById('contact-pays-destination').value = paysDestination;
    document.getElementById('contact-montant').value = montant;
    document.getElementById('contact-montant-recu').value = montantRecu;
    document.getElementById('contact-frais').value = frais;
    document.getElementById('contact-total').value = total;

    // Fermer la modal de résultat et ouvrir le formulaire de contact
    closeModal();
    
    // Afficher le formulaire de contact
    const contactForm = document.getElementById('contact-form-container');
    contactForm.style.display = 'block';
    
    // Faire défiler vers le formulaire
    contactForm.scrollIntoView({ behavior: 'smooth' });
}

// Fonction pour envoyer le formulaire de contact
async function envoyerFormulaire(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/submit-transfer', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.');
            event.target.reset();
            document.getElementById('contact-form-container').style.display = 'none';
        } else {
            alert('Erreur lors de l\'envoi du formulaire. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'envoi du formulaire. Veuillez réessayer.');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour la devise au chargement
    updateDevise();
    
    // Écouter les changements de pays de départ
    document.getElementById('pays-depart').addEventListener('change', updateDevise);
    
    // Écouter la soumission du formulaire de calcul
    document.getElementById('calculator-form').addEventListener('submit', calculerTransfert);
    
    // Écouter la soumission du formulaire de contact
    document.getElementById('contact-form').addEventListener('submit', envoyerFormulaire);
    
    // Fermer la modal en cliquant sur le bouton de fermeture
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Fermer la modal en cliquant en dehors
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('resultat-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}); 