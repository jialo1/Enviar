# Configuration Gunicorn pour la production - Version améliorée
bind = "0.0.0.0:8000"
workers = 2  # Réduit pour éviter la surcharge
worker_class = "sync"
worker_connections = 1000
timeout = 60  # Augmenté pour éviter les timeouts
keepalive = 5  # Augmenté
max_requests = 500  # Réduit pour éviter les fuites mémoire
max_requests_jitter = 50
preload_app = True
reload = False

# Nouvelles options pour la stabilité
worker_tmp_dir = "/dev/shm"  # Utilise la RAM pour les fichiers temporaires
max_requests_jitter = 100
graceful_timeout = 30
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Logging
accesslog = "-"  # Log vers stdout
errorlog = "-"   # Log vers stderr
loglevel = "info"

# Sécurité
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Performance
worker_tmp_dir = "/dev/shm"
forwarded_allow_ips = "*" 