import {
  createSeedAccount,
  deleteSeedAccount,
  getSeedAccountUsernames,
  isSeedAccountInDb,
  listSeedAccounts,
  type SeedAccount,
} from '../database/db';

/**
 * Seed accounts for trust propagation algorithm
 * These are manually curated accounts that serve as the foundation for trust scoring
 * Now backed by the database instead of in-memory array
 */

/**
 * Check if a username is a seed account
 */
export function isSeedAccount(username: string): boolean {
  return isSeedAccountInDb(username);
}

/**
 * Get all seed accounts (usernames only)
 */
export function getSeedAccounts(): string[] {
  return getSeedAccountUsernames();
}

/**
 * Get all seed accounts (full records)
 */
export function getSeedAccountRecords(): SeedAccount[] {
  return listSeedAccounts();
}

/**
 * Add a new seed account
 */
export function addSeedAccount(username: string): string {
  try {
    return createSeedAccount(username);
  } catch (error) {
    // If account already exists, ignore the error
    if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
      return ''; // Return empty string to indicate no new record was created
    }
    throw error;
  }
}

/**
 * Remove a seed account
 */
export function removeSeedAccount(username: string): void {
  deleteSeedAccount(username);
}

// Export the SeedAccount type for use in other modules
export type { SeedAccount };
