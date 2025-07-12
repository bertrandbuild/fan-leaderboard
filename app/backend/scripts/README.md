# Scripts de Génération d'Utilisateurs de Test

Ce dossier contient des utilitaires pour générer et gérer des utilisateurs de test en mode développement.

## 📋 Scripts Disponibles

### 1. `generate-test-users.ts`
Génère des utilisateurs de test directement en base de données.

**Usage :**
```bash
npm run generate-users [nombre]
```

**Exemples :**
```bash
npm run generate-users        # Génère 10 utilisateurs par défaut
npm run generate-users 20     # Génère 20 utilisateurs
```

**Caractéristiques :**
- ✅ Accès direct à la base de données
- ✅ Plus rapide
- ⚠️ Nécessite NODE_ENV=development
- ⚠️ Moins sûr (bypass l'API)

### 2. `generate-users-via-api.ts` (Recommandé)
Génère des utilisateurs de test via l'API REST.

**Usage :**
```bash
npm run generate-users-api [nombre] [url_base]
```

**Exemples :**
```bash
npm run generate-users-api                                    # 10 utilisateurs, localhost:3001
npm run generate-users-api 15                                 # 15 utilisateurs, localhost:3001
npm run generate-users-api 5 http://localhost:3000            # 5 utilisateurs, port personnalisé
```

**Caractéristiques :**
- ✅ Utilise l'API publique
- ✅ Plus sûr (validation, middlewares)
- ✅ Peut cibler n'importe quel serveur
- ✅ Gestion des erreurs avancée

### 3. `cleanup-test-users.ts`
Nettoie automatiquement les utilisateurs de test.

**Usage :**
```bash
npm run cleanup-users [url_base] [--force]
```

**Exemples :**
```bash
npm run cleanup-users                                # Analyse et demande confirmation
npm run cleanup-users -- --force                    # Supprime sans confirmation
npm run cleanup-users http://localhost:3000         # URL personnalisée
```

**Caractéristiques :**
- ✅ Détection intelligente des utilisateurs de test
- ✅ Protection des utilisateurs normaux
- ✅ Mode force pour automatisation
- ✅ Rapport détaillé

## 🎯 Données Générées

### Utilisateurs
- **Adresses EVM** : Générées aléatoirement mais valides (format 0x...)
- **Rôles** : 85% utilisateurs normaux, 15% admins de club
- **Réseaux sociaux** : Distribution réaliste avec handles variés

### Réseaux Sociaux
- **TikTok** (80% des utilisateurs) : Handles de fans de football
- **Twitter** (70% des utilisateurs) : Comptes sport/football  
- **YouTube** (40% des utilisateurs) : Chaînes football
- **Telegram** (60% des utilisateurs) : Comptes communautaires

### Exemples de Données
```json
{
  "evm_address": "0xa1b2c3d4e5f6789012345678901234567890abcd",
  "role": "user",
  "tiktok_id": "fan.football.bcn",
  "twitter_id": "footballfan2024", 
  "youtube_id": "UCfootball-highlights2024",
  "telegram_id": "football_fanatic_2024"
}
```

## 🛡️ Sécurité et Bonnes Pratiques

### Protection en Production
```typescript
// Le script vérifie automatiquement l'environnement
if (process.env.NODE_ENV === 'production') {
  console.log('❌ Ce script ne peut être exécuté qu\'en mode développement !');
  process.exit(1);
}
```

### Limites de Sécurité
- **Maximum 100 utilisateurs** (script direct DB)
- **Maximum 50 utilisateurs** (script API) 
- **Pause entre créations** pour éviter la surcharge
- **Validation des entrées** sur tous les paramètres

### Détection des Utilisateurs de Test
Le script de nettoyage identifie les utilisateurs de test par :
- Patterns dans les handles sociaux
- Noms d'utilisateur contenant "test"
- Handles de la liste prédéfinie

## 🔧 Configuration et Personnalisation

### Variables d'Environnement
```bash
NODE_ENV=development    # Requis pour le script DB direct
```

### Personnalisation des Données
Modifiez les tableaux dans les scripts pour personnaliser :
- `SAMPLE_TIKTOK_HANDLES` : Handles TikTok
- `SAMPLE_TWITTER_IDS` : Comptes Twitter
- `SAMPLE_YOUTUBE_IDS` : Chaînes YouTube
- `SAMPLE_TELEGRAM_IDS` : Comptes Telegram

### URL de l'API
Par défaut : `http://localhost:8000`
Personnalisable via paramètre ou variable d'environnement.

## 📊 Monitoring et Debug

### Logs Détaillés
Les scripts fournissent des logs complets :
```
🚀 Génération de 10 utilisateurs de test via l'API...
🌐 URL de l'API: http://localhost:3001

👤 Création de l'utilisateur 1/10:
   - Adresse EVM: 0xa1b2c3d4e5f6789012345678901234567890abcd
   - Rôle: user
   - TikTok: @fan.football.bcn
   - Twitter: @footballfan2024
   ✅ Utilisateur créé avec l'ID: abc123
```

### Gestion d'Erreurs
- **Validation API** : Vérification de connectivité
- **Retry logic** : Gestion des erreurs temporaires  
- **Rapport final** : Résumé succès/échecs
- **Logs d'erreurs** : Messages détaillés

## 🚀 Intégration CI/CD

### Scripts d'Automatisation
```bash
# Génération automatique pour tests E2E
npm run generate-users-api 20

# Nettoyage automatique après tests
npm run cleanup-users -- --force
```

### Tests Automatisés
Les scripts peuvent être intégrés dans des pipelines de test :
```yaml
- name: Setup test data
  run: npm run generate-users-api 10
  
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Cleanup test data  
  run: npm run cleanup-users -- --force
```

## 📝 Support et Contribution

### Problèmes Courants
1. **API non accessible** : Vérifiez que le serveur backend est démarré
2. **Erreurs de validation** : Vérifiez les formats des données sociales
3. **Erreurs de permissions** : Assurez-vous d'être en mode développement

### Extension des Scripts
Pour ajouter de nouveaux types de données :
1. Modifiez les interfaces TypeScript dans `types.ts`
2. Ajoutez les nouveaux champs dans les fonctions de génération
3. Mettez à jour les patterns de détection pour le nettoyage

### Contribution
Les améliorations sont les bienvenues :
- Nouveaux patterns de données de test
- Amélioration de la détection automatique
- Optimisations de performance
- Support de nouveaux réseaux sociaux