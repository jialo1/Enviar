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

def test_login(username, password):
    stored_username, stored_password = load_admin_credentials()
    
    print(f"Identifiants saisis : {username} / {password}")
    print(f"Identifiants stockés : {stored_username} / {stored_password}")
    
    if username == stored_username and password == stored_password:
        print("✅ Connexion réussie !")
        return True
    else:
        print("❌ Connexion échouée !")
        if username != stored_username:
            print(f"  - Nom d'utilisateur incorrect")
        if password != stored_password:
            print(f"  - Mot de passe incorrect")
        return False

if __name__ == "__main__":
    print("=== Test des identifiants principaux ===")
    test_login("1EFcaNY2uOM", "6Wi2zOievxh4iUexuT3gvg")
    
    print("\n=== Test des identifiants de sauvegarde ===")
    test_login("backup_5alb3Q", "Z_vqmw7z3AlPHGYT")
    
    print("\n=== Test avec des identifiants incorrects ===")
    test_login("admin", "password123") 