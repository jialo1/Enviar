from flask import Flask, render_template, send_from_directory, request, redirect, url_for, session, jsonify
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

# Configuration de sécurité
app.secret_key = secrets.token_hex(32)
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Identifiants d'administration
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'password123')

# Chemins des fichiers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TAUX_FILE = os.path.join(BASE_DIR, 'taux.json')

# Charger le taux actuel
def load_taux():
    if os.path.exists(TAUX_FILE):
        with open(TAUX_FILE, 'r') as f:
            try:
                data = json.load(f)
                return data.get('taux_cad_gnf', 6500)
            except (json.JSONDecodeError, AttributeError):
                return 6500
    return 6500

# Sauvegarder le nouveau taux
def save_taux(new_taux):
    with open(TAUX_FILE, 'w') as f:
        json.dump({'taux_cad_gnf': new_taux}, f, indent=4)

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
    return render_template('index.html', taux_cad_gnf=taux)

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
    return render_template('admin.html', taux_cad_gnf=taux)

# Route pour la déconnexion
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))

# Route pour mettre à jour le taux (protégée)
@app.route('/update_taux', methods=['POST'])
@login_required
def update_taux():
    if request.method == 'POST':
        try:
            nouveau_taux = float(request.form['nouveau-taux'])
            if nouveau_taux > 0:
                save_taux(nouveau_taux)
                return redirect(url_for('admin'))
            else:
                return redirect(url_for('admin'))
        except ValueError:
            return redirect(url_for('admin'))

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

@app.route('/submit-transfer', methods=['POST'])
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 