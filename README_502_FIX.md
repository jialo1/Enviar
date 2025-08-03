# 🔧 Résolution des erreurs 502 Bad Gateway

Ce guide vous aide à diagnostiquer et résoudre les erreurs 502 Bad Gateway sur votre application Enviar.

## 🚨 Problème

Votre site affiche une erreur **502 Bad Gateway** après un certain temps de fonctionnement.

## 🔍 Diagnostic

### 1. Diagnostic automatique

Exécutez le script de diagnostic pour identifier le problème :

```bash
sudo python3 diagnostic_502.py
```

Ce script vérifiera :
- ✅ Statut du service systemd
- ✅ Processus Gunicorn
- ✅ Port 8000 en écoute
- ✅ Configuration nginx
- ✅ Logs d'erreur
- ✅ Ressources système

### 2. Vérification manuelle

```bash
# Vérifier le statut du service
sudo systemctl status enviar.service

# Vérifier les processus Gunicorn
ps aux | grep gunicorn

# Vérifier le port 8000
netstat -tlnp | grep :8000

# Vérifier les logs
sudo journalctl -u enviar.service -f
```

## 🛠️ Solutions

### Solution rapide

Exécutez le script de résolution automatique :

```bash
sudo ./fix_502.sh
```

### Solution manuelle

1. **Redémarrer le service** :
```bash
sudo systemctl restart enviar.service
```

2. **Recharger nginx** :
```bash
sudo systemctl reload nginx
```

3. **Vérifier la configuration** :
```bash
sudo nginx -t
```

### Déploiement amélioré

Pour une solution complète avec surveillance automatique :

```bash
sudo ./deploy_improved.sh
```

## 🔧 Améliorations apportées

### 1. Configuration Gunicorn optimisée

- **Workers réduits** : 4 → 2 (évite la surcharge)
- **Timeout augmenté** : 30s → 60s
- **Max requests réduit** : 1000 → 500 (évite les fuites mémoire)
- **Logging amélioré** : logs vers stdout/stderr

### 2. Surveillance automatique

Le service `enviar-monitor.service` surveille automatiquement :
- ✅ Statut du service principal
- ✅ Réponse de l'application
- ✅ Ressources système
- ✅ Redémarrage automatique en cas de problème

### 3. Scripts de diagnostic

- `diagnostic_502.py` : Diagnostic complet
- `fix_502.sh` : Résolution rapide
- `deploy_improved.sh` : Déploiement complet

## 📊 Monitoring

### Activer la surveillance automatique

```bash
# Activer le service de monitoring
sudo systemctl enable enviar-monitor.service
sudo systemctl start enviar-monitor.service

# Vérifier le statut
sudo systemctl status enviar-monitor.service

# Voir les logs
sudo tail -f /var/log/enviar_monitor.log
```

### Vérification continue

```bash
# Voir les logs en temps réel
sudo journalctl -u enviar.service -f

# Vérifier les ressources
htop
df -h
free -h
```

## 🚀 Commandes utiles

```bash
# Redémarrer tous les services
sudo systemctl restart enviar.service
sudo systemctl reload nginx

# Vérifier le statut
sudo systemctl status enviar.service
sudo systemctl status nginx

# Voir les logs
sudo journalctl -u enviar.service --no-pager -n 50
sudo tail -n 50 /var/log/nginx/error.log

# Test de l'application
curl -I http://localhost:8000/
curl -I http://localhost/

# Diagnostic complet
sudo python3 diagnostic_502.py
```

## 🔍 Causes courantes des erreurs 502

1. **Service Gunicorn arrêté** : Le processus Flask s'est arrêté
2. **Timeout** : L'application prend trop de temps à répondre
3. **Mémoire insuffisante** : Le serveur manque de RAM
4. **Espace disque plein** : Plus d'espace pour les logs/temp
5. **Configuration nginx** : Problème de proxy_pass
6. **Dépendances manquantes** : Modules Python non installés

## 📈 Prévention

### 1. Surveillance automatique

Le service de monitoring redémarre automatiquement l'application en cas de problème.

### 2. Logs rotatifs

```bash
# Configurer la rotation des logs
sudo logrotate -f /etc/logrotate.d/enviar
```

### 3. Monitoring des ressources

```bash
# Installer un outil de monitoring
sudo apt install htop iotop
```

## 🆘 En cas d'urgence

Si rien ne fonctionne :

1. **Redémarrer complètement** :
```bash
sudo reboot
```

2. **Vérifier après redémarrage** :
```bash
sudo systemctl status enviar.service
curl -I http://localhost:8000/
```

3. **Contacter le support** avec les logs :
```bash
sudo journalctl -u enviar.service --no-pager -n 100 > logs.txt
```

## 📞 Support

En cas de problème persistant, fournissez :
- Sortie de `sudo python3 diagnostic_502.py`
- Logs : `sudo journalctl -u enviar.service --no-pager -n 100`
- Configuration : `/etc/nginx/sites-available/enviar`

---

**Note** : Ces améliorations rendent votre application plus robuste et résistante aux erreurs 502. La surveillance automatique garantit une disponibilité maximale. 