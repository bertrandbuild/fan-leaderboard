#!/usr/bin/env ts-node

/**
 * Script de test pour valider la génération d'utilisateurs sans API
 * Teste seulement la logique de génération des données
 */

import { generateRandomEvmAddress } from './generate-users-via-api';
import { randomBytes } from 'crypto';

// Importons les types depuis notre projet
interface TestUser {
  evm_address: string;
  role: 'user' | 'club_admin';
  tiktok_id?: string;
  twitter_id?: string;
  youtube_id?: string;
  telegram_id?: string;
}

// Données de test
const SAMPLE_DATA = {
  tiktok_handles: [
    'fan.football.bcn',
    'real.madrid.lover', 
    'city.supporter',
    'psg.fanatic',
    'juventus.ultra'
  ],
  
  twitter_handles: [
    'footballfan2024',
    'soccer_enthusiast', 
    'goals_and_glory',
    'stadium_vibes',
    'kickoff_king'
  ]
};

/**
 * Génère des données d'utilisateur de test (sans API)
 */
function generateTestUserData(index: number): TestUser {
  const isClubAdmin = Math.random() < 0.15;
  const role = isClubAdmin ? 'club_admin' : 'user';
  
  const hasTikTok = Math.random() < 0.8;
  const hasTwitter = Math.random() < 0.7;
  const hasYouTube = Math.random() < 0.4;
  const hasTelegram = Math.random() < 0.6;
  
  const userData: TestUser = {
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
    userData.youtube_id = `UCtest-channel-${index}-${Math.floor(Math.random() * 1000)}`;
  }
  
  if (hasTelegram) {
    userData.telegram_id = `test_user_${index}_${Math.floor(Math.random() * 1000)}`;
  }
  
  return userData;
}

/**
 * Test principal
 */
function testGeneration() {
  console.log('🧪 Test de Génération d\'Utilisateurs');
  console.log('=====================================');
  console.log('');
  
  console.log('📝 Génération de 5 utilisateurs de test...');
  console.log('');
  
  const testUsers: TestUser[] = [];
  
  for (let i = 0; i < 5; i++) {
    const userData = generateTestUserData(i);
    testUsers.push(userData);
    
    console.log(`👤 Utilisateur ${i + 1}:`);
    console.log(`   - Adresse EVM: ${userData.evm_address}`);
    console.log(`   - Rôle: ${userData.role}`);
    
    if (userData.tiktok_id) console.log(`   - TikTok: @${userData.tiktok_id}`);
    if (userData.twitter_id) console.log(`   - Twitter: @${userData.twitter_id}`);
    if (userData.youtube_id) console.log(`   - YouTube: ${userData.youtube_id}`);
    if (userData.telegram_id) console.log(`   - Telegram: @${userData.telegram_id}`);
    
    console.log('');
  }
  
  // Statistiques
  const admins = testUsers.filter(u => u.role === 'club_admin').length;
  const users = testUsers.filter(u => u.role === 'user').length;
  const withTikTok = testUsers.filter(u => u.tiktok_id).length;
  const withTwitter = testUsers.filter(u => u.twitter_id).length;
  const withYouTube = testUsers.filter(u => u.youtube_id).length;
  const withTelegram = testUsers.filter(u => u.telegram_id).length;
  
  console.log('📊 Statistiques:');
  console.log(`   - Total: ${testUsers.length} utilisateurs`);
  console.log(`   - Utilisateurs normaux: ${users}`);
  console.log(`   - Administrateurs: ${admins}`);
  console.log(`   - Avec TikTok: ${withTikTok}`);
  console.log(`   - Avec Twitter: ${withTwitter}`);
  console.log(`   - Avec YouTube: ${withYouTube}`);
  console.log(`   - Avec Telegram: ${withTelegram}`);
  console.log('');
  
  // Validation des adresses EVM
  console.log('🔍 Validation des adresses EVM:');
  const validAddresses = testUsers.every(user => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(user.evm_address);
    if (!isValid) {
      console.log(`   ❌ Adresse invalide: ${user.evm_address}`);
    }
    return isValid;
  });
  
  if (validAddresses) {
    console.log('   ✅ Toutes les adresses EVM sont valides');
  } else {
    console.log('   ❌ Certaines adresses EVM sont invalides');
  }
  console.log('');
  
  console.log('✅ Test de génération terminé avec succès !');
  console.log('');
  console.log('💡 Pour tester avec l\'API, démarrez le serveur backend et utilisez:');
  console.log('   npm run generate-users-api 5');
}

// Exécuter le test
if (require.main === module) {
  testGeneration();
}

export { testGeneration, generateTestUserData };