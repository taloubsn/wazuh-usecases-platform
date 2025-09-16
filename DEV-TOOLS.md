# Outils de Développement

## 🚀 Script dev-push.py

Script Python pour automatiser les commits et push Git pendant le développement.

### ✨ Fonctionnalités

- **Mode interactif** : Guide étape par étape pour committer
- **Mode rapide** : Commit et push avec message en une seule commande
- **Affichage du statut** : Vue d'ensemble des changements
- **Messages enrichis** : Ajoute automatiquement timestamp et signature
- **Sécurisé** : Non-tracké par Git (fichier de développement local)

### 📖 Utilisation

#### Mode interactif (recommandé pour débutants)
```bash
python3 dev-push.py
```
Le script vous guidera à travers chaque étape :
1. Affichage du statut actuel
2. Confirmation pour ajouter les changements
3. Demande du message de commit
4. Confirmation pour pusher vers GitHub

#### Mode rapide (pour développement rapide)
```bash
python3 dev-push.py -m "Votre message de commit"
```
Effectue automatiquement : `git add .` + `git commit` + `git push`

#### Afficher seulement le statut
```bash
python3 dev-push.py --status
```

#### Aide
```bash
python3 dev-push.py --help
```

### 💡 Exemples d'utilisation

```bash
# Développement d'une nouvelle fonctionnalité
python3 dev-push.py -m "✨ Add user authentication system"

# Correction de bug
python3 dev-push.py -m "🐛 Fix login validation error"

# Mise à jour de documentation
python3 dev-push.py -m "📚 Update API documentation"

# Refactoring
python3 dev-push.py -m "♻️ Refactor database connection logic"

# Amélioration de performance
python3 dev-push.py -m "⚡ Optimize query performance"
```

### 🎨 Emojis recommandés pour les commits

- ✨ `:sparkles:` - Nouvelle fonctionnalité
- 🐛 `:bug:` - Correction de bug
- 📚 `:books:` - Documentation
- 🎨 `:art:` - Amélioration du code/structure
- ⚡ `:zap:` - Performance
- 🔒 `:lock:` - Sécurité
- ♻️ `:recycle:` - Refactoring
- 🔧 `:wrench:` - Configuration
- 🚀 `:rocket:` - Déploiement
- 🧪 `:test_tube:` - Tests

### ⚠️ Important

- Ce script est **local uniquement** et ne sera pas committé
- Il ajoute automatiquement **TOUS** les changements (`git add .`)
- Il push directement vers la branche courante
- Les messages de commit sont enrichis automatiquement

### 🛡️ Sécurité

Le script est configuré dans `.gitignore` avec les patterns :
- `dev-push.py`
- `dev-*.py`
- `*-dev.py`

Cela garantit qu'aucun script de développement personnel ne sera jamais committé.

### 📝 Format des messages de commit générés

```
Votre message de commit

🕒 Committed: 2024-09-16 10:30:45
👨‍💻 Dev push via dev-push.py

🚀 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 🔧 Résolution de problèmes

Si le script ne fonctionne pas :

1. **Vérifiez que vous êtes dans le bon répertoire** :
   ```bash
   pwd  # Doit afficher le chemin vers votre projet
   ```

2. **Vérifiez que c'est un repo Git** :
   ```bash
   ls -la .git  # Le dossier .git doit exister
   ```

3. **Vérifiez les permissions** :
   ```bash
   chmod +x dev-push.py
   ```

4. **Test de connectivité GitHub** :
   ```bash
   git remote -v  # Vérifiez que origin pointe vers votre repo
   ```

Bon développement ! 🚀