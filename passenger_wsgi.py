import sys
import os

# Ajouter le répertoire du projet au chemin Python
sys.path.insert(0, os.path.dirname(__file__))

# Importer l'application Flask
from app import app

# Créer l'application pour Passenger
application = app 