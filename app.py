from flask import Flask, render_template, send_from_directory, request, redirect, url_for, session, jsonify, make_response
import json
import os
from functools import wraps
import secrets

# Configuration de l'application Flask
app = Flask(__name__,
    static_folder='static',  # Dossier pour les fichiers statiques
    static_url_path='/static',  # Les fichiers statiques seront servis depuis /static
    template_folder='templates'  # Dossier pour les templates
)

# Désactiver la mise en cache des fichiers statiques
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Configuration de sécurité
app.secret_key = secrets.token_hex(32)
app.config['SESSION_COOKIE_SECURE'] = False  # Désactivé pour HTTP
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Configuration des cookies
COOKIE_CONSENT_NAME = 'cookie_consent'
COOKIE_CONSENT_MAX_AGE = 2 * 365 * 24 * 60 * 60  # 2 ans en secondes

# Chemins des fichiers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Fonction pour lire les identifiants depuis le fichier de configuration
def load_admin_credentials():
    config_file = os.path.join(BASE_DIR, 'admin_config_generated.txt')
    admin_username = '1EFcaNY2uOM'  # Valeur par défaut
    admin_password = '6Wi2zOievxh4iUexuT3gvg'  # Valeur par défaut
    
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('ADMIN_USERNAME='):
                        admin_username = line.split('=', 1)[1]
                    elif line.startswith('ADMIN_PASSWORD='):
                        admin_password = line.split('=', 1)[1]
        except Exception as e:
            print(f"Erreur lors de la lecture du fichier de configuration: {e}")
    
    return admin_username, admin_password

# Identifiants d'administration (hardcodés pour le débogage)
ADMIN_USERNAME = '1EFcaNY2uOM'
ADMIN_PASSWORD = '6Wi2zOievxh4iUexuT3gvg'
TAUX_FILE = os.path.join(BASE_DIR, 'taux.json')

# Charger les taux actuels
def load_taux():
    if os.path.exists(TAUX_FILE):
        with open(TAUX_FILE, 'r') as f:
            try:
                data = json.load(f)
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
            except (json.JSONDecodeError, AttributeError):
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
    with open(TAUX_FILE, 'w') as f:
        json.dump({
            'taux_cad_gnf': taux_cad_gnf,
            'taux_xof_gnf': taux_xof_gnf,
            'frais_canada_guinee': frais_data.get('frais_canada_guinee', 3.0),
            'frais_canada_senegal': frais_data.get('frais_canada_senegal', 3.0),
            'frais_guinee_canada': frais_data.get('frais_guinee_canada', 3.0),
            'frais_guinee_senegal': frais_data.get('frais_guinee_senegal', 3.0),
            'frais_senegal_canada': frais_data.get('frais_senegal_canada', 3.0),
            'frais_senegal_guinee': frais_data.get('frais_senegal_guinee', 3.0)
        }, f, indent=4)

# Décorateur pour vérifier si l'utilisateur est connecté
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Route pour la page d'accueil
@app.route('/')
@app.route('/index.html')
def home():
    taux = load_taux()
    return render_template('index.html', 
                         taux_cad_gnf=taux['taux_cad_gnf'],
                         taux_xof_gnf=taux['taux_xof_gnf'])

# Route pour obtenir les taux actuels
@app.route('/get_taux')
def get_taux():
    return jsonify(load_taux())

# Route pour obtenir les frais par destination
@app.route('/get_frais')
def get_frais():
    taux = load_taux()
    return jsonify({
        'frais_canada_guinee': taux['frais_canada_guinee'],
        'frais_canada_senegal': taux['frais_canada_senegal'],
        'frais_guinee_canada': taux['frais_guinee_canada'],
        'frais_guinee_senegal': taux['frais_guinee_senegal'],
        'frais_senegal_canada': taux['frais_senegal_canada'],
        'frais_senegal_guinee': taux['frais_senegal_guinee']
    })

# Route pour la page de connexion
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('admin'))
        else:
            error = 'Identifiants invalides. Veuillez réessayer.'
    # Utiliser render_template pour pouvoir passer l'erreur
    return render_template('login.html', error=error)

# Route pour la page d'administration (protégée)
@app.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
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

# Route pour la déconnexion
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

# Route pour mettre à jour le taux (protégée)
@app.route('/update_taux', methods=['POST'])
@login_required
def update_taux():
    if request.method == 'POST':
        try:
            nouveau_taux_cad = float(request.form['nouveau-taux-cad'])
            
            # Charger le taux XOF actuel pour le garder inchangé
            taux_actuel = load_taux()
            taux_xof_actuel = taux_actuel['taux_xof_gnf']
            
            # Récupérer les frais
            frais_data = {
                'frais_canada_guinee': float(request.form.get('frais-canada-guinee', 3.0)),
                'frais_canada_senegal': float(request.form.get('frais-canada-senegal', 3.0)),
                'frais_guinee_canada': float(request.form.get('frais-guinee-canada', 3.0)),
                'frais_guinee_senegal': float(request.form.get('frais-guinee-senegal', 3.0)),
                'frais_senegal_canada': float(request.form.get('frais-senegal-canada', 3.0)),
                'frais_senegal_guinee': float(request.form.get('frais-senegal-guinee', 3.0))
            }
            
            if nouveau_taux_cad > 0:
                save_taux(nouveau_taux_cad, taux_xof_actuel, frais_data)
                return jsonify({
                    'success': True,
                    'new_taux_cad': nouveau_taux_cad,
                    'new_taux_xof': taux_xof_actuel,
                    'frais_data': frais_data
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Le taux doit être supérieur à 0'
                })
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Valeur invalide'
            })

@app.route('/update_taux_simple', methods=['POST'])
@login_required
def update_taux_simple():
    if request.method == 'POST':
        try:
            destination = request.form['destination']
            nouveau_taux = float(request.form['nouveau-taux'])
            
            if nouveau_taux <= 0:
                return jsonify({
                    'success': False,
                    'error': 'Le taux doit être supérieur à 0'
                })
            
            # Charger les taux actuels
            taux_actuel = load_taux()
            
            if destination == 'canada-guinee':
                # Mettre à jour le taux CAD/GNF
                save_taux(nouveau_taux, taux_actuel['taux_xof_gnf'], {
                    'frais_canada_guinee': taux_actuel['frais_canada_guinee'],
                    'frais_canada_senegal': taux_actuel['frais_canada_senegal'],
                    'frais_guinee_canada': taux_actuel['frais_guinee_canada'],
                    'frais_guinee_senegal': taux_actuel['frais_guinee_senegal'],
                    'frais_senegal_canada': taux_actuel['frais_senegal_canada'],
                    'frais_senegal_guinee': taux_actuel['frais_senegal_guinee']
                })
            elif destination == 'senegal-guinee':
                # Mettre à jour le taux XOF/GNF (inversé)
                save_taux(taux_actuel['taux_cad_gnf'], 1/nouveau_taux, {
                    'frais_canada_guinee': taux_actuel['frais_canada_guinee'],
                    'frais_canada_senegal': taux_actuel['frais_canada_senegal'],
                    'frais_guinee_canada': taux_actuel['frais_guinee_canada'],
                    'frais_guinee_senegal': taux_actuel['frais_guinee_senegal'],
                    'frais_senegal_canada': taux_actuel['frais_senegal_canada'],
                    'frais_senegal_guinee': taux_actuel['frais_senegal_guinee']
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Destination invalide'
                })
            
            return jsonify({
                'success': True,
                'message': f'Taux mis à jour pour {destination}'
            })
            
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Valeur invalide'
            })

@app.route('/update_frais_simple', methods=['POST'])
@login_required
def update_frais_simple():
    if request.method == 'POST':
        try:
            destination = request.form['destination']
            nouveau_frais = float(request.form['nouveau-frais'])
            
            if nouveau_frais < 0 or nouveau_frais > 100:
                return jsonify({
                    'success': False,
                    'error': 'Le pourcentage doit être entre 0 et 100'
                })
            
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
            if destination == 'canada-guinee':
                frais_data['frais_canada_guinee'] = nouveau_frais
            elif destination == 'canada-senegal':
                frais_data['frais_canada_senegal'] = nouveau_frais
            elif destination == 'guinee-canada':
                frais_data['frais_guinee_canada'] = nouveau_frais
            elif destination == 'guinee-senegal':
                frais_data['frais_guinee_senegal'] = nouveau_frais
            elif destination == 'senegal-canada':
                frais_data['frais_senegal_canada'] = nouveau_frais
            elif destination == 'senegal-guinee':
                frais_data['frais_senegal_guinee'] = nouveau_frais
            else:
                return jsonify({
                    'success': False,
                    'error': 'Destination invalide'
                })
            
            # Sauvegarder avec les nouveaux frais
            save_taux(taux_actuel['taux_cad_gnf'], taux_actuel['taux_xof_gnf'], frais_data)
            
            return jsonify({
                'success': True,
                'message': f'Frais mis à jour pour {destination}'
            })
            
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Valeur invalide'
            })

# Route pour servir les images
@app.route('/images/<path:filename>')
def serve_images(filename):
    try:
        return send_from_directory(os.path.join(BASE_DIR, 'images'), filename)
    except FileNotFoundError:
        return "", 404

# Route pour servir les fichiers HTML statiques
@app.route('/<path:filename>')
def serve_html(filename):
    if filename.endswith('.html') and not filename.startswith('static/'):
        try:
            return send_from_directory(BASE_DIR, filename)
        except FileNotFoundError:
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
        # Récupérer les données du formulaire
        data = {
            'pays_depart': request.form.get('paysDepart'),
            'pays_destination': request.form.get('paysDestination'),
            'montant': request.form.get('montant'),
            'montant_recu': request.form.get('montantRecu'),
            'frais': request.form.get('frais'),
            'total': request.form.get('total'),
            'nom': request.form.get('nom'),
            'telephone': request.form.get('telephone'),
            'email': request.form.get('email'),
            'beneficiaire_nom': request.form.get('beneficiaire-nom'),
            'beneficiaire_telephone': request.form.get('beneficiaire-telephone'),
            'beneficiaire_adresse': request.form.get('beneficiaire-adresse'),
            'message': request.form.get('message')
        }
        
        # Ici, vous pouvez ajouter le code pour sauvegarder les données dans une base de données
        # ou envoyer un email de confirmation
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/set-cookie-consent', methods=['POST'])
def set_cookie_consent():
    try:
        consent = request.json.get('consent')
        response = make_response(jsonify({'success': True}))
        
        if consent == 'accepted':
            response.set_cookie(
                COOKIE_CONSENT_NAME,
                'accepted',
                max_age=COOKIE_CONSENT_MAX_AGE,
                secure=False,  # Désactivé pour HTTP
                httponly=False,  # Permettre à JavaScript de lire le cookie
                samesite='Lax'
            )
        else:
            response.set_cookie(
                COOKIE_CONSENT_NAME,
                'rejected',
                max_age=COOKIE_CONSENT_MAX_AGE,
                secure=False,  # Désactivé pour HTTP
                httponly=False,  # Permettre à JavaScript de lire le cookie
                samesite='Lax'
            )
        
        return response
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 