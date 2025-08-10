from flask import Flask, render_template, send_from_directory, request, redirect, url_for, session, jsonify, make_response
import json
import os
import logging
from functools import wraps
from config import Config

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('enviar.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration de l'application Flask
app = Flask(__name__,
    static_folder='static',
    static_url_path='/static',
    template_folder='templates'
)

# Configuration de l'application
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# Désactiver la mise en cache des fichiers statiques
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Chemins des fichiers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TAUX_FILE = os.path.join(BASE_DIR, Config.TAUX_FILE)

# Fonction pour lire les identifiants depuis le fichier de configuration
def load_admin_credentials():
    try:
        return Config.ADMIN_USERNAME, Config.ADMIN_PASSWORD
    except Exception as e:
        logger.error(f"Erreur lors du chargement des identifiants: {e}")
        return 'admin', 'admin123'  # Valeurs par défaut de sécurité

# Charger les taux actuels
def load_taux():
    if os.path.exists(TAUX_FILE):
        try:
            with open(TAUX_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.info("Taux chargés avec succès depuis le fichier")
                return {
                    'taux_cad_gnf': data.get('taux_cad_gnf', 6700.0),
                    'taux_xof_gnf': data.get('taux_xof_gnf', 8.0),
                    'frais_canada_guinee': data.get('frais_canada_guinee', 3.0),
                    'frais_canada_senegal': data.get('frais_canada_senegal', 3.0),
                    'frais_guinee_canada': data.get('frais_guinee_canada', 3.0),
                    'frais_guinee_senegal': data.get('frais_guinee_senegal', 3.0),
                    'frais_senegal_canada': data.get('frais_senegal_canada', 3.0),
                    'frais_senegal_guinee': data.get('frais_senegal_guinee', 3.0)
                }
        except (json.JSONDecodeError, AttributeError) as e:
            logger.error(f"Erreur lors du décodage du fichier taux.json: {e}")
            return get_default_taux()
        except Exception as e:
            logger.error(f"Erreur inattendue lors du chargement des taux: {e}")
            return get_default_taux()
    else:
        logger.warning("Fichier taux.json non trouvé, utilisation des valeurs par défaut")
        return get_default_taux()

def get_default_taux():
    """Retourne les taux par défaut"""
    return {
        'taux_cad_gnf': 6700.0,
        'taux_xof_gnf': 8.0,
        'frais_canada_guinee': 3.0,
        'frais_canada_senegal': 3.0,
        'frais_guinee_canada': 3.0,
        'frais_guinee_senegal': 3.0,
        'frais_senegal_canada': 3.0,
        'frais_senegal_guinee': 3.0
    }

# Sauvegarder les nouveaux taux et frais
def save_taux(taux_cad_gnf, taux_xof_gnf, frais_data):
    try:
        with open(TAUX_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'taux_cad_gnf': taux_cad_gnf,
                'taux_xof_gnf': taux_xof_gnf,
                'frais_canada_guinee': frais_data.get('frais_canada_guinee', 3.0),
                'frais_canada_senegal': frais_data.get('frais_canada_senegal', 3.0),
                'frais_guinee_canada': frais_data.get('frais_guinee_canada', 3.0),
                'frais_guinee_senegal': frais_data.get('frais_guinee_senegal', 3.0),
                'frais_senegal_canada': frais_data.get('frais_senegal_canada', 3.0),
                'frais_senegal_guinee': frais_data.get('frais_senegal_guinee', 3.0)
            }, f, indent=4, ensure_ascii=False)
        logger.info("Taux sauvegardés avec succès")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde des taux: {e}")
        return False

# Décorateur pour vérifier si l'utilisateur est connecté
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            logger.warning(f"Tentative d'accès non autorisé à {request.endpoint}")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Validation des données d'entrée
def validate_numeric_input(value, min_val=0, max_val=None):
    """Valide qu'une valeur est numérique et dans les limites spécifiées"""
    try:
        num_val = float(value)
        if num_val < min_val:
            return False, f"La valeur doit être supérieure à {min_val}"
        if max_val is not None and num_val > max_val:
            return False, f"La valeur doit être inférieure à {max_val}"
        return True, num_val
    except (ValueError, TypeError):
        return False, "Valeur numérique invalide"

# Route pour la page d'accueil
@app.route('/')
@app.route('/index.html')
def home():
    try:
        taux = load_taux()
        return render_template('index.html', 
                             taux_cad_gnf=taux['taux_cad_gnf'],
                             taux_xof_gnf=taux['taux_xof_gnf'])
    except Exception as e:
        logger.error(f"Erreur lors du chargement de la page d'accueil: {e}")
        return render_template('index.html', 
                             taux_cad_gnf=6700.0,
                             taux_xof_gnf=8.0)

# Route pour obtenir les taux actuels
@app.route('/get_taux')
def get_taux():
    try:
        taux = load_taux()
        response = jsonify(taux)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des taux: {e}")
        return jsonify({'error': 'Erreur lors du chargement des taux'}), 500

# Route pour obtenir les frais par destination
@app.route('/get_frais')
def get_frais():
    try:
        taux = load_taux()
        response = jsonify({
            'frais_canada_guinee': taux['frais_canada_guinee'],
            'frais_canada_senegal': taux['frais_canada_senegal'],
            'frais_guinee_canada': taux['frais_guinee_canada'],
            'frais_guinee_senegal': taux['frais_guinee_senegal'],
            'frais_senegal_canada': taux['frais_senegal_canada'],
            'frais_senegal_guinee': taux['frais_senegal_guinee']
        })
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des frais: {e}")
        return jsonify({'error': 'Erreur lors du chargement des frais'}), 500

# Route pour la page de connexion
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        try:
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '').strip()
            
            if not username or not password:
                error = 'Tous les champs sont requis.'
            else:
                admin_username, admin_password = load_admin_credentials()
                if username == admin_username and password == admin_password:
                    session['logged_in'] = True
                    logger.info(f"Connexion réussie pour l'utilisateur: {username}")
                    return redirect(url_for('admin'))
                else:
                    error = 'Identifiants invalides. Veuillez réessayer.'
                    logger.warning(f"Tentative de connexion échouée pour l'utilisateur: {username}")
        except Exception as e:
            logger.error(f"Erreur lors de la connexion: {e}")
            error = 'Une erreur est survenue. Veuillez réessayer.'
    
    return render_template('login.html', error=error)

# Route pour la page d'administration (protégée)
@app.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    try:
        taux = load_taux()
        return render_template('admin.html', 
                             taux_cad_gnf=taux['taux_cad_gnf'],
                             taux_xof_gnf=taux['taux_xof_gnf'],
                             frais_canada_guinee=taux['frais_canada_guinee'],
                             frais_canada_senegal=taux['frais_canada_senegal'],
                             frais_guinee_canada=taux['frais_guinee_canada'],
                             frais_guinee_senegal=taux['frais_guinee_senegal'],
                             frais_senegal_canada=taux['frais_senegal_canada'],
                             frais_senegal_guinee=taux['frais_senegal_guinee'])
    except Exception as e:
        logger.error(f"Erreur lors du chargement de la page admin: {e}")
        return render_template('admin.html', 
                             taux_cad_gnf=6700.0,
                             taux_xof_gnf=8.0,
                             frais_canada_guinee=3.0,
                             frais_canada_senegal=3.0,
                             frais_guinee_canada=3.0,
                             frais_guinee_senegal=3.0,
                             frais_senegal_canada=3.0,
                             frais_senegal_guinee=3.0)

# Route pour la déconnexion
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    logger.info("Déconnexion réussie")
    return redirect(url_for('home'))

# Route pour mettre à jour le taux (protégée)
@app.route('/update_taux', methods=['POST'])
@login_required
def update_taux():
    if request.method == 'POST':
        try:
            nouveau_taux_cad = request.form.get('nouveau-taux-cad', '')
            
            # Validation de l'entrée
            is_valid, result = validate_numeric_input(nouveau_taux_cad, min_val=0.01)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': result
                })
            
            nouveau_taux_cad = result
            
            # Charger le taux XOF actuel pour le garder inchangé
            taux_actuel = load_taux()
            taux_xof_actuel = taux_actuel['taux_xof_gnf']
            
            # Récupérer et valider les frais
            frais_data = {}
            frais_fields = [
                'frais-canada-guinee', 'frais-canada-senegal', 'frais-guinee-canada',
                'frais-guinee-senegal', 'frais-senegal-canada', 'frais-senegal-guinee'
            ]
            
            for field in frais_fields:
                frais_value = request.form.get(field, '3.0')
                is_valid, result = validate_numeric_input(frais_value, min_val=0, max_val=100)
                if not is_valid:
                    return jsonify({
                        'success': False,
                        'error': f"Frais invalide pour {field}: {result}"
                    })
                frais_data[field.replace('-', '_')] = result
            
            # Sauvegarder les nouveaux taux
            if save_taux(nouveau_taux_cad, taux_xof_actuel, frais_data):
                logger.info(f"Taux mis à jour: CAD/GNF = {nouveau_taux_cad}")
                return jsonify({
                    'success': True,
                    'new_taux_cad': nouveau_taux_cad,
                    'new_taux_xof': taux_xof_actuel,
                    'frais_data': frais_data
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Erreur lors de la sauvegarde'
                })
                
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour des taux: {e}")
            return jsonify({
                'success': False,
                'error': 'Une erreur est survenue lors de la mise à jour'
            })

@app.route('/update_taux_simple', methods=['POST'])
@login_required
def update_taux_simple():
    if request.method == 'POST':
        try:
            destination = request.form.get('destination', '').strip()
            nouveau_taux = request.form.get('nouveau-taux', '')
            
            if not destination or not nouveau_taux:
                return jsonify({
                    'success': False,
                    'error': 'Tous les champs sont requis'
                })
            
            # Validation du taux
            is_valid, result = validate_numeric_input(nouveau_taux, min_val=0.01)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': result
                })
            
            nouveau_taux = result
            
            # Charger les taux actuels
            taux_actuel = load_taux()
            
            if destination == 'canada-guinee':
                # Mettre à jour le taux CAD/GNF
                if save_taux(nouveau_taux, taux_actuel['taux_xof_gnf'], {
                    'frais_canada_guinee': taux_actuel['frais_canada_guinee'],
                    'frais_canada_senegal': taux_actuel['frais_canada_senegal'],
                    'frais_guinee_canada': taux_actuel['frais_guinee_canada'],
                    'frais_guinee_senegal': taux_actuel['frais_guinee_senegal'],
                    'frais_senegal_canada': taux_actuel['frais_senegal_canada'],
                    'frais_senegal_guinee': taux_actuel['frais_senegal_guinee']
                }):
                    logger.info(f"Taux CAD/GNF mis à jour: {nouveau_taux}")
                    return jsonify({
                        'success': True,
                        'message': f'Taux mis à jour pour {destination}'
                    })
            elif destination == 'senegal-guinee':
                # Mettre à jour le taux XOF/GNF (inversé)
                if save_taux(taux_actuel['taux_cad_gnf'], 1/nouveau_taux, {
                    'frais_canada_guinee': taux_actuel['frais_canada_guinee'],
                    'frais_canada_senegal': taux_actuel['frais_canada_senegal'],
                    'frais_guinee_canada': taux_actuel['frais_guinee_canada'],
                    'frais_guinee_senegal': taux_actuel['frais_guinee_senegal'],
                    'frais_senegal_canada': taux_actuel['frais_senegal_canada'],
                    'frais_senegal_guinee': taux_actuel['frais_senegal_guinee']
                }):
                    logger.info(f"Taux XOF/GNF mis à jour: {nouveau_taux}")
                    return jsonify({
                        'success': True,
                        'message': f'Taux mis à jour pour {destination}'
                    })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Destination invalide'
                })
            
            return jsonify({
                'success': False,
                'error': 'Erreur lors de la sauvegarde'
            })
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour simple des taux: {e}")
            return jsonify({
                'success': False,
                'error': 'Une erreur est survenue lors de la mise à jour'
            })

@app.route('/update_frais_simple', methods=['POST'])
@login_required
def update_frais_simple():
    if request.method == 'POST':
        try:
            destination = request.form.get('destination', '').strip()
            nouveau_frais = request.form.get('nouveau-frais', '')
            
            if not destination or not nouveau_frais:
                return jsonify({
                    'success': False,
                    'error': 'Tous les champs sont requis'
                })
            
            # Validation du frais
            is_valid, result = validate_numeric_input(nouveau_frais, min_val=0, max_val=100)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': result
                })
            
            nouveau_frais = result
            
            # Charger les taux actuels
            taux_actuel = load_taux()
            
            # Créer un dictionnaire avec tous les frais actuels
            frais_data = {
                'frais_canada_guinee': taux_actuel['frais_canada_guinee'],
                'frais_canada_senegal': taux_actuel['frais_canada_senegal'],
                'frais_guinee_canada': taux_actuel['frais_guinee_canada'],
                'frais_guinee_senegal': taux_actuel['frais_guinee_senegal'],
                'frais_senegal_canada': taux_actuel['frais_senegal_canada'],
                'frais_senegal_guinee': taux_actuel['frais_senegal_guinee']
            }
            
            # Mettre à jour le frais spécifique
            frais_mapping = {
                'canada-guinee': 'frais_canada_guinee',
                'canada-senegal': 'frais_canada_senegal',
                'guinee-canada': 'frais_guinee_canada',
                'guinee-senegal': 'frais_guinee_senegal',
                'senegal-canada': 'frais_senegal_canada',
                'senegal-guinee': 'frais_senegal_guinee'
            }
            
            if destination in frais_mapping:
                frais_data[frais_mapping[destination]] = nouveau_frais
                
                # Sauvegarder avec les nouveaux frais
                if save_taux(taux_actuel['taux_cad_gnf'], taux_actuel['taux_xof_gnf'], frais_data):
                    logger.info(f"Frais mis à jour pour {destination}: {nouveau_frais}%")
                    return jsonify({
                        'success': True,
                        'message': f'Frais mis à jour pour {destination}'
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Erreur lors de la sauvegarde'
                    })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Destination invalide'
                })
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour des frais: {e}")
            return jsonify({
                'success': False,
                'error': 'Une erreur est survenue lors de la mise à jour'
            })

# Route pour servir les images
@app.route('/images/<path:filename>')
def serve_images(filename):
    try:
        return send_from_directory(os.path.join(BASE_DIR, 'images'), filename)
    except FileNotFoundError:
        logger.warning(f"Image non trouvée: {filename}")
        return "", 404

# Route pour servir les fichiers HTML statiques
@app.route('/<path:filename>')
def serve_html(filename):
    if filename.endswith('.html') and not filename.startswith('static/'):
        try:
            return send_from_directory(BASE_DIR, filename)
        except FileNotFoundError:
            logger.warning(f"Fichier HTML non trouvé: {filename}")
            return "", 404
    return "", 404

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/a-propos')
def a_propos():
    return render_template('a-propos.html')

@app.route('/fonctionnement')
def fonctionnement():
    return render_template('fonctionnement.html')

@app.route('/transfert')
def transfert():
    return render_template('transfert.html')

@app.route('/conditions')
def conditions():
    return render_template('conditions.html')

@app.route('/confidentialite')
def confidentialite():
    return render_template('confidentialite.html')

@app.route('/cookies')
def cookies():
    return render_template('cookies.html')

@app.route('/submit-transfer', methods=['POST'])
@login_required
def submit_transfer():
    try:
        # Validation des données du formulaire
        required_fields = ['paysDepart', 'paysDestination', 'montant', 'nom', 'telephone']
        for field in required_fields:
            if not request.form.get(field, '').strip():
                return jsonify({
                    'success': False,
                    'error': f'Le champ {field} est requis'
                })
        
        # Récupérer les données du formulaire
        data = {
            'pays_depart': request.form.get('paysDepart', '').strip(),
            'pays_destination': request.form.get('paysDestination', '').strip(),
            'montant': request.form.get('montant', '').strip(),
            'montant_recu': request.form.get('montantRecu', '').strip(),
            'frais': request.form.get('frais', '').strip(),
            'total': request.form.get('total', '').strip(),
            'nom': request.form.get('nom', '').strip(),
            'telephone': request.form.get('telephone', '').strip(),
            'email': request.form.get('email', '').strip(),
            'beneficiaire_nom': request.form.get('beneficiaire-nom', '').strip(),
            'beneficiaire_telephone': request.form.get('beneficiaire-telephone', '').strip(),
            'beneficiaire_adresse': request.form.get('beneficiaire-adresse', '').strip(),
            'message': request.form.get('message', '').strip()
        }
        
        # Validation du montant
        if data['montant']:
            is_valid, result = validate_numeric_input(data['montant'], min_val=0.01)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': f'Montant invalide: {result}'
                })
        
        logger.info(f"Transfert soumis: {data['nom']} - {data['pays_depart']} vers {data['pays_destination']}")
        
        # Ici, vous pouvez ajouter le code pour sauvegarder les données dans une base de données
        # ou envoyer un email de confirmation
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Erreur lors de la soumission du transfert: {e}")
        return jsonify({'success': False, 'error': 'Une erreur est survenue lors de la soumission'})

@app.route('/set-cookie-consent', methods=['POST'])
def set_cookie_consent():
    try:
        consent = request.json.get('consent')
        if consent not in ['accepted', 'rejected']:
            return jsonify({'success': False, 'error': 'Valeur de consentement invalide'}), 400
        
        response = make_response(jsonify({'success': True}))
        
        if consent == 'accepted':
            response.set_cookie(
                Config.COOKIE_CONSENT_NAME,
                'accepted',
                max_age=Config.COOKIE_CONSENT_MAX_AGE,
                secure=Config.SESSION_COOKIE_SECURE,
                httponly=False,
                samesite='Lax'
            )
        else:
            response.set_cookie(
                Config.COOKIE_CONSENT_NAME,
                'rejected',
                max_age=Config.COOKIE_CONSENT_MAX_AGE,
                secure=Config.SESSION_COOKIE_SECURE,
                httponly=False,
                samesite='Lax'
            )
        
        logger.info(f"Consentement aux cookies {consent}")
        return response
    except Exception as e:
        logger.error(f"Erreur lors de la définition du consentement aux cookies: {e}")
        return jsonify({'success': False, 'error': str(e)}), 400

# Gestionnaire d'erreurs global
@app.errorhandler(404)
def not_found_error(error):
    logger.warning(f"Page non trouvée: {request.url}")
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Erreur interne du serveur: {error}")
    return render_template('500.html'), 500

if __name__ == "__main__":
    logger.info("Démarrage de l'application Enviar")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG) 