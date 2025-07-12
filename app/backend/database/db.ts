import Database = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { IAgent } from '../types';

// --- DATABASE INITIALIZATION ---
// Since it's a hackathon project, we're using a local SQLite database as a quick solution that can be easily scaled up to a proper database later.

// Ensure the database directory exists
// Use Railway volume mount path if available, otherwise fallback to local development path
const dbDir = process.env.RAILWAY_ENVIRONMENT_NAME
  ? '/app/data'
  : path.join(process.cwd(), './data');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create and initialize the database
const dbPath = path.join(dbDir, 'local_db.db');
const db = new Database(dbPath);

// --- AGENTS TABLE ---
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL,
    details TEXT NOT NULL, -- JSON string
    status TEXT NOT NULL DEFAULT 'enabled'
  )
`);

// --- SOCIAL/TIKTOK TABLES ---
// TikTok profiles table
db.exec(`
  CREATE TABLE IF NOT EXISTS tiktok_profiles (
    id TEXT PRIMARY KEY,
    unique_id TEXT NOT NULL UNIQUE, -- TikTok handle (e.g., 'jamal.voyage')
    user_id TEXT, -- TikTok user ID (e.g., '7463232156317287456')
    sec_uid TEXT, -- TikTok security UID
    nickname TEXT, -- Display name
    avatar_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    aweme_count INTEGER DEFAULT 0, -- Number of posts
    region TEXT,
    verification_type INTEGER DEFAULT 0,
    is_seed_account INTEGER DEFAULT 0, -- 1 if manually curated seed account
    known_followers_count INTEGER DEFAULT 0, -- Total followers we have data for (legacy)
    follower_rank_sum REAL DEFAULT 0, -- Sum of all follower rank scores (legacy)
    weighted_follower_score REAL DEFAULT 0, -- Calculated weighted score (legacy)
    trust_depth INTEGER DEFAULT 0, -- Propagation depth in trust network
    rank_score REAL DEFAULT 0, -- Final calculated ranking score (0-100)
    -- New trust propagation fields
    trusted_by_count INTEGER DEFAULT 0, -- Number of seed accounts following this profile
    trust_received_sum REAL DEFAULT 0, -- Sum of trust scores from accounts following this profile
    following_trusted_count INTEGER DEFAULT 0, -- Number of trusted accounts this profile follows
    last_scraped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Trust relationships table - tracks who seed accounts are following
db.exec(`
  CREATE TABLE IF NOT EXISTS trust_relationships (
    id TEXT PRIMARY KEY,
    trusted_by_id TEXT NOT NULL, -- ID of the account giving trust (seed account)
    trusted_profile_id TEXT NOT NULL, -- ID of the account receiving trust
    trust_weight REAL DEFAULT 1.0, -- Weight of this trust relationship
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trusted_by_id, trusted_profile_id),
    FOREIGN KEY(trusted_by_id) REFERENCES tiktok_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY(trusted_profile_id) REFERENCES tiktok_profiles(id) ON DELETE CASCADE
  )
`);

// Ranking calculation cache table
db.exec(`
  CREATE TABLE IF NOT EXISTS ranking_calculations (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    calculation_type TEXT NOT NULL, -- 'follower_based', 'smart_follower_based'
    rank_score REAL NOT NULL,
    total_followers INTEGER DEFAULT 0,
    smart_followers INTEGER DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id) REFERENCES tiktok_profiles(id) ON DELETE CASCADE
  )
`);

// Scraper API call logs for monitoring and rate limiting
db.exec(`
  CREATE TABLE IF NOT EXISTS scraper_logs (
    id TEXT PRIMARY KEY,
    profile_handle TEXT NOT NULL,
    api_endpoint TEXT NOT NULL,
    success INTEGER NOT NULL, -- 1 for success, 0 for failure
    response_code INTEGER,
    error_message TEXT,
    followers_fetched INTEGER DEFAULT 0,
    api_call_duration_ms INTEGER,
    called_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed accounts table for trust propagation
db.exec(`
  CREATE TABLE IF NOT EXISTS seed_accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE, -- TikTok username (normalized to lowercase)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// --- USER MANAGEMENT TABLES ---
// Users table - stores user profiles with role-based access control
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    evm_address TEXT NOT NULL UNIQUE, -- EVM address of the user
    role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'club_admin'
    twitter_id TEXT, -- Twitter/X user ID
    youtube_id TEXT, -- YouTube channel ID
    telegram_id TEXT, -- Telegram user ID
    tiktok_id TEXT, -- TikTok handle/username (e.g., 'jamal.voyage')
    tiktok_account TEXT, -- FK to tiktok_profiles table
    fan_tokens TEXT, -- JSON array of EVM addresses of fan tokens owned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tiktok_account) REFERENCES tiktok_profiles(id) ON DELETE SET NULL
  )
`);

// --- YAP SCORING TABLES ---
// Yaps table - stores high-quality content identified by engagement from trusted accounts
db.exec(`
  CREATE TABLE IF NOT EXISTS yaps (
    id TEXT PRIMARY KEY,
    video_url TEXT NOT NULL UNIQUE, -- TikTok video URL
    aweme_id TEXT NOT NULL, -- TikTok post ID from API
    profile_id TEXT NOT NULL, -- Creator's profile ID
    yap_score REAL NOT NULL, -- Calculated quality score (0-100)
    total_comments INTEGER NOT NULL,
    known_commenters_count INTEGER NOT NULL, -- Count of commenters from our tiktok_profiles
    top_commenter_rank REAL DEFAULT 0, -- Highest rank_score among commenters
    weighted_engagement_score REAL NOT NULL, -- Weighted score based on commenter ranks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id) REFERENCES tiktok_profiles(id) ON DELETE CASCADE
  )
`);

// Yap interactions table - stores individual comments/interactions on yaps
db.exec(`
  CREATE TABLE IF NOT EXISTS yap_interactions (
    id TEXT PRIMARY KEY,
    yap_id TEXT NOT NULL,
    interactor_profile_id TEXT NOT NULL, -- ID from tiktok_profiles
    comment_id TEXT, -- TikTok comment ID (cid from API)
    comment_text TEXT,
    comment_likes INTEGER DEFAULT 0, -- digg_count from API
    interaction_weight REAL NOT NULL, -- Based on interactor's rank_score
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(yap_id) REFERENCES yaps(id) ON DELETE CASCADE,
    FOREIGN KEY(interactor_profile_id) REFERENCES tiktok_profiles(id) ON DELETE CASCADE
  )
`);

// --- CAMPAIGN MANAGEMENT TABLES ---
// Campaigns table - stores paid campaigns created by club admins
db.exec(`
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    club_admin_id TEXT NOT NULL, -- FK to users table
    title TEXT NOT NULL,
    description TEXT,
    fan_token_address TEXT NOT NULL, -- EVM address of the Chiliz FanToken
    pool_amount REAL NOT NULL, -- Total fan tokens in the pool
    max_participants INTEGER NOT NULL, -- Maximum number of participants
    first_place_allocation REAL NOT NULL, -- Percentage for 1st place (0-100)
    second_place_allocation REAL NOT NULL, -- Percentage for 2nd place (0-100)
    third_place_allocation REAL NOT NULL, -- Percentage for 3rd place (0-100)
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
    current_participants INTEGER DEFAULT 0,
    total_yaps INTEGER DEFAULT 0,
    blockchain_contract_address TEXT, -- Address of deployed campaign contract
    blockchain_tx_hash TEXT, -- Transaction hash of deployment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(club_admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK(first_place_allocation + second_place_allocation + third_place_allocation <= 100),
    CHECK(start_date < end_date),
    CHECK(pool_amount > 0),
    CHECK(max_participants > 0)
  )
`);

// Campaign participants table - stores user participation in campaigns
db.exec(`
  CREATE TABLE IF NOT EXISTS campaign_participants (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    tiktok_profile_id TEXT NOT NULL, -- FK to tiktok_profiles
    total_points REAL DEFAULT 0, -- Accumulated campaign points
    yap_count INTEGER DEFAULT 0, -- Number of yaps created in campaign
    leaderboard_rank INTEGER, -- Current rank in campaign
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, user_id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(tiktok_profile_id) REFERENCES tiktok_profiles(id) ON DELETE CASCADE
  )
`);

// Campaign yaps table - stores yaps created during campaigns
db.exec(`
  CREATE TABLE IF NOT EXISTS campaign_yaps (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    yap_id TEXT NOT NULL,
    participant_id TEXT NOT NULL, -- FK to campaign_participants
    points_earned REAL NOT NULL, -- Points earned from this yap
    bonus_multiplier REAL DEFAULT 1.0, -- Campaign-specific bonus multiplier
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, yap_id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY(yap_id) REFERENCES yaps(id) ON DELETE CASCADE,
    FOREIGN KEY(participant_id) REFERENCES campaign_participants(id) ON DELETE CASCADE
  )
`);

// Campaign rewards table - stores reward distribution for campaigns
db.exec(`
  CREATE TABLE IF NOT EXISTS campaign_rewards (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    rank_position INTEGER NOT NULL, -- 1st, 2nd, 3rd place
    token_amount REAL NOT NULL, -- Fan tokens earned
    allocation_percentage REAL NOT NULL, -- Percentage of pool allocated
    distributed BOOLEAN DEFAULT FALSE,
    distribution_tx_hash TEXT, -- Blockchain transaction hash
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY(participant_id) REFERENCES campaign_participants(id) ON DELETE CASCADE
  )
`);

// Campaign activity log table - stores all campaign activities
db.exec(`
  CREATE TABLE IF NOT EXISTS campaign_activity_log (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    user_id TEXT,
    activity_type TEXT NOT NULL, -- 'created', 'joined', 'yap_submitted', 'reward_distributed'
    activity_data TEXT, -- JSON data with activity details
    points_change REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);

export default db;

export function listAgents(): IAgent[] {
  const stmt = db.prepare('SELECT * FROM agents');
  return (stmt.all() as any[]).map(
    (row: {
      id: string;
      version: number;
      details: string;
      status: string;
    }) => ({
      ...row,
      details: JSON.parse(row.details),
      status: row.status as import('../types').AgentStatus,
    }),
  );
}

export function getAgentById(id: string): IAgent | null {
  const stmt = db.prepare('SELECT * FROM agents WHERE id = ?');
  const row = stmt.get(id) as
    | { id: string; version: number; details: string; status: string }
    | undefined;
  return row
    ? {
        ...row,
        details: JSON.parse(row.details),
        status: row.status as import('../types').AgentStatus,
      }
    : null;
}

export function createAgent(agent: IAgent): void {
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO agents (id, version, details, status) VALUES (?, ?, ?, ?)',
  );
  stmt.run(
    agent.id,
    agent.version,
    JSON.stringify(agent.details),
    agent.status,
  );
}

export function updateAgent(agent: IAgent): void {
  const stmt = db.prepare(
    'UPDATE agents SET version = ?, details = ?, status = ? WHERE id = ?',
  );
  stmt.run(
    agent.version,
    JSON.stringify(agent.details),
    agent.status,
    agent.id,
  );
}

export function deleteAgent(id: string): void {
  const stmt = db.prepare('DELETE FROM agents WHERE id = ?');
  stmt.run(id);
}

// --- TIKTOK PROFILES LOGIC ---
export interface TikTokProfile {
  id: string;
  unique_id: string;
  user_id?: string;
  sec_uid?: string;
  nickname?: string;
  avatar_url?: string;
  follower_count: number;
  following_count: number;
  aweme_count: number;
  region?: string;
  verification_type: number;
  is_seed_account: boolean;
  // Legacy fields (kept for backward compatibility)
  known_followers_count: number;
  follower_rank_sum: number;
  weighted_follower_score: number;
  // Core trust fields
  trust_depth: number;
  rank_score: number;
  // New trust propagation fields
  trusted_by_count: number;
  trust_received_sum: number;
  following_trusted_count: number;
  last_scraped_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TrustRelationship {
  id: string;
  trusted_by_id: string;
  trusted_profile_id: string;
  trust_weight: number;
  discovered_at: string;
  created_at: string;
}

export interface RankingCalculation {
  id: string;
  profile_id: string;
  calculation_type:
    | 'follower_based'
    | 'smart_follower_based'
    | 'trust_propagation';
  rank_score: number;
  total_followers: number;
  smart_followers: number;
  calculated_at: string;
}

export interface ScraperLog {
  id: string;
  profile_handle: string;
  api_endpoint: string;
  success: boolean;
  response_code?: number;
  error_message?: string;
  followers_fetched: number;
  api_call_duration_ms?: number;
  called_at: string;
}

export function createTikTokProfile(
  profile: Omit<TikTokProfile, 'id' | 'created_at' | 'updated_at'>,
): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO tiktok_profiles (
      id, unique_id, user_id, sec_uid, nickname, avatar_url,
      follower_count, following_count, aweme_count, region,
      verification_type, is_seed_account, known_followers_count,
      follower_rank_sum, weighted_follower_score, trust_depth,
      rank_score, trusted_by_count, trust_received_sum, following_trusted_count,
      last_scraped_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    profile.unique_id,
    profile.user_id || null,
    profile.sec_uid || null,
    profile.nickname || null,
    profile.avatar_url || null,
    profile.follower_count,
    profile.following_count,
    profile.aweme_count,
    profile.region || null,
    profile.verification_type,
    profile.is_seed_account ? 1 : 0,
    profile.known_followers_count,
    profile.follower_rank_sum,
    profile.weighted_follower_score,
    profile.trust_depth,
    profile.rank_score,
    profile.trusted_by_count || 0,
    profile.trust_received_sum || 0,
    profile.following_trusted_count || 0,
    profile.last_scraped_at || null,
  );
  return id;
}

export function getTikTokProfileById(id: string): TikTokProfile | null {
  const stmt = db.prepare('SELECT * FROM tiktok_profiles WHERE id = ?');
  const row = stmt.get(id) as any;
  return row
    ? {
        ...row,
        is_seed_account: !!row.is_seed_account,
        trusted_by_count: row.trusted_by_count || 0,
        trust_received_sum: row.trust_received_sum || 0,
        following_trusted_count: row.following_trusted_count || 0,
      }
    : null;
}

export function getTikTokProfileByHandle(
  unique_id: string,
): TikTokProfile | null {
  const stmt = db.prepare('SELECT * FROM tiktok_profiles WHERE unique_id = ?');
  const row = stmt.get(unique_id) as any;
  return row
    ? {
        ...row,
        is_seed_account: !!row.is_seed_account,
        trusted_by_count: row.trusted_by_count || 0,
        trust_received_sum: row.trust_received_sum || 0,
        following_trusted_count: row.following_trusted_count || 0,
      }
    : null;
}

export function updateTikTokProfile(
  id: string,
  updates: Partial<Omit<TikTokProfile, 'id' | 'created_at' | 'updated_at'>>,
): void {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates).map((val) =>
    typeof val === 'boolean' ? (val ? 1 : 0) : val,
  );
  if (!fields) return;

  const stmt = db.prepare(`
    UPDATE tiktok_profiles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(...values, id);
}

export function listTikTokProfiles(is_seed_account?: boolean): TikTokProfile[] {
  let query = 'SELECT * FROM tiktok_profiles';
  let params: any[] = [];

  if (is_seed_account !== undefined) {
    query += ' WHERE is_seed_account = ?';
    params.push(is_seed_account ? 1 : 0);
  }

  query += ' ORDER BY rank_score DESC, created_at DESC';

  const stmt = db.prepare(query);
  const results = params.length > 0 ? stmt.all(...params) : stmt.all();

  return (results as any[]).map((row) => ({
    ...row,
    is_seed_account: !!row.is_seed_account,
    trusted_by_count: row.trusted_by_count || 0,
    trust_received_sum: row.trust_received_sum || 0,
    following_trusted_count: row.following_trusted_count || 0,
  }));
}

export function getSeedAccounts(): TikTokProfile[] {
  return listTikTokProfiles(true);
}

export function markAsSeedAccount(profileId: string): void {
  const stmt = db.prepare(`
    UPDATE tiktok_profiles 
    SET is_seed_account = 1, rank_score = 100, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  stmt.run(profileId);
}

export function removeSeedAccountStatus(profileId: string): void {
  const stmt = db.prepare(`
    UPDATE tiktok_profiles 
    SET is_seed_account = 0, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  stmt.run(profileId);
}

export function createTrustRelationship(
  trustedById: string,
  trustedProfileId: string,
  trustWeight: number = 1.0,
): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO trust_relationships (id, trusted_by_id, trusted_profile_id, trust_weight)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, trustedById, trustedProfileId, trustWeight);
  return id;
}

export function getTrustRelationships(
  profileId: string,
): TrustRelationship[] {
  const stmt = db.prepare(`
    SELECT * FROM trust_relationships WHERE trusted_profile_id = ?
  `);
  return stmt.all(profileId) as TrustRelationship[];
}

export function getTrustRelationshipsByTruster(
  trustedById: string,
): TrustRelationship[] {
  const stmt = db.prepare(`
    SELECT * FROM trust_relationships WHERE trusted_by_id = ?
  `);
  return stmt.all(trustedById) as TrustRelationship[];
}

// Legacy function for backward compatibility (maps to new trust relationships)
export function getSmartFollowerRelationships(
  profileId: string,
): TrustRelationship[] {
  return getTrustRelationships(profileId);
}

export function createSmartFollowerRelationship(
  profileId: string,
  smartFollowerId: string,
): string {
  return createTrustRelationship(smartFollowerId, profileId);
}

export function deleteSmartFollowerRelationship(
  profileId: string,
  smartFollowerId: string,
): void {
  deleteTrustRelationship(smartFollowerId, profileId);
}

export function updateSmartFollowersCount(profileId: string): void {
  updateTrustCounts(profileId);
}

export function deleteTrustRelationship(
  trustedById: string,
  trustedProfileId: string,
): void {
  const stmt = db.prepare(`
    DELETE FROM trust_relationships 
    WHERE trusted_by_id = ? AND trusted_profile_id = ?
  `);
  stmt.run(trustedById, trustedProfileId);
}

export function updateTrustCounts(profileId: string): void {
  const stmt = db.prepare(`
    UPDATE tiktok_profiles 
    SET trusted_by_count = (
      SELECT COUNT(*) FROM trust_relationships 
      WHERE trusted_profile_id = ?
    ),
    trust_received_sum = (
      SELECT COALESCE(SUM(tp.rank_score * tr.trust_weight), 0) 
      FROM trust_relationships tr
      JOIN tiktok_profiles tp ON tr.trusted_by_id = tp.id
      WHERE tr.trusted_profile_id = ?
    ),
    following_trusted_count = (
      SELECT COUNT(*) FROM trust_relationships 
      WHERE trusted_by_id = ?
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(profileId, profileId, profileId, profileId);
}

export function createRankingCalculation(
  calculation: Omit<RankingCalculation, 'id' | 'calculated_at'>,
): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO ranking_calculations (
      id, profile_id, calculation_type, rank_score, 
      total_followers, smart_followers
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    calculation.profile_id,
    calculation.calculation_type,
    calculation.rank_score,
    calculation.total_followers,
    calculation.smart_followers,
  );
  return id;
}

export function getLatestRankingCalculation(
  profileId: string,
): RankingCalculation | null {
  const stmt = db.prepare(`
    SELECT * FROM ranking_calculations 
    WHERE profile_id = ? 
    ORDER BY calculated_at DESC 
    LIMIT 1
  `);
  return stmt.get(profileId) as RankingCalculation | null;
}

export function logScraperCall(
  log: Omit<ScraperLog, 'id' | 'called_at'>,
): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO scraper_logs (
      id, profile_handle, api_endpoint, success, response_code,
      error_message, followers_fetched, api_call_duration_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    log.profile_handle,
    log.api_endpoint,
    log.success ? 1 : 0,
    log.response_code || null,
    log.error_message || null,
    log.followers_fetched,
    log.api_call_duration_ms || null,
  );
  return id;
}

export function updateKnownFollowersCount(profileId: string): void {
  // Legacy function - now uses trust relationships
  const stmt = db.prepare(`
    UPDATE tiktok_profiles 
    SET known_followers_count = (
      SELECT COUNT(*) FROM trust_relationships 
      WHERE trusted_profile_id = ?
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(profileId, profileId);
}

export function getAllTrustRelationships(): TrustRelationship[] {
  const stmt = db.prepare('SELECT * FROM trust_relationships ORDER BY created_at DESC');
  return stmt.all() as TrustRelationship[];
}

export function getTrustNetworkStats(): {
  totalRelationships: number;
  seedAccountsCount: number;
  trustedProfilesCount: number;
} {
  const totalRelationships = db.prepare('SELECT COUNT(*) as count FROM trust_relationships').get() as { count: number };
  const seedAccountsCount = db.prepare('SELECT COUNT(DISTINCT trusted_by_id) as count FROM trust_relationships').get() as { count: number };
  const trustedProfilesCount = db.prepare('SELECT COUNT(DISTINCT trusted_profile_id) as count FROM trust_relationships').get() as { count: number };
  
  return {
    totalRelationships: totalRelationships.count,
    seedAccountsCount: seedAccountsCount.count,
    trustedProfilesCount: trustedProfilesCount.count,
  };
}

// --- SEED ACCOUNTS LOGIC ---
export interface SeedAccount {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export function createSeedAccount(username: string): string {
  const id = uuidv4();
  const normalizedUsername = username.toLowerCase();
  const stmt = db.prepare(`
    INSERT INTO seed_accounts (id, username)
    VALUES (?, ?)
  `);
  stmt.run(id, normalizedUsername);
  return id;
}

export function getSeedAccountById(id: string): SeedAccount | null {
  const stmt = db.prepare('SELECT * FROM seed_accounts WHERE id = ?');
  return stmt.get(id) as SeedAccount | null;
}

export function getSeedAccountByUsername(username: string): SeedAccount | null {
  const normalizedUsername = username.toLowerCase();
  const stmt = db.prepare('SELECT * FROM seed_accounts WHERE username = ?');
  return stmt.get(normalizedUsername) as SeedAccount | null;
}

export function listSeedAccounts(): SeedAccount[] {
  const stmt = db.prepare('SELECT * FROM seed_accounts ORDER BY username');
  return stmt.all() as SeedAccount[];
}

export function deleteSeedAccount(username: string): void {
  const normalizedUsername = username.toLowerCase();
  const stmt = db.prepare('DELETE FROM seed_accounts WHERE username = ?');
  stmt.run(normalizedUsername);
}

export function deleteSeedAccountById(id: string): void {
  const stmt = db.prepare('DELETE FROM seed_accounts WHERE id = ?');
  stmt.run(id);
}

export function isSeedAccountInDb(username: string): boolean {
  const normalizedUsername = username.toLowerCase();
  const stmt = db.prepare(
    'SELECT COUNT(*) as count FROM seed_accounts WHERE username = ?',
  );
  const result = stmt.get(normalizedUsername) as { count: number };
  return result.count > 0;
}

export function getSeedAccountUsernames(): string[] {
  const stmt = db.prepare(
    'SELECT username FROM seed_accounts ORDER BY username',
  );
  const results = stmt.all() as { username: string }[];
  return results.map((row) => row.username);
}

// --- USER MANAGEMENT LOGIC ---
import { IUser, UserRole } from '../types';

export function createUser(user: {
  evm_address: string;
  role?: UserRole;
  twitter_id?: string;
  youtube_id?: string;
  telegram_id?: string;
  tiktok_id?: string;
  tiktok_account?: string;
}): string {
  const id = uuidv4();
  
  const stmt = db.prepare(`
    INSERT INTO users (
      id, evm_address, role, twitter_id, youtube_id, 
      telegram_id, tiktok_id, tiktok_account, fan_tokens
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    user.evm_address,
    user.role || 'user',
    user.twitter_id || null,
    user.youtube_id || null,
    user.telegram_id || null,
    user.tiktok_id || null,
    user.tiktok_account || null,
    JSON.stringify([]) // Initialize empty fan_tokens array
  );
  
  return id;
}

export function getUserById(id: string): IUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id) as any;
  return row ? {
    ...row,
    fan_tokens: JSON.parse(row.fan_tokens || '[]'),
  } : null;
}

export function getUserByEvmAddress(evm_address: string): IUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE evm_address = ?');
  const row = stmt.get(evm_address) as any;
  return row ? {
    ...row,
    fan_tokens: JSON.parse(row.fan_tokens || '[]'),
  } : null;
}

export function updateUser(
  id: string,
  updates: {
    role?: UserRole;
    twitter_id?: string;
    youtube_id?: string;
    telegram_id?: string;
    tiktok_id?: string;
    tiktok_account?: string;
    fan_tokens?: string[];
  }
): void {
  const setFields = [];
  const values = [];
  
  if (updates.role !== undefined) {
    setFields.push('role = ?');
    values.push(updates.role);
  }
  if (updates.twitter_id !== undefined) {
    setFields.push('twitter_id = ?');
    values.push(updates.twitter_id);
  }
  if (updates.youtube_id !== undefined) {
    setFields.push('youtube_id = ?');
    values.push(updates.youtube_id);
  }
  if (updates.telegram_id !== undefined) {
    setFields.push('telegram_id = ?');
    values.push(updates.telegram_id);
  }
  if (updates.tiktok_id !== undefined) {
    setFields.push('tiktok_id = ?');
    values.push(updates.tiktok_id);
  }
  if (updates.tiktok_account !== undefined) {
    setFields.push('tiktok_account = ?');
    values.push(updates.tiktok_account);
  }
  if (updates.fan_tokens !== undefined) {
    setFields.push('fan_tokens = ?');
    values.push(JSON.stringify(updates.fan_tokens));
  }
  
  if (setFields.length === 0) return;
  
  setFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE users SET ${setFields.join(', ')} WHERE id = ?
  `);
  stmt.run(...values);
}

export function updateUserByEvmAddress(
  evm_address: string,
  updates: {
    role?: UserRole;
    twitter_id?: string;
    youtube_id?: string;
    telegram_id?: string;
    tiktok_id?: string;
    tiktok_account?: string;
    fan_tokens?: string[];
  }
): void {
  const setFields = [];
  const values = [];
  
  if (updates.role !== undefined) {
    setFields.push('role = ?');
    values.push(updates.role);
  }
  if (updates.twitter_id !== undefined) {
    setFields.push('twitter_id = ?');
    values.push(updates.twitter_id);
  }
  if (updates.youtube_id !== undefined) {
    setFields.push('youtube_id = ?');
    values.push(updates.youtube_id);
  }
  if (updates.telegram_id !== undefined) {
    setFields.push('telegram_id = ?');
    values.push(updates.telegram_id);
  }
  if (updates.tiktok_id !== undefined) {
    setFields.push('tiktok_id = ?');
    values.push(updates.tiktok_id);
  }
  if (updates.tiktok_account !== undefined) {
    setFields.push('tiktok_account = ?');
    values.push(updates.tiktok_account);
  }
  if (updates.fan_tokens !== undefined) {
    setFields.push('fan_tokens = ?');
    values.push(JSON.stringify(updates.fan_tokens));
  }
  
  if (setFields.length === 0) return;
  
  setFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(evm_address);
  
  const stmt = db.prepare(`
    UPDATE users SET ${setFields.join(', ')} WHERE evm_address = ?
  `);
  stmt.run(...values);
}

export function deleteUser(id: string): void {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(id);
}

export function listUsers(role?: UserRole): IUser[] {
  let query = 'SELECT * FROM users';
  let params: any[] = [];
  
  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const stmt = db.prepare(query);
  const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
  
  return (rows as any[]).map(row => ({
    ...row,
    fan_tokens: JSON.parse(row.fan_tokens || '[]'),
  }));
}

export function listClubAdmins(): IUser[] {
  return listUsers('club_admin');
}

export function isClubAdmin(evm_address: string): boolean {
  const user = getUserByEvmAddress(evm_address);
  return user?.role === 'club_admin';
}

export function updateUserRole(evm_address: string, role: UserRole): void {
  updateUserByEvmAddress(evm_address, { role });
}

export function updateUserFanTokens(evm_address: string, fan_tokens: string[]): void {
  updateUserByEvmAddress(evm_address, { fan_tokens });
}

// --- YAP SCORING LOGIC ---
export interface Yap {
  id: string;
  video_url: string;
  aweme_id: string;
  profile_id: string;
  yap_score: number;
  total_comments: number;
  known_commenters_count: number;
  top_commenter_rank: number;
  weighted_engagement_score: number;
  created_at: string;
  scraped_at: string;
}

export interface YapInteraction {
  id: string;
  yap_id: string;
  interactor_profile_id: string;
  comment_id?: string;
  comment_text?: string;
  comment_likes: number;
  interaction_weight: number;
  detected_at: string;
}

export interface YapScore {
  videoUrl: string;
  awemeId: string;
  score: number;
  knownInteractors: KnownCommenter[];
  totalComments: number;
  knownCommentersCount: number;
  weightedEngagementScore: number;
  qualifiesAsYap: boolean;
}

export interface KnownCommenter {
  profileId: string;
  username: string;
  nickname: string;
  rankScore: number;
  commentCount: number;
  totalLikes: number;
}

export interface Comment {
  cid: string;
  aweme_id: string;
  text: string;
  create_time: number;
  digg_count: number;
  reply_comment_total: number;
  user: {
    uid: string;
    unique_id: string;
    nickname: string;
    sec_uid: string;
    avatar_thumb: {
      url_list: string[];
    };
  };
}

export interface CommentsResponse {
  comments: Comment[];
  cursor: number;
  has_more: 1 | 0;
  total: number;
  status_code?: number;
  status_msg?: string;
}

export function createYap(yap: Omit<Yap, 'id' | 'created_at' | 'scraped_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO yaps (
      id, video_url, aweme_id, profile_id, yap_score,
      total_comments, known_commenters_count, top_commenter_rank,
      weighted_engagement_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    yap.video_url,
    yap.aweme_id,
    yap.profile_id,
    yap.yap_score,
    yap.total_comments,
    yap.known_commenters_count,
    yap.top_commenter_rank,
    yap.weighted_engagement_score
  );
  
  return id;
}

export function getYapById(id: string): Yap | null {
  const stmt = db.prepare('SELECT * FROM yaps WHERE id = ?');
  return stmt.get(id) as Yap | null;
}

export function getYapByVideoUrl(videoUrl: string): Yap | null {
  const stmt = db.prepare('SELECT * FROM yaps WHERE video_url = ?');
  return stmt.get(videoUrl) as Yap | null;
}

export function getYapByAwemeId(awemeId: string): Yap | null {
  const stmt = db.prepare('SELECT * FROM yaps WHERE aweme_id = ?');
  return stmt.get(awemeId) as Yap | null;
}

export function updateYap(id: string, updates: Partial<Omit<Yap, 'id' | 'created_at' | 'scraped_at'>>): void {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);
  if (!fields) return;

  const stmt = db.prepare(`
    UPDATE yaps SET ${fields}, scraped_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(...values, id);
}

export function listYaps(profileId?: string): Yap[] {
  let query = 'SELECT * FROM yaps';
  let params: any[] = [];

  if (profileId) {
    query += ' WHERE profile_id = ?';
    params.push(profileId);
  }

  query += ' ORDER BY yap_score DESC, created_at DESC';

  const stmt = db.prepare(query);
  const results = params.length > 0 ? stmt.all(...params) : stmt.all();
  return results as Yap[];
}

export function getTopYaps(limit: number = 50): Yap[] {
  const stmt = db.prepare('SELECT * FROM yaps ORDER BY yap_score DESC LIMIT ?');
  return stmt.all(limit) as Yap[];
}

export function createYapInteraction(
  interaction: Omit<YapInteraction, 'id' | 'detected_at'>
): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO yap_interactions (
      id, yap_id, interactor_profile_id, comment_id,
      comment_text, comment_likes, interaction_weight
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    interaction.yap_id,
    interaction.interactor_profile_id,
    interaction.comment_id || null,
    interaction.comment_text || null,
    interaction.comment_likes,
    interaction.interaction_weight
  );
  
  return id;
}

export function getYapInteractions(yapId: string): YapInteraction[] {
  const stmt = db.prepare('SELECT * FROM yap_interactions WHERE yap_id = ? ORDER BY detected_at DESC');
  return stmt.all(yapId) as YapInteraction[];
}

export function getYapInteractionsByProfile(profileId: string): YapInteraction[] {
  const stmt = db.prepare('SELECT * FROM yap_interactions WHERE interactor_profile_id = ? ORDER BY detected_at DESC');
  return stmt.all(profileId) as YapInteraction[];
}

export function deleteYap(id: string): void {
  const stmt = db.prepare('DELETE FROM yaps WHERE id = ?');
  stmt.run(id);
}

export function deleteYapInteraction(id: string): void {
  const stmt = db.prepare('DELETE FROM yap_interactions WHERE id = ?');
  stmt.run(id);
}

export function getYapStats(): {
  totalYaps: number;
  totalInteractions: number;
  averageYapScore: number;
  topYapScore: number;
} {
  const totalYaps = db.prepare('SELECT COUNT(*) as count FROM yaps').get() as { count: number };
  const totalInteractions = db.prepare('SELECT COUNT(*) as count FROM yap_interactions').get() as { count: number };
  const avgScore = db.prepare('SELECT AVG(yap_score) as avg FROM yaps').get() as { avg: number };
  const topScore = db.prepare('SELECT MAX(yap_score) as max FROM yaps').get() as { max: number };
  
  return {
    totalYaps: totalYaps.count,
    totalInteractions: totalInteractions.count,
    averageYapScore: avgScore.avg || 0,
    topYapScore: topScore.max || 0,
  };
}

export function getYapsByProfileRanking(limit: number = 100): Array<{
  profile_id: string;
  unique_id: string;
  nickname: string;
  yap_count: number;
  total_yap_score: number;
  average_yap_score: number;
  rank_score: number;
}> {
  const stmt = db.prepare(`
    SELECT 
      tp.id as profile_id,
      tp.unique_id,
      tp.nickname,
      COUNT(y.id) as yap_count,
      SUM(y.yap_score) as total_yap_score,
      AVG(y.yap_score) as average_yap_score,
      tp.rank_score
    FROM yaps y
    JOIN tiktok_profiles tp ON y.profile_id = tp.id
    GROUP BY tp.id, tp.unique_id, tp.nickname, tp.rank_score
    ORDER BY total_yap_score DESC, average_yap_score DESC
    LIMIT ?
  `);
  
  return stmt.all(limit) as Array<{
    profile_id: string;
    unique_id: string;
    nickname: string;
    yap_count: number;
    total_yap_score: number;
    average_yap_score: number;
    rank_score: number;
  }>;
}

// --- CAMPAIGN MANAGEMENT LOGIC ---
export interface Campaign {
  id: string;
  club_admin_id: string;
  title: string;
  description?: string;
  fan_token_address: string;
  pool_amount: number;
  max_participants: number;
  first_place_allocation: number;
  second_place_allocation: number;
  third_place_allocation: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  current_participants: number;
  total_yaps: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignParticipant {
  id: string;
  campaign_id: string;
  user_id: string;
  tiktok_profile_id: string;
  total_points: number;
  yap_count: number;
  leaderboard_rank?: number;
  joined_at: string;
  last_activity_at: string;
}

export interface CampaignYap {
  id: string;
  campaign_id: string;
  yap_id: string;
  participant_id: string;
  points_earned: number;
  bonus_multiplier: number;
  created_at: string;
}

export interface CampaignReward {
  id: string;
  campaign_id: string;
  participant_id: string;
  rank_position: number;
  token_amount: number;
  allocation_percentage: number;
  distributed: boolean;
  distribution_tx_hash?: string;
  distributed_at?: string;
  created_at: string;
}

export interface CampaignActivityLog {
  id: string;
  campaign_id: string;
  user_id?: string;
  activity_type: 'created' | 'joined' | 'yap_submitted' | 'reward_distributed';
  activity_data?: string;
  points_change: number;
  created_at: string;
}

export interface CampaignConfig {
  title: string;
  description?: string;
  fanTokenAddress: string;
  poolAmount: number;
  maxParticipants: number;
  firstPlaceAllocation: number;
  secondPlaceAllocation: number;
  thirdPlaceAllocation: number;
  startDate: Date;
  endDate: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  tiktokProfile: string;
  nickname?: string;
  totalPoints: number;
  yapCount: number;
  potentialReward?: number;
}

export function createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO campaigns (
      id, club_admin_id, title, description, fan_token_address,
      pool_amount, max_participants, first_place_allocation,
      second_place_allocation, third_place_allocation, start_date,
      end_date, status, current_participants, total_yaps
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    campaign.club_admin_id,
    campaign.title,
    campaign.description || null,
    campaign.fan_token_address,
    campaign.pool_amount,
    campaign.max_participants,
    campaign.first_place_allocation,
    campaign.second_place_allocation,
    campaign.third_place_allocation,
    campaign.start_date,
    campaign.end_date,
    campaign.status,
    campaign.current_participants,
    campaign.total_yaps
  );
  
  return id;
}

export function getCampaignById(id: string): Campaign | null {
  const stmt = db.prepare('SELECT * FROM campaigns WHERE id = ?');
  const result = stmt.get(id);
  return result as Campaign | null;
}

export function listCampaigns(status?: string, adminId?: string): Campaign[] {
  let query = 'SELECT * FROM campaigns';
  const params: any[] = [];
  const conditions: string[] = [];
  
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  
  if (adminId) {
    conditions.push('club_admin_id = ?');
    params.push(adminId);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';
  
  const stmt = db.prepare(query);
  const results = params.length > 0 ? stmt.all(...params) : stmt.all();
  return results as Campaign[];
}

export function updateCampaign(id: string, updates: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>): void {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);
  
  if (!fields) return;
  
  const stmt = db.prepare(`
    UPDATE campaigns SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(...values, id);
}

export function deleteCampaign(id: string): void {
  const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
  stmt.run(id);
}

export function createCampaignParticipant(participant: Omit<CampaignParticipant, 'id' | 'joined_at' | 'last_activity_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO campaign_participants (
      id, campaign_id, user_id, tiktok_profile_id, total_points, yap_count, leaderboard_rank
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    participant.campaign_id,
    participant.user_id,
    participant.tiktok_profile_id,
    participant.total_points,
    participant.yap_count,
    participant.leaderboard_rank || null
  );
  
  return id;
}

export function getCampaignParticipant(campaignId: string, userId: string): CampaignParticipant | null {
  const stmt = db.prepare('SELECT * FROM campaign_participants WHERE campaign_id = ? AND user_id = ?');
  const result = stmt.get(campaignId, userId);
  return result as CampaignParticipant | null;
}

export function updateCampaignParticipant(id: string, updates: Partial<Omit<CampaignParticipant, 'id' | 'joined_at' | 'last_activity_at'>>): void {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);
  
  if (!fields) return;
  
  const stmt = db.prepare(`
    UPDATE campaign_participants SET ${fields}, last_activity_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(...values, id);
}

export function getCampaignParticipants(campaignId: string): CampaignParticipant[] {
  const stmt = db.prepare('SELECT * FROM campaign_participants WHERE campaign_id = ? ORDER BY total_points DESC');
  const results = stmt.all(campaignId);
  return results as CampaignParticipant[];
}

export function createCampaignYap(campaignYap: Omit<CampaignYap, 'id' | 'created_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO campaign_yaps (
      id, campaign_id, yap_id, participant_id, points_earned, bonus_multiplier
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    campaignYap.campaign_id,
    campaignYap.yap_id,
    campaignYap.participant_id,
    campaignYap.points_earned,
    campaignYap.bonus_multiplier
  );
  
  return id;
}

export function getCampaignYaps(campaignId: string): CampaignYap[] {
  const stmt = db.prepare('SELECT * FROM campaign_yaps WHERE campaign_id = ? ORDER BY created_at DESC');
  const results = stmt.all(campaignId);
  return results as CampaignYap[];
}

export function createCampaignReward(reward: Omit<CampaignReward, 'id' | 'created_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO campaign_rewards (
      id, campaign_id, participant_id, rank_position, token_amount,
      allocation_percentage, distributed, distribution_tx_hash, distributed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    reward.campaign_id,
    reward.participant_id,
    reward.rank_position,
    reward.token_amount,
    reward.allocation_percentage,
    reward.distributed,
    reward.distribution_tx_hash || null,
    reward.distributed_at || null
  );
  
  return id;
}

export function getCampaignRewards(campaignId: string): CampaignReward[] {
  const stmt = db.prepare('SELECT * FROM campaign_rewards WHERE campaign_id = ? ORDER BY rank_position ASC');
  const results = stmt.all(campaignId);
  return results as CampaignReward[];
}

export function createCampaignActivityLog(log: Omit<CampaignActivityLog, 'id' | 'created_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO campaign_activity_log (
      id, campaign_id, user_id, activity_type, activity_data, points_change
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    log.campaign_id,
    log.user_id || null,
    log.activity_type,
    log.activity_data || null,
    log.points_change
  );
  
  return id;
}

export function getCampaignActivityLog(campaignId: string): CampaignActivityLog[] {
  const stmt = db.prepare('SELECT * FROM campaign_activity_log WHERE campaign_id = ? ORDER BY created_at DESC');
  const results = stmt.all(campaignId);
  return results as CampaignActivityLog[];
}

export function getCampaignLeaderboard(campaignId: string, limit: number = 10): LeaderboardEntry[] {
  const stmt = db.prepare(`
    SELECT 
      cp.leaderboard_rank as rank,
      cp.user_id,
      tp.unique_id as tiktok_profile,
      tp.nickname,
      cp.total_points,
      cp.yap_count,
      c.pool_amount,
      c.first_place_allocation,
      c.second_place_allocation,
      c.third_place_allocation
    FROM campaign_participants cp
    JOIN users u ON cp.user_id = u.id
    JOIN tiktok_profiles tp ON cp.tiktok_profile_id = tp.id
    JOIN campaigns c ON cp.campaign_id = c.id
    WHERE cp.campaign_id = ?
    ORDER BY cp.leaderboard_rank ASC
    LIMIT ?
  `);
  
  const results = stmt.all(campaignId, limit);
  
  return results.map((row: any) => ({
    rank: row.rank,
    userId: row.user_id,
    tiktokProfile: row.tiktok_profile,
    nickname: row.nickname,
    totalPoints: row.total_points,
    yapCount: row.yap_count,
    potentialReward: calculatePotentialReward(row.rank, row.pool_amount, {
      first: row.first_place_allocation,
      second: row.second_place_allocation,
      third: row.third_place_allocation,
    }),
  }));
}

function calculatePotentialReward(rank: number, poolAmount: number, allocations: { first: number; second: number; third: number }): number {
  if (rank === 1) return (poolAmount * allocations.first) / 100;
  if (rank === 2) return (poolAmount * allocations.second) / 100;
  if (rank === 3) return (poolAmount * allocations.third) / 100;
  return 0;
}
