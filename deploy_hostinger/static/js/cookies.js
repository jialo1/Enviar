// Fonction pour définir un cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Fonction pour obtenir un cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Fonction pour effacer un cookie
function eraseCookie(name) {   
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Fonction pour gérer le consentement des cookies
async function handleCookieConsent(accept) {
    try {
        // Appeler l'API pour définir le cookie côté serveur
        const response = await fetch('/set-cookie-consent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                consent: accept ? 'accepted' : 'rejected'
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la définition du consentement des cookies');
        }

        if (accept) {
            // Activer Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            }
            
            // Activer les cookies Zendesk
            if (typeof zE !== 'undefined') {
                zE('messenger', 'show');
            }
        } else {
            // Désactiver tous les cookies non essentiels
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
            
            // Désactiver Zendesk
            if (typeof zE !== 'undefined') {
                zE('messenger', 'hide');
            }
        }
        
        // Cacher le bandeau
        document.getElementById('cookie-banner').style.display = 'none';
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la gestion des cookies. Veuillez réessayer.');
    }
}

// Vérifier si l'utilisateur a déjà fait son choix
document.addEventListener('DOMContentLoaded', function() {
    const consent = getCookie('cookie_consent');
    if (!consent) {
        // Afficher le bandeau si aucun choix n'a été fait
        document.getElementById('cookie-banner').style.display = 'block';
    } else if (consent === 'accepted') {
        // Réactiver les services si le consentement a été donné
        handleCookieConsent(true);
    }
}); 