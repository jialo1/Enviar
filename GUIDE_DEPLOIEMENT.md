# 🚀 Guide de Déploiement Complet - Enviar

## 📋 Vue d'ensemble

Ce guide vous accompagne pour déployer votre application Enviar sécurisée en production.

## 🔧 ÉTAPE 1 : Déploiement Git (Terminé automatiquement)

✅ **Scripts créés :**
- `deploy_git.ps1` (PowerShell)
- `deploy_git.bat` (Windows Batch)

✅ **Actions effectuées :**
- Commit avec toutes les corrections de sécurité
- Push vers GitHub
- Code sécurisé disponible en ligne

## 🌐 ÉTAPE 2 : Choisir votre méthode de déploiement

### **Option A : Serveur Linux avec SSH (Recommandé)**
**Script :** `deploy_from_github.sh`
**Avantages :** Déploiement automatique, gestion des services systemd
**Prérequis :** Accès SSH root, serveur Linux

### **Option B : Déploiement local sécurisé**
**Script :** `deploy_safe.sh`
**Avantages :** Transfert direct, contrôle total
**Prérequis :** Accès SSH au serveur

### **Option C : Hébergement Hostinger**
**Script :** `deploy_hostinger.ps1`
**Avantages :** Interface graphique, pas de SSH requis
**Prérequis :** Compte Hostinger

## 🚀 ÉTAPE 3 : Déploiement sur le serveur

### **Si Option A (Linux + GitHub) :**

1. **Se connecter en SSH au serveur :**
```bash
ssh root@VOTRE_IP_SERVEUR
```

2. **Exécuter le déploiement automatique :**
```bash
cd /opt
wget https://raw.githubusercontent.com/jialo1/Enviar/master/deploy_from_github.sh
chmod +x deploy_from_github.sh
sudo ./deploy_from_github.sh
```

### **Si Option B (Linux + Local) :**

1. **Se connecter en SSH au serveur :**
```bash
ssh root@VOTRE_IP_SERVEUR
```

2. **Exécuter le déploiement local :**
```bash
cd /opt
wget https://raw.githubusercontent.com/jialo1/Enviar/master/deploy_safe.sh
chmod +x deploy_safe.sh
sudo ./deploy_safe.sh
```

### **Si Option C (Hostinger) :**

1. **Exécuter le script PowerShell localement :**
```powershell
.\deploy_hostinger.ps1
```

2. **Suivre les instructions affichées**

## ⚙️ ÉTAPE 4 : Configuration de production

### **Créer le fichier `.env` sur le serveur :**

```bash
# Configuration de production
SECRET_KEY=votre-cle-secrete-ultra-securisee-ici
SESSION_COOKIE_SECURE=True
DEBUG=False
ADMIN_USERNAME=votre-username-securise
ADMIN_PASSWORD=votre-password-securise
HOST=0.0.0.0
PORT=8000
```

### **Installer les dépendances :**
```bash
cd /opt/enviar
source .venv/bin/activate
pip install -r requirements.txt
```

## 🔍 ÉTAPE 5 : Vérification finale

### **Tester l'application :**
```bash
# Vérifier que le service fonctionne
systemctl status enviar.service

# Tester l'application
curl -s http://localhost:8000

# Vérifier les logs
journalctl -u enviar.service -f
```

### **Vérifier nginx (si configuré) :**
```bash
# Test de la configuration
nginx -t

# Recharger nginx
systemctl reload nginx

# Tester via nginx
curl -s http://localhost
```

## 🛠️ Scripts de déploiement disponibles

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `deploy_from_github.sh` | Déploiement automatique depuis GitHub | Serveur Linux avec SSH |
| `deploy_safe.sh` | Déploiement local sécurisé | Serveur Linux avec SSH |
| `deploy_hostinger.ps1` | Instructions Hostinger | Hébergement web |
| `deploy_improved.sh` | Déploiement avec monitoring | Serveur Linux avancé |

## 🔧 Résolution des problèmes

### **Erreur 502 Bad Gateway :**
```bash
# Diagnostic automatique
sudo python3 diagnostic_502.py

# Résolution rapide
sudo ./fix_502.sh
```

### **Service ne démarre pas :**
```bash
# Vérifier les logs
journalctl -u enviar.service -f

# Redémarrer le service
sudo systemctl restart enviar.service
```

### **Problèmes de permissions :**
```bash
# Corriger les permissions
sudo chown -R root:root /opt/enviar
sudo chmod -R 755 /opt/enviar
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `journalctl -u enviar.service -f`
2. Exécutez le diagnostic : `python3 diagnostic_502.py`
3. Consultez ce guide de déploiement

## 🎯 Prochaines étapes

1. **Choisissez votre méthode de déploiement**
2. **Exécutez le script approprié**
3. **Configurez les variables d'environnement**
4. **Testez l'application**
5. **Configurez votre domaine (si applicable)**

---

**🚀 Votre application Enviar est maintenant prête pour la production !**
