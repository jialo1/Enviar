#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

def load_admin_credentials():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
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

if __name__ == "__main__":
    username, password = load_admin_credentials()
    print(f"Nom d'utilisateur: {username}")
    print(f"Mot de passe: {password}")
    
    # Test avec les identifiants de sauvegarde aussi
    print("\n--- Identifiants de sauvegarde ---")
    print("Nom d'utilisateur: backup_5alb3Q")
    print("Mot de passe: Z_vqmw7z3AlPHGYT") 