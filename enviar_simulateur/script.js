function calculer() {
    const taux = 9200;
    const frais = 3;
    const montant = parseFloat(document.getElementById("montant").value);

    if (isNaN(montant) || montant <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    const totalDebite = montant + frais;
    const montantRecu = montant * taux;

    document.getElementById("frais").innerText = `Frais : ${frais} €`;
    document.getElementById("montant_recu").innerText = `Montant reçu : ${montantRecu.toLocaleString()} GNF`;
    document.getElementById("total_debite").innerText = `Total à débiter : ${totalDebite} €`;

    const message = `Bonjour, je souhaite envoyer ${montant}€ via Enviar.%0AMontant à recevoir : ${montantRecu.toLocaleString()} GNF.%0AFrais estimés : ${frais}€.%0ATotal débité : ${totalDebite}€.`;
    const lien = `https://wa.me/?text=${encodeURIComponent(message)}`;
    document.getElementById("lienWhatsapp").href = lien;
}