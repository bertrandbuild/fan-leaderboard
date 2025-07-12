#!/usr/bin/env ts-node

/**
 * Script pour nettoyer les utilisateurs de test
 * 
 * Usage:
 * npm run cleanup-users [url_base]
 * 
 * Par défaut:
 * - URL: http://localhost:3001
 */

// Configuration
const DEFAULT_BASE_URL = 'http://localhost:8000';

/**
 * Récupère la liste des utilisateurs via l'API
 */
async function getUsersViaAPI(baseUrl: string): Promise<any[]> {
  const url = `${baseUrl}/api/users?limit=1000`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }
  
  const data = await response.json();
  return data.users || [];
}

/**
 * Supprime un utilisateur via l'API
 */
async function deleteUserViaAPI(userId: string, baseUrl: string): Promise<void> {
  const url = `${baseUrl}/api/users/${userId}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }
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
 * Détermine si un utilisateur semble être un utilisateur de test
 */
function isTestUser(user: any): boolean {
  // Critères pour identifier un utilisateur de test:
  // 1. Adresse EVM générée aléatoirement (commence par 0x et a 42 caractères)
  // 2. TikTok handle contient "test" ou fait partie des handles de test
  // 3. Twitter handle contient "test" ou des patterns de test
  
  const testPatterns = [
    /test/i,
    /^fan\.football\./,
    /^real\.madrid\./,
    /^city\.supporter/,
    /^psg\.fanatic/,
    /juventus\.ultra/,
    /bayern\.munich/,
    /liverpool\.kop/,
    /arsenal\.gunner/,
    /chelsea\.blue/,
    /milan\.rossoneri/,
    /footballfan2024/,
    /soccer_enthusiast/,
    /goals_and_glory/,
    /stadium_vibes/,
    /kickoff_king/,
    /match_day_magic/,
    /UCfootball-highlights/,
    /UCsoccer-analysis/,
    /football_fanatic_2024/,
    /soccer_lover_official/
  ];
  
  // Vérifier les handles sociaux
  const socialHandles = [
    user.tiktok_id,
    user.twitter_id,
    user.youtube_id,
    user.telegram_id
  ].filter(Boolean);
  
  for (const handle of socialHandles) {
    for (const pattern of testPatterns) {
      if (pattern.test(handle)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Fonction principale pour nettoyer les utilisateurs de test
 */
async function cleanupTestUsers(baseUrl: string, confirmationRequired: boolean = true) {
  console.log('🧹 Nettoyage des utilisateurs de test...');
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
  
  // Récupérer tous les utilisateurs
  console.log('📋 Récupération de la liste des utilisateurs...');
  const allUsers = await getUsersViaAPI(baseUrl);
  console.log(`   Trouvé ${allUsers.length} utilisateurs au total`);
  console.log('');
  
  // Identifier les utilisateurs de test
  const testUsers = allUsers.filter(isTestUser);
  const regularUsers = allUsers.filter(user => !isTestUser(user));
  
  console.log('🔍 Analyse des utilisateurs:');
  console.log(`   👥 Utilisateurs normaux: ${regularUsers.length}`);
  console.log(`   🧪 Utilisateurs de test détectés: ${testUsers.length}`);
  console.log('');
  
  if (testUsers.length === 0) {
    console.log('✨ Aucun utilisateur de test détecté. Rien à nettoyer !');
    return;
  }
  
  // Afficher les utilisateurs de test détectés
  console.log('🧪 Utilisateurs de test détectés:');
  testUsers.forEach((user, index) => {
    const socialAccounts = [];
    if (user.tiktok_id) socialAccounts.push(`TikTok: @${user.tiktok_id}`);
    if (user.twitter_id) socialAccounts.push(`Twitter: @${user.twitter_id}`);
    if (user.youtube_id) socialAccounts.push(`YouTube: ${user.youtube_id}`);
    if (user.telegram_id) socialAccounts.push(`Telegram: @${user.telegram_id}`);
    
    console.log(`   ${index + 1}. ${user.evm_address} (${user.role})`);
    if (socialAccounts.length > 0) {
      console.log(`      ${socialAccounts.join(', ')}`);
    }
  });
  console.log('');
  
  // Demander confirmation si nécessaire
  if (confirmationRequired) {
    console.log('⚠️  ATTENTION: Cette action va supprimer définitivement les utilisateurs de test.');
    console.log('   Assurez-vous que vous voulez vraiment continuer.');
    console.log('');
    console.log('   Pour continuer sans confirmation, utilisez --force');
    console.log('   Exemple: npm run cleanup-users -- --force');
    console.log('');
    
    // En mode script, on ne peut pas vraiment demander de confirmation interactive
    // Donc on affiche juste le message et on s'arrête
    console.log('❌ Nettoyage annulé. Utilisez --force pour bypasser cette confirmation.');
    return;
  }
  
  // Supprimer les utilisateurs de test
  console.log('🗑️  Suppression des utilisateurs de test...');
  const deletedUsers = [];
  const errors = [];
  
  for (const user of testUsers) {
    try {
      console.log(`   🗑️  Suppression de ${user.evm_address}...`);
      await deleteUserViaAPI(user.id, baseUrl);
      deletedUsers.push(user);
      console.log(`   ✅ Supprimé: ${user.evm_address}`);
      
      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.log(`   ❌ Erreur lors de la suppression de ${user.evm_address}: ${errorMsg}`);
      errors.push({
        user,
        error: errorMsg
      });
    }
  }
  
  console.log('');
  console.log('📊 Résumé du nettoyage:');
  console.log(`   ✅ Utilisateurs supprimés: ${deletedUsers.length}`);
  console.log(`   ❌ Erreurs rencontrées: ${errors.length}`);
  console.log(`   👥 Utilisateurs normaux conservés: ${regularUsers.length}`);
  console.log('');
  
  if (errors.length > 0) {
    console.log('❌ Erreurs détaillées:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.user.evm_address}: ${error.error}`);
    });
    console.log('');
  }
  
  console.log(`🎉 Nettoyage terminé ! ${deletedUsers.length} utilisateurs de test ont été supprimés.`);
}

/**
 * Point d'entrée principal
 */
async function main() {
  try {
    // Récupérer les arguments
    const args = process.argv.slice(2);
    
    const baseUrl = args.find(arg => !arg.startsWith('--')) || DEFAULT_BASE_URL;
    const forceMode = args.includes('--force') || args.includes('-f');
    
    await cleanupTestUsers(baseUrl, !forceMode);
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Erreur fatale lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécuter seulement si ce fichier est appelé directement
if (require.main === module) {
  main();
}

export { cleanupTestUsers };