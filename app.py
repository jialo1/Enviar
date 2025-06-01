from flask import Flask, render_template, send_from_directory, request, redirect, url_for, session
import json
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = 'super secret key' # Remplacez ceci par une vraie clé secrète complexe

# Identifiants d'administration (EXEMPLE - À NE PAS UTILISER EN PRODUCTION)
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'password123' # À changer !

# Chemin vers le dossier des fichiers statiques (votre dossier actuel)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, '') # Serve from the root directory

TAUX_FILE = os.path.join(BASE_DIR, 'taux.json')

# Charger le taux actuel
def load_taux():
    if os.path.exists(TAUX_FILE):
        with open(TAUX_FILE, 'r') as f:
            try:
                data = json.load(f)
                return data.get('taux_gnf_xof', 0.07288)
            except (json.JSONDecodeError, AttributeError):
                return 0.07288
    return 0.07288

# Sauvegarder le nouveau taux
def save_taux(new_taux):
    with open(TAUX_FILE, 'w') as f:
        json.dump({'taux_gnf_xof': new_taux}, f, indent=4)

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
def index():
    taux = load_taux()
    return render_template('index.html', taux_gnf_xof=taux)

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
    return render_template('admin.html', taux_gnf_xof=taux)

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

# Route pour servir les fichiers statiques (CSS, JS, images, etc.)
@app.route('/<path:filename>')
def static_files(filename):
    try:
        return send_from_directory(STATIC_FOLDER, filename)
    except FileNotFoundError:
        return "", 404

if __name__ == '__main__':
    # Changer le port si nécessaire (ici, 8000 comme avant)
    # debug=True permet le rechargement automatique pendant le développement
    app.run(debug=True, port=8000, host='0.0.0.0') 