# 🔧 Guide de Résolution des Problèmes

## ✅ Résolution des Erreurs Initiales

### Problème : Ports déjà utilisés

**Erreur :**

```
Error: failed to bind host port... address already in use
```

**Solution :** Les ports par défaut (3000, 8000, 5432, etc.) étaient occupés.

**Ports modifiés :**

- Frontend: `3000` → `3001` (dans le futur)
- Backend: `8000` → `8001` → `8010` (version actuelle)
- PostgreSQL: `5432` → `5433`
- Redis: `6379` → `6380`
- Elasticsearch: `9200` → `9201`

### Problème : Dépendances Python incompatibles

**Erreur :**

```
ERROR: Could not find a version that satisfies the requirement cryptography==41.0.8
```

**Solution :** Versions des dépendances trop spécifiques.

**Correction :** Utilisation de versions flexibles (`>=`) dans `requirements-minimal.txt`

### Problème : Docker Compose version obsolète

**Erreur :**

```
WARN: the attribute `version` is obsolete
```

**Solution :** Suppression de `version: '3.8'` du docker-compose.yml

## 🚀 Comment Démarrer la Plateforme

### Version Minimale (Recommandée pour les tests)

```bash
# Démarrage rapide avec backend + PostgreSQL seulement
./scripts/start-minimal.sh
```

**Accès :**

- Backend API: <http://localhost:8010>
- API Documentation: <http://localhost:8010/docs>
- PostgreSQL: localhost:5433

### Version Complète (Tous les services)

```bash
# Démarrage complet avec tous les services
./scripts/start.sh
```

**Note :** La version complète prend plus de temps à démarrer car elle inclut :

- Frontend React
- Elasticsearch
- Redis
- Nginx (en production)

## 🔍 Vérifications de Santé

### Tester l'API Backend

```bash
# Test de santé
curl http://localhost:8010/health

# Réponse attendue
{"status":"healthy","version":"1.0.0"}
```

### Vérifier les Conteneurs

```bash
# Version minimale
docker-compose -f docker-compose.minimal.yml ps

# Version complète
docker-compose ps
```

### Consulter les Logs

```bash
# Version minimale
docker-compose -f docker-compose.minimal.yml logs -f

# Version complète - tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
```

## 🚫 Arrêter les Services

### Version Minimale

```bash
docker-compose -f docker-compose.minimal.yml down

# Avec suppression des volumes
docker-compose -f docker-compose.minimal.yml down -v
```

### Version Complète

```bash
docker-compose down

# Avec suppression des volumes
docker-compose down -v
```

## 🐛 Problèmes Courants et Solutions

### 1. Base de Données inaccessible

**Symptôme :** Backend plante au démarrage

**Solution :**

```bash
# Vérifier que PostgreSQL fonctionne
docker-compose -f docker-compose.minimal.yml logs postgres

# Redémarrer la base de données
docker-compose -f docker-compose.minimal.yml restart postgres
```

### 2. Port déjà utilisé

**Symptôme :**

```
Error: address already in use
```

**Solution :**

```bash
# Identifier le processus utilisant le port
lsof -i :8010  # Remplacer par le port problématique

# Ou trouver un port libre
netstat -tlnp | grep :801  # Vérifier les ports 801x
```

### 3. Images Docker corrompues

**Symptôme :** Erreurs de build étranges

**Solution :**

```bash
# Nettoyer les images et recommencer
docker system prune -f
docker-compose -f docker-compose.minimal.yml build --no-cache
```

### 4. Volumes persistants problématiques

**Symptôme :** Changements de schéma DB non pris en compte

**Solution :**

```bash
# Supprimer les volumes et recommencer
docker-compose -f docker-compose.minimal.yml down -v
docker volume prune -f
docker-compose -f docker-compose.minimal.yml up -d
```

### 5. Processus d'arrière-plan qui interfèrent

**Symptôme :** Ports occupés par des processus unknowns

**Solution :**

```bash
# Identifier les processus
ps aux | grep python
ps aux | grep node

# Tuer si nécessaire
sudo pkill -f python
sudo pkill -f node
```

## 📊 Monitoring et Debug

### Métriques des Conteneurs

```bash
# Utilisation des ressources
docker stats

# Espace disque
docker system df
```

### Debugging Backend

```bash
# Se connecter au conteneur backend
docker-compose -f docker-compose.minimal.yml exec backend bash

# Installer des outils de debug dans le conteneur
docker-compose -f docker-compose.minimal.yml exec backend pip install ipdb
```

### Debugging Base de Données

```bash
# Se connecter à PostgreSQL
docker-compose -f docker-compose.minimal.yml exec postgres psql -U wazuh_user -d wazuh_platform

# Lister les tables
\dt

# Quitter
\q
```

## 🔄 Redémarrage Complet

Si tout va mal, redémarrage complet :

```bash
# Arrêt complet
docker-compose down -v
docker-compose -f docker-compose.minimal.yml down -v

# Nettoyage
docker system prune -f
docker volume prune -f

# Redémarrage
./scripts/start-minimal.sh
```

## 📞 Support

Si les problèmes persistent :

1. **Collecter les informations :**

   ```bash
   docker-compose -f docker-compose.minimal.yml logs > logs.txt
   docker system df > system-info.txt
   ```

2. **Vérifier l'environnement :**
   - OS et version
   - Version Docker
   - Espace disque disponible

3. **Tests de connectivité :**

   ```bash
   curl -v http://localhost:8010/health
   telnet localhost 5433
   ```
