// Fonction pour mettre à jour la devise affichée
function updateDevise() {
    const paysDepart = document.getElementById('pays-depart').value;
    const deviseMontant = document.getElementById('devise-montant');
    
    if (paysDepart === 'guinee') {
        deviseMontant.textContent = 'GNF';
    } else if (paysDepart === 'senegal') {
        deviseMontant.textContent = 'XOF';
    } else {
        deviseMontant.textContent = '';
    }
}

// Fonction pour mettre à jour le pays de destination en fonction du pays de départ
function updatePaysDestination() {
    const paysDepart = document.getElementById('pays-depart');
    const paysDestination = document.getElementById('pays-destination');
    
    if (!paysDepart || !paysDestination) {
        console.error('Éléments de sélection non trouvés');
        return;
    }
    
    // Réinitialiser les options
    paysDestination.innerHTML = '';
    
    const selectedValue = paysDepart.value;
    console.log('Pays de départ sélectionné:', selectedValue);
    
    if (selectedValue === 'guinee') {
        const option = document.createElement('option');
        option.value = 'senegal';
        option.text = 'Sénégal (XOF)';
        paysDestination.appendChild(option);
        paysDestination.value = 'senegal';
        console.log('Sénégal sélectionné comme destination');
    } else if (selectedValue === 'senegal') {
        const option = document.createElement('option');
        option.value = 'guinee';
        option.text = 'Guinée (GNF)';
        paysDestination.appendChild(option);
        paysDestination.value = 'guinee';
        console.log('Guinée sélectionnée comme destination');
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.text = 'Sélectionnez d\'abord le pays de départ';
        paysDestination.appendChild(option);
        console.log('Aucun pays de départ sélectionné');
    }
    
    // Mettre à jour la devise affichée
    updateDevise();
}

// Fonction pour formater les montants
function formatMontant(montant, devise) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(montant) + ' ' + devise;
}

// Fonction pour calculer le transfert
function calculerTransfert(event) {
    event.preventDefault();
    
    const paysDepart = document.getElementById('pays-depart').value;
    const montant = parseFloat(document.getElementById('montant').value);
    const tauxGnfXof = parseFloat(document.getElementById('taux-gnf-xof').textContent);
    
    if (isNaN(montant) || montant <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }
    
    // Calculer les frais (3% du montant)
    const frais = montant * 0.03;
    const totalPayer = montant + frais;
    
    // Calculer le montant à recevoir
    let montantRecu;
    if (paysDepart === 'guinee') {
        montantRecu = montant * tauxGnfXof;
    } else {
        montantRecu = montant / tauxGnfXof;
    }
    
    // Formater les montants avec les devises appropriées
    const deviseDepart = paysDepart === 'guinee' ? 'GNF' : 'XOF';
    const deviseDestination = paysDepart === 'guinee' ? 'XOF' : 'GNF';
    
    // Afficher les résultats dans la modal
    document.getElementById('taux-jour').textContent = `1 GNF = ${tauxGnfXof.toFixed(5)} XOF`;
    document.getElementById('montant-envoyer').textContent = formatMontant(montant, deviseDepart);
    document.getElementById('frais').textContent = formatMontant(frais, deviseDepart);
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

    // Construire l'URL avec les paramètres
    const params = new URLSearchParams({
        paysDepart: paysDepart,
        paysDestination: paysDestination,
        montant: montant,
        montantRecu: montantRecu,
        frais: frais,
        total: total
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
    console.log('DOM chargé, initialisation des écouteurs...');
    
    const calculatorForm = document.getElementById('calculator-form');
    const contactForm = document.getElementById('contact-form');
    const paysDepart = document.getElementById('pays-depart');
    const closeModalBtn = document.querySelector('.close-modal');
    
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', calculerTransfert);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', envoyerFormulaire);
    }

    if (paysDepart) {
        console.log('Écouteur ajouté pour le changement de pays de départ');
        paysDepart.addEventListener('change', function() {
            console.log('Changement de pays de départ détecté');
            updatePaysDestination();
        });
        // Appeler updatePaysDestination au chargement pour initialiser le pays de destination
        updatePaysDestination();
    } else {
        console.error('Élément pays-depart non trouvé');
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