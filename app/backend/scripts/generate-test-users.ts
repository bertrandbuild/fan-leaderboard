#!/usr/bin/env ts-node

import { createUser } from '../database/db';
import { IUserCreateRequest, UserRole } from '../types';
import { randomBytes } from 'crypto';

/**
 * Script pour générer des utilisateurs de test en mode développement
 * 
 * Usage:
 * npm run generate-users [nombre_utilisateurs]
 * 
 * Par défaut génère 10 utilisateurs
 */

// Données de test variées pour les comptes sociaux
const SAMPLE_TIKTOK_HANDLES = [
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
  'tottenham.coys'
];

const SAMPLE_TWITTER_IDS = [
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
];

const SAMPLE_YOUTUBE_IDS = [
  'UCfootball-highlights2024',
  'UCsoccer-analysis-pro',
  'UCgoals-compilation',
  'UCstadium-atmosphere',
  'UCfan-reactions-live',
  'UCtactical-breakdown',
  'UCmatch-previews',
  'UCplayer-interviews',
  'UCteam-history',
  'UCfootball-news-daily',
  'UCsoccer-skills',
  'UCfan-zone-official',
  'UCfootball-legends',
  'UCgoal-celebrations',
  'UCsoccer-world-cup'
];

const SAMPLE_TELEGRAM_IDS = [
  'football_fanatic_2024',
  'soccer_lover_official',
  'goal_hunter_pro',
  'stadium_atmosphere',
  'match_day_hero',
  'football_news_live',
  'soccer_highlights',
  'fan_zone_chat',
  'football_tactics',
  'goal_celebrations',
  'soccer_community',
  'football_passion',
  'match_analysis',
  'soccer_updates',
  'football_world'
];

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
 * Génère un utilisateur de test avec des données variées
 */
function generateTestUser(index: number): IUserCreateRequest {
  const isClubAdmin = Math.random() < 0.2; // 20% de chance d'être admin
  const role: UserRole = isClubAdmin ? 'club_admin' : 'user';
  
  // Probabilité d'avoir chaque type de compte social (70% chance pour chaque)
  const hasTikTok = Math.random() < 0.7;
  const hasTwitter = Math.random() < 0.7;
  const hasYouTube = Math.random() < 0.5; // Moins fréquent
  const hasTelegram = Math.random() < 0.6;
  
  const user: IUserCreateRequest = {
    evm_address: generateRandomEvmAddress(),
    role: role,
  };
  
  if (hasTikTok) {
    // Utilise les handles prédéfinis ou génère un nouveau basé sur l'index
    if (index < SAMPLE_TIKTOK_HANDLES.length) {
      user.tiktok_id = SAMPLE_TIKTOK_HANDLES[index];
    } else {
      user.tiktok_id = `test.user.${index}`;
    }
  }
  
  if (hasTwitter) {
    if (index < SAMPLE_TWITTER_IDS.length) {
      user.twitter_id = SAMPLE_TWITTER_IDS[index];
    } else {
      user.twitter_id = `testuser${index}_${Math.floor(Math.random() * 1000)}`;
    }
  }
  
  if (hasYouTube) {
    if (index < SAMPLE_YOUTUBE_IDS.length) {
      user.youtube_id = SAMPLE_YOUTUBE_IDS[index];
    } else {
      user.youtube_id = `UCtest-channel-${index}-${Math.floor(Math.random() * 1000)}`;
    }
  }
  
  if (hasTelegram) {
    if (index < SAMPLE_TELEGRAM_IDS.length) {
      user.telegram_id = SAMPLE_TELEGRAM_IDS[index];
    } else {
      user.telegram_id = `test_user_${index}_${Math.floor(Math.random() * 1000)}`;
    }
  }
  
  return user;
}

/**
 * Fonction principale pour générer les utilisateurs
 */
async function generateTestUsers(count: number = 10) {
  console.log(`🚀 Génération de ${count} utilisateurs de test...`);
  console.log('');
  
  const createdUsers = [];
  const errors = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const userData = generateTestUser(i);
      
      console.log(`👤 Création de l'utilisateur ${i + 1}/${count}:`);
      console.log(`   - Adresse EVM: ${userData.evm_address}`);
      console.log(`   - Rôle: ${userData.role}`);
      
      if (userData.tiktok_id) console.log(`   - TikTok: @${userData.tiktok_id}`);
      if (userData.twitter_id) console.log(`   - Twitter: @${userData.twitter_id}`);
      if (userData.youtube_id) console.log(`   - YouTube: ${userData.youtube_id}`);
      if (userData.telegram_id) console.log(`   - Telegram: @${userData.telegram_id}`);
      
      // Créer l'utilisateur directement en base de données
      const userId = createUser({
        evm_address: userData.evm_address,
        role: userData.role,
        twitter_id: userData.twitter_id,
        youtube_id: userData.youtube_id,
        telegram_id: userData.telegram_id,
        tiktok_id: userData.tiktok_id,
      });
      
      createdUsers.push({
        id: userId,
        ...userData
      });
      
      console.log(`   ✅ Utilisateur créé avec l'ID: ${userId}`);
      console.log('');
      
      // Petite pause pour éviter de surcharger le système
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.log(`   ❌ Erreur lors de la création: ${errorMsg}`);
      console.log('');
      
      errors.push({
        index: i + 1,
        error: errorMsg,
        userData: generateTestUser(i)
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
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. Utilisateur ${error.index}: ${error.error}`);
    });
    console.log('');
  }
  
  console.log(`🎉 Script terminé ! ${createdUsers.length} utilisateurs de test ont été créés.`);
  
  if (createdUsers.length > 0) {
    console.log('');
    console.log('💡 Conseils:');
    console.log('   - Vous pouvez maintenant tester l\'application avec ces utilisateurs');
    console.log('   - Les adresses EVM générées sont aléatoires mais valides');
    console.log('   - Utilisez l\'API /api/users pour récupérer la liste complète');
    console.log('   - Pour supprimer les données de test, utilisez l\'API DELETE sur chaque utilisateur');
  }
}

// Exécution du script
async function main() {
  try {
    // Vérifier que nous sommes en mode développement
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ Ce script ne peut être exécuté qu\'en mode développement !');
      console.log('   Définissez NODE_ENV=development pour continuer.');
      process.exit(1);
    }
    
    console.log('🔧 Mode développement détecté - OK');
    console.log('');
    
    // Récupérer le nombre d'utilisateurs à créer depuis les arguments
    const args = process.argv.slice(2);
    const userCount = args.length > 0 ? parseInt(args[0], 10) : 10;
    
    if (isNaN(userCount) || userCount <= 0) {
      console.log('❌ Nombre d\'utilisateurs invalide. Utilisation de la valeur par défaut (10).');
      await generateTestUsers(10);
    } else if (userCount > 100) {
      console.log('⚠️  Nombre d\'utilisateurs limité à 100 pour éviter la surcharge.');
      await generateTestUsers(100);
    } else {
      await generateTestUsers(userCount);
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

export { generateTestUsers, generateRandomEvmAddress };