import Database from 'better-sqlite3';
import { config } from '../config';
import path from 'path';

// Database interfaces
export interface User {
  id: string;
  evmAddress: string;
  role: 'USER' | 'ADMIN';
  twitterId: string | null;
  youtubeId: string | null;
  telegramId: string | null;
  tiktokId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TiktokProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  followers: number;
  following: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FanToken {
  id: string;
  evmAddress: string;
  name: string;
  symbol: string;
  clubName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFanToken {
  id: string;
  userId: string;
  tokenId: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAddress {
  id: string;
  evmAddress: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithTokens extends User {
  fanTokens: Array<{
    id: string;
    token: FanToken;
    balance: string;
  }>;
  tiktokProfile?: TiktokProfile;
}

// Create a singleton SQLite database service
class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;

  private constructor() {
    // Extract database path from DATABASE_URL
    const dbPath = config.database.url.replace('file:', '');
    const fullPath = path.resolve(dbPath);
    
    this.db = new Database(fullPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Create tables
    this.initializeTables();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeTables(): void {
    // Create Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        evmAddress TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        twitterId TEXT,
        youtubeId TEXT,
        telegramId TEXT,
        tiktokId TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (tiktokId) REFERENCES tiktok_profiles(id)
      )
    `);

    // Create TikTok Profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tiktok_profiles (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        displayName TEXT,
        bio TEXT,
        followers INTEGER NOT NULL DEFAULT 0,
        following INTEGER NOT NULL DEFAULT 0,
        verified BOOLEAN NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create Fan Tokens table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS fan_tokens (
        id TEXT PRIMARY KEY,
        evmAddress TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        clubName TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create User-Fan Token relationships table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_fan_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        tokenId TEXT NOT NULL,
        balance TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tokenId) REFERENCES fan_tokens(id) ON DELETE CASCADE,
        UNIQUE(userId, tokenId)
      )
    `);

    // Create Admin Addresses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admin_addresses (
        id TEXT PRIMARY KEY,
        evmAddress TEXT UNIQUE NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_evm_address ON users(evmAddress);
      CREATE INDEX IF NOT EXISTS idx_tiktok_profiles_username ON tiktok_profiles(username);
      CREATE INDEX IF NOT EXISTS idx_fan_tokens_evm_address ON fan_tokens(evmAddress);
      CREATE INDEX IF NOT EXISTS idx_user_fan_tokens_user_id ON user_fan_tokens(userId);
      CREATE INDEX IF NOT EXISTS idx_admin_addresses_evm_address ON admin_addresses(evmAddress);
      CREATE INDEX IF NOT EXISTS idx_admin_addresses_active ON admin_addresses(isActive);
    `);
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public async connect(): Promise<void> {
    try {
      // Test the connection
      this.db.exec('SELECT 1');
      console.log('📊 Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.db.close();
      console.log('📊 Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection error:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      this.db.exec('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  // Helper method to generate CUID-like IDs
  public generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${randomPart}`;
  }

  // Helper method to update the updatedAt timestamp
  public updateTimestamp(tableName: string, id: string): void {
    const stmt = this.db.prepare(`UPDATE ${tableName} SET updatedAt = datetime('now') WHERE id = ?`);
    stmt.run(id);
  }
}

export const databaseService = DatabaseService.getInstance();
export const db = databaseService.getDatabase();