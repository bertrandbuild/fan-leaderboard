# Incohérences Observées

- La page `leader-board.tsx` affiche un classement de clubs fictifs alors que l'API `/api/social/leaderboard` renvoie un classement de profils TikTok. Les structures de données ne correspondent pas (points/members vs rank_score/follower_count).

- Dans `social-manager.tsx`, la liste des célébrités était chargée depuis des données mock. L'API réelle `/api/social/seed-accounts` renvoie des profils TikTok sans champ `weight` ou `team`.

- L'action de sauvegarde modifiait uniquement l'état local sans appeler l'API. Elle utilise maintenant `/api/social/rank` pour recalculer le score mais ne gère pas le poids.