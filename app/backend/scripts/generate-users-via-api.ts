#!/usr/bin/env ts-node

import { randomBytes } from 'crypto';

/**
 * Script pour générer des utilisateurs de test via l'API REST
 * Plus sûr car utilise l'API publique au lieu d'accéder directement à la DB
 * 
 * Usage:
 * npm run generate-users-api [nombre_utilisateurs] [url_base]
 * 
 * Par défaut:
 * - 10 utilisateurs
 * - URL: http://localhost:3001
 */

// Configuration
const DEFAULT_USER_COUNT = 10;
const DEFAULT_BASE_URL = 'http://localhost:8000';

// Données de test variées pour les comptes sociaux
const SAMPLE_DATA = {
  tiktok_handles: [
    'fan.football.bcn',
    'real.madrid.lover', 
    'city.supporter',
    'psg.fanatic',
    'juventus.ultra',
    'bayern.munich.fan',
    'liverpool.kop',
    'arsenal.gunner',
    'chelsea.blue',
    'milan.rossoneri',
    'inter.nerazzurri',
    'atletico.rojiblanco',
    'dortmund.gelb',
    'ajax.amsterdam',
    'tottenham.coys',
    'barca.culer',
    'madrid.hala',
    'united.reddevil',
    'celtic.bhoys',
    'rangers.gers'
  ],
  
  twitter_handles: [
    'footballfan2024',
    'soccer_enthusiast', 
    'goals_and_glory',
    'stadium_vibes',
    'kickoff_king',
    'match_day_magic',
    'trophy_hunter',
    'pitch_perfect',
    'football_fever',
    'game_changer',
    'club_legend',
    'soccer_star',
    'field_master',
    'goal_getter',
    'sport_fanatic'
  ],
  
  youtube_channels: [
    'UCfootball-highlights2024',
    'UCsoccer-analysis-pro',
    'UCgoals-compilation', 
    'UCstadium-atmosphere',
    'UCfan-reactions-live',
    'UCtactical-breakdown',
    'UCmatch-previews',
    'UCplayer-interviews',
    'UCteam-history',
    'UCfootball-news-daily'
  ],
  
  telegram_handles: [
    'football_fanatic_2024',
    'soccer_lover_official',
    'goal_hunter_pro',
    'stadium_atmosphere', 
    'match_day_hero',
    'football_news_live',
    'soccer_highlights',
    'fan_zone_chat',
    'football_tactics',
    'goal_celebrations'
  ]
};

/**
 * Génère une adresse EVM aléatoire valide
 */
function generateRandomEvmAddress(): string {
  const randomData = randomBytes(20);
  return '0x' + randomData.toString('hex');
}

/**
 * Sélectionne un élément aléatoire d'un tableau
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Génère les données d'un utilisateur de test
 */
function generateTestUserData(index: number) {
  const isClubAdmin = Math.random() < 0.15; // 15% de chance d'être admin
  const role = isClubAdmin ? 'club_admin' : 'user';
  
  // Probabilités d'avoir chaque type de compte social
  const hasTikTok = Math.random() < 0.8;   // 80%
  const hasTwitter = Math.random() < 0.7;  // 70%
  const hasYouTube = Math.random() < 0.4;  // 40%
  const hasTelegram = Math.random() < 0.6; // 60%
  
  const userData: any = {
    evm_address: generateRandomEvmAddress(),
    role: role,
  };
  
  if (hasTikTok) {
    userData.tiktok_id = index < SAMPLE_DATA.tiktok_handles.length 
      ? SAMPLE_DATA.tiktok_handles[index]
      : `test.user.${index}.${Math.floor(Math.random() * 1000)}`;
  }
  
  if (hasTwitter) {
    userData.twitter_id = index < SAMPLE_DATA.twitter_handles.length
      ? SAMPLE_DATA.twitter_handles[index] 
      : `testuser${index}_${Math.floor(Math.random() * 1000)}`;
  }
  
  if (hasYouTube) {
    userData.youtube_id = index < SAMPLE_DATA.youtube_channels.length
      ? SAMPLE_DATA.youtube_channels[index]
      : `UCtest-channel-${index}-${Math.floor(Math.random() * 1000)}`;
  }
  
  if (hasTelegram) {
    userData.telegram_id = index < SAMPLE_DATA.telegram_handles.length
      ? SAMPLE_DATA.telegram_handles[index]
      : `test_user_${index}_${Math.floor(Math.random() * 1000)}`;
  }
  
  return userData;
}

/**
 * Crée un utilisateur via l'API REST
 */
async function createUserViaAPI(userData: any, baseUrl: string): Promise<any> {
  const url = `${baseUrl}/api/users`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }
  
  return await response.json();
}

/**
 * Vérifie que l'API est accessible
 */
async function checkAPIHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Fonction principale
 */
async function generateUsersViaAPI(count: number, baseUrl: string) {
  console.log(`🚀 Génération de ${count} utilisateurs de test via l'API...`);
  console.log(`🌐 URL de l'API: ${baseUrl}`);
  console.log('');
  
  // Vérifier que l'API est accessible
  console.log('🔍 Vérification de la connectivité API...');
  const isAPIAccessible = await checkAPIHealth(baseUrl);
  
  if (!isAPIAccessible) {
    console.log('❌ L\'API n\'est pas accessible !');
    console.log('   Assurez-vous que le serveur backend est démarré.');
    console.log(`   URL testée: ${baseUrl}/api/health`);
    process.exit(1);
  }
  
  console.log('✅ API accessible - OK');
  console.log('');
  
  const createdUsers = [];
  const errors = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const userData = generateTestUserData(i);
      
      console.log(`👤 Création de l'utilisateur ${i + 1}/${count}:`);
      console.log(`   - Adresse EVM: ${userData.evm_address}`);
      console.log(`   - Rôle: ${userData.role}`);
      
      if (userData.tiktok_id) console.log(`   - TikTok: @${userData.tiktok_id}`);
      if (userData.twitter_id) console.log(`   - Twitter: @${userData.twitter_id}`);
      if (userData.youtube_id) console.log(`   - YouTube: ${userData.youtube_id}`);
      if (userData.telegram_id) console.log(`   - Telegram: @${userData.telegram_id}`);
      
      // Créer l'utilisateur via l'API
      const createdUser = await createUserViaAPI(userData, baseUrl);
      
      createdUsers.push(createdUser);
      
      console.log(`   ✅ Utilisateur créé avec l'ID: ${createdUser.id}`);
      console.log('');
      
      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.log(`   ❌ Erreur lors de la création: ${errorMsg}`);
      console.log('');
      
      errors.push({
        index: i + 1,
        error: errorMsg,
        userData: generateTestUserData(i)
      });
    }
  }
  
  // Affichage du résumé
  console.log('📊 Résumé de la génération:');
  console.log(`   ✅ Utilisateurs créés avec succès: ${createdUsers.length}`);
  console.log(`   ❌ Erreurs rencontrées: ${errors.length}`);
  console.log('');
  
  if (createdUsers.length > 0) {
    console.log('👥 Utilisateurs créés:');
    createdUsers.forEach((user, index) => {
      const socialAccounts = [];
      if (user.tiktok_id) socialAccounts.push(`TikTok: @${user.tiktok_id}`);
      if (user.twitter_id) socialAccounts.push(`Twitter: @${user.twitter_id}`);
      if (user.youtube_id) socialAccounts.push(`YouTube: ${user.youtube_id}`);
      if (user.telegram_id) socialAccounts.push(`Telegram: @${user.telegram_id}`);
      
      console.log(`   ${index + 1}. ${user.evm_address} (${user.role})`);
      if (socialAccounts.length > 0) {
        console.log(`      Réseaux sociaux: ${socialAccounts.join(', ')}`);
      }
    });
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Erreurs détaillées:');
    errors.forEach((error) => {
      console.log(`   - Utilisateur ${error.index}: ${error.error}`);
    });
    console.log('');
  }
  
  console.log(`🎉 Script terminé ! ${createdUsers.length} utilisateurs de test ont été créés.`);
  
  if (createdUsers.length > 0) {
    console.log('');
    console.log('💡 Conseils:');
    console.log('   - Vous pouvez maintenant tester l\'application avec ces utilisateurs');
    console.log('   - Les adresses EVM générées sont aléatoires mais valides');
    console.log(`   - Consultez la liste: GET ${baseUrl}/api/users`);
    console.log('   - Pour supprimer un utilisateur: DELETE /api/users/:id');
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  try {
    // Récupérer les arguments
    const args = process.argv.slice(2);
    
    const userCount = args.length > 0 ? parseInt(args[0], 10) : DEFAULT_USER_COUNT;
    const baseUrl = args.length > 1 ? args[1] : DEFAULT_BASE_URL;
    
    // Validation des arguments
    if (isNaN(userCount) || userCount <= 0) {
      console.log('❌ Nombre d\'utilisateurs invalide. Utilisation de la valeur par défaut (10).');
      await generateUsersViaAPI(DEFAULT_USER_COUNT, baseUrl);
    } else if (userCount > 50) {
      console.log('⚠️  Nombre d\'utilisateurs limité à 50 pour éviter la surcharge de l\'API.');
      await generateUsersViaAPI(50, baseUrl);
    } else {
      await generateUsersViaAPI(userCount, baseUrl);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Erreur fatale lors de l\'exécution du script:', error);
    process.exit(1);
  }
}

// Exécuter seulement si ce fichier est appelé directement
if (require.main === module) {
  main();
}

export { generateUsersViaAPI, generateRandomEvmAddress };