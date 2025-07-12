# 🧪 Générateur d'Utilisateurs de Test

Utilitaire simple pour générer des utilisateurs de test avec des données sociales variées en mode développement.

## 🚀 Installation et Utilisation

### Prérequis
- Node.js et npm installés
- Backend en mode développement
- TypeScript configuré

### Scripts Disponibles

#### 1. Test de Génération (Sans API)
```bash
npm run test-generation
```
Teste la logique de génération sans nécessiter le serveur backend.

#### 2. Génération via API (Recommandé)
```bash
# Génération par défaut (10 utilisateurs)
npm run generate-users-api

# Génération personnalisée
npm run generate-users-api 15
npm run generate-users-api 5 http://localhost:3000
```

#### 3. Génération Directe en DB
```bash
# Génération par défaut (10 utilisateurs)
npm run generate-users

# Génération personnalisée
npm run generate-users 20
```

#### 4. Nettoyage des Utilisateurs de Test
```bash
# Nettoyage avec confirmation
npm run cleanup-users

# Nettoyage automatique (sans confirmation)
npm run cleanup-users -- --force
```

#### 5. Script Bash Intégré
```bash
# Aide
./scripts/dev-users.sh help

# Génération
./scripts/dev-users.sh generate 15
./scripts/dev-users.sh generate-db 5

# Statut
./scripts/dev-users.sh status

# Nettoyage
./scripts/dev-users.sh cleanup --force
```

## 📊 Types de Données Générées

### Utilisateurs
- **Adresses EVM** : Générées aléatoirement (format 0x + 40 caractères hexadécimaux)
- **Rôles** : 85% utilisateurs, 15% administrateurs de club
- **Distribution réaliste** des comptes sociaux

### Réseaux Sociaux

#### TikTok (80% des utilisateurs)
```
fan.football.bcn, real.madrid.lover, city.supporter, 
psg.fanatic, juventus.ultra, bayern.munich.fan,
liverpool.kop, arsenal.gunner, chelsea.blue...
```

#### Twitter (70% des utilisateurs)
```
footballfan2024, soccer_enthusiast, goals_and_glory,
stadium_vibes, kickoff_king, match_day_magic...
```

#### YouTube (40% des utilisateurs)
```
UCfootball-highlights2024, UCsoccer-analysis-pro,
UCgoals-compilation, UCstadium-atmosphere...
```

#### Telegram (60% des utilisateurs)
```
football_fanatic_2024, soccer_lover_official,
goal_hunter_pro, stadium_atmosphere...
```

## 🔧 Fonctionnalités

### ✅ Avantages
- **Données réalistes** : Handles de fans de football authentiques
- **Adresses EVM valides** : Format correct pour les tests blockchain
- **Distribution variée** : Chaque utilisateur a une combinaison différente de réseaux sociaux
- **Sécurité** : Protection contre l'exécution en production
- **Flexibilité** : Multiple méthodes de génération (API/DB direct)
- **Nettoyage intelligent** : Détection automatique des utilisateurs de test

### 🛡️ Sécurités Intégrées
- **Limitation environnement** : Fonctionne uniquement en mode développement
- **Limites de quantité** : Maximum 50-100 utilisateurs par exécution
- **Validation des données** : Vérification des formats EVM et sociaux
- **Gestion d'erreurs** : Logs détaillés et récupération automatique

## 📈 Exemple de Sortie

```
🚀 Génération de 5 utilisateurs de test via l'API...
🌐 URL de l'API: http://localhost:3001

👤 Création de l'utilisateur 1/5:
   - Adresse EVM: 0xa1b2c3d4e5f6789012345678901234567890abcd
   - Rôle: user
   - TikTok: @fan.football.bcn
   - Twitter: @footballfan2024
   - YouTube: UCfootball-highlights2024
   ✅ Utilisateur créé avec l'ID: abc123-def4-5678-90ab-cdef12345678

📊 Résumé de la génération:
   ✅ Utilisateurs créés avec succès: 5
   ❌ Erreurs rencontrées: 0

🎉 Script terminé ! 5 utilisateurs de test ont été créés.
```

## 🔍 Dépannage

### Problèmes Courants

#### API Non Accessible
```
❌ L'API n'est pas accessible !
   Assurez-vous que le serveur backend est démarré.
```
**Solution** : Démarrez le backend avec `npm run dev`

#### Erreur de Permission/Environnement
```
❌ Ce script ne peut être exécuté qu'en mode développement !
```
**Solution** : Définissez `NODE_ENV=development`

#### Erreurs de Validation
```
❌ Erreur lors de la création: HTTP 400: Validation error
```
**Solution** : Vérifiez les formats des données générées

### Debug et Logs
Tous les scripts fournissent des logs détaillés pour faciliter le debug :
- ✅ Succès avec détails de création
- ❌ Erreurs avec messages explicites  
- 📊 Statistiques finales
- 💡 Conseils d'utilisation

## 🔗 Intégration avec l'Application

### Tests E2E
```bash
# Setup des données de test
npm run generate-users-api 20

# Exécution des tests
npm run test:e2e

# Nettoyage
npm run cleanup-users -- --force
```

### Développement Frontend
Les utilisateurs générés peuvent être utilisés pour :
- Tester les interfaces de gestion d'utilisateurs
- Valider l'affichage des profils sociaux
- Simuler différents rôles (user/admin)
- Tester les fonctionnalités de leaderboard

### API Testing
Endpoints testables avec les données générées :
```
GET /api/users                    # Liste tous les utilisateurs
GET /api/users/:id                # Profil utilisateur specific
GET /api/users/address/:address   # Recherche par adresse EVM
PUT /api/users/:id/role           # Mise à jour du rôle
DELETE /api/users/:id             # Suppression
```

## 📝 Contribution

### Ajout de Nouveaux Patterns
Pour ajouter de nouveaux types de comptes sociaux :

1. **Modifiez les données de test** dans les scripts
2. **Ajoutez les patterns de détection** pour le nettoyage
3. **Mettez à jour la documentation**

### Amélioration des Scripts
Les contributions sont bienvenues pour :
- Nouveaux réseaux sociaux (Instagram, Discord, etc.)
- Amélioration des patterns de génération
- Optimisation des performances
- Tests automatisés supplémentaires

---

**💡 Conseil** : Utilisez `./scripts/dev-users.sh help` pour un accès rapide à toutes les fonctionnalités.