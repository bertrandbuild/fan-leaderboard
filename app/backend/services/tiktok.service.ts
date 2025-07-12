import { db, databaseService, TiktokProfile } from './database';

export interface CreateTiktokProfileInput {
  username: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  following?: number;
  verified?: boolean;
}

export interface UpdateTiktokProfileInput {
  displayName?: string;
  bio?: string;
  followers?: number;
  following?: number;
  verified?: boolean;
}

class TiktokService {
  createTiktokProfile(input: CreateTiktokProfileInput): TiktokProfile {
    // Check if profile already exists
    const existingProfile = this.getTiktokProfileByUsername(input.username);
    if (existingProfile) {
      throw new Error('TikTok profile with this username already exists');
    }

    const profileId = databaseService.generateId();
    const stmt = db.prepare(`
      INSERT INTO tiktok_profiles (id, username, displayName, bio, followers, following, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      profileId,
      input.username,
      input.displayName || null,
      input.bio || null,
      input.followers || 0,
      input.following || 0,
      input.verified ? 1 : 0
    );

    return this.getTiktokProfileById(profileId)!;
  }

  getTiktokProfileById(id: string): TiktokProfile | null {
    const stmt = db.prepare('SELECT * FROM tiktok_profiles WHERE id = ?');
    const profile = stmt.get(id) as TiktokProfile | undefined;
    return profile || null;
  }

  getTiktokProfileByUsername(username: string): TiktokProfile | null {
    const stmt = db.prepare('SELECT * FROM tiktok_profiles WHERE username = ?');
    const profile = stmt.get(username) as TiktokProfile | undefined;
    return profile || null;
  }

  updateTiktokProfile(id: string, input: UpdateTiktokProfileInput): TiktokProfile {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (input.displayName !== undefined) {
      updateFields.push('displayName = ?');
      values.push(input.displayName);
    }
    if (input.bio !== undefined) {
      updateFields.push('bio = ?');
      values.push(input.bio);
    }
    if (input.followers !== undefined) {
      updateFields.push('followers = ?');
      values.push(input.followers);
    }
    if (input.following !== undefined) {
      updateFields.push('following = ?');
      values.push(input.following);
    }
    if (input.verified !== undefined) {
      updateFields.push('verified = ?');
      values.push(input.verified ? 1 : 0);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push('updatedAt = datetime(\'now\')');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE tiktok_profiles 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);

    return this.getTiktokProfileById(id)!;
  }

  deleteTiktokProfile(id: string): void {
    const stmt = db.prepare('DELETE FROM tiktok_profiles WHERE id = ?');
    stmt.run(id);
  }

  getAllTiktokProfiles(page: number = 1, limit: number = 10): {
    profiles: TiktokProfile[];
    total: number;
    page: number;
    limit: number;
  } {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM tiktok_profiles');
    const countResult = countStmt.get() as { count: number };
    const total = countResult.count;

    // Get profiles with pagination
    const profilesStmt = db.prepare('SELECT * FROM tiktok_profiles ORDER BY createdAt DESC LIMIT ? OFFSET ?');
    const profiles = profilesStmt.all(limit, offset) as TiktokProfile[];

    return {
      profiles,
      total,
      page,
      limit,
    };
  }

  searchTiktokProfiles(query: string, page: number = 1, limit: number = 10): {
    profiles: TiktokProfile[];
    total: number;
    page: number;
    limit: number;
  } {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;
    
    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM tiktok_profiles 
      WHERE username LIKE ? OR displayName LIKE ?
    `);
    const countResult = countStmt.get(searchPattern, searchPattern) as { count: number };
    const total = countResult.count;

    // Get profiles with pagination
    const profilesStmt = db.prepare(`
      SELECT * FROM tiktok_profiles 
      WHERE username LIKE ? OR displayName LIKE ?
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `);
    const profiles = profilesStmt.all(searchPattern, searchPattern, limit, offset) as TiktokProfile[];

    return {
      profiles,
      total,
      page,
      limit,
    };
  }

  getTiktokProfileWithUsers(id: string): (TiktokProfile & { users: any[] }) | null {
    const profile = this.getTiktokProfileById(id);
    if (!profile) return null;

    // Get users associated with this TikTok profile
    const usersStmt = db.prepare(`
      SELECT id, evmAddress, role, twitterId, youtubeId, telegramId, createdAt, updatedAt
      FROM users 
      WHERE tiktokId = ?
    `);
    const users = usersStmt.all(id);

    return {
      ...profile,
      users,
    };
  }
}

export const tiktokService = new TiktokService();