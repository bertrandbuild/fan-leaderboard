import { db, databaseService, User, UserWithTokens, FanToken, UserFanToken, AdminAddress, TiktokProfile } from './database';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface CreateUserInput {
  evmAddress: string;
  twitterId?: string;
  youtubeId?: string;
  telegramId?: string;
  tiktokId?: string;
}

export interface UpdateUserInput {
  twitterId?: string;
  youtubeId?: string;
  telegramId?: string;
  tiktokId?: string;
}

class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = this.getUserByEvmAddress(input.evmAddress);
    if (existingUser) {
      throw new Error('User with this EVM address already exists');
    }

    // Check if the EVM address is in the admin list
    const isAdmin = await this.isAdminAddress(input.evmAddress);
    
    // Validate tiktokId if provided
    if (input.tiktokId) {
      const tiktokProfile = this.getTiktokProfileById(input.tiktokId);
      if (!tiktokProfile) {
        throw new Error('Invalid TikTok profile ID');
      }
    }

    const userId = databaseService.generateId();
    const role = isAdmin ? 'ADMIN' : 'USER';

    const stmt = db.prepare(`
      INSERT INTO users (id, evmAddress, role, twitterId, youtubeId, telegramId, tiktokId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, input.evmAddress, role, input.twitterId || null, input.youtubeId || null, input.telegramId || null, input.tiktokId || null);

    return this.getUserById(userId)!;
  }

  getUserByEvmAddress(evmAddress: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE evmAddress = ?');
    const user = stmt.get(evmAddress) as User | undefined;
    return user || null;
  }

  getUserById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  getUserWithTokensById(id: string): UserWithTokens | null {
    const user = this.getUserById(id);
    if (!user) return null;

    // Get fan tokens for the user
    const fanTokensStmt = db.prepare(`
      SELECT uft.id, uft.balance, ft.* 
      FROM user_fan_tokens uft
      JOIN fan_tokens ft ON uft.tokenId = ft.id
      WHERE uft.userId = ?
    `);
    
    const fanTokenRows = fanTokensStmt.all(id) as (UserFanToken & FanToken)[];
    
    const fanTokens = fanTokenRows.map(row => ({
      id: row.id,
      balance: row.balance,
      token: {
        id: row.tokenId,
        evmAddress: row.evmAddress,
        name: row.name,
        symbol: row.symbol,
        clubName: row.clubName,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    }));

    // Get TikTok profile if linked
    let tiktokProfile: TiktokProfile | undefined;
    if (user.tiktokId) {
      tiktokProfile = this.getTiktokProfileById(user.tiktokId) || undefined;
    }

    return {
      ...user,
      fanTokens,
      tiktokProfile,
    };
  }

  async getUserByEvmAddressWithTokens(evmAddress: string): Promise<UserWithTokens | null> {
    const user = this.getUserByEvmAddress(evmAddress);
    if (!user) return null;

    return this.getUserWithTokensById(user.id);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    // Validate tiktokId if provided
    if (input.tiktokId) {
      const tiktokProfile = this.getTiktokProfileById(input.tiktokId);
      if (!tiktokProfile) {
        throw new Error('Invalid TikTok profile ID');
      }
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (input.twitterId !== undefined) {
      updateFields.push('twitterId = ?');
      values.push(input.twitterId);
    }
    if (input.youtubeId !== undefined) {
      updateFields.push('youtubeId = ?');
      values.push(input.youtubeId);
    }
    if (input.telegramId !== undefined) {
      updateFields.push('telegramId = ?');
      values.push(input.telegramId);
    }
    if (input.tiktokId !== undefined) {
      updateFields.push('tiktokId = ?');
      values.push(input.tiktokId);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push('updatedAt = datetime(\'now\')');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);

    return this.getUserById(id)!;
  }

  async deleteUser(id: string): Promise<void> {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }

  async isAdminAddress(evmAddress: string): Promise<boolean> {
    const stmt = db.prepare('SELECT * FROM admin_addresses WHERE evmAddress = ? AND isActive = 1');
    const adminAddress = stmt.get(evmAddress) as AdminAddress | undefined;
    return !!adminAddress;
  }

  async addAdminAddress(evmAddress: string): Promise<void> {
    // Check if admin address already exists
    const existingStmt = db.prepare('SELECT * FROM admin_addresses WHERE evmAddress = ?');
    const existing = existingStmt.get(evmAddress) as AdminAddress | undefined;

    if (existing) {
      // Update to active
      const updateStmt = db.prepare('UPDATE admin_addresses SET isActive = 1, updatedAt = datetime(\'now\') WHERE evmAddress = ?');
      updateStmt.run(evmAddress);
    } else {
      // Insert new admin address
      const insertStmt = db.prepare('INSERT INTO admin_addresses (id, evmAddress, isActive) VALUES (?, ?, 1)');
      insertStmt.run(databaseService.generateId(), evmAddress);
    }

    // Update user role if user exists
    const user = this.getUserByEvmAddress(evmAddress);
    if (user) {
      const updateUserStmt = db.prepare('UPDATE users SET role = ?, updatedAt = datetime(\'now\') WHERE id = ?');
      updateUserStmt.run('ADMIN', user.id);
    }
  }

  async removeAdminAddress(evmAddress: string): Promise<void> {
    const stmt = db.prepare('UPDATE admin_addresses SET isActive = 0, updatedAt = datetime(\'now\') WHERE evmAddress = ?');
    stmt.run(evmAddress);

    // Update user role if user exists
    const user = this.getUserByEvmAddress(evmAddress);
    if (user) {
      const updateUserStmt = db.prepare('UPDATE users SET role = ?, updatedAt = datetime(\'now\') WHERE id = ?');
      updateUserStmt.run('USER', user.id);
    }
  }

  async addFanToken(userId: string, tokenEvmAddress: string, balance: string): Promise<void> {
    // Find or create the fan token
    let fanToken = this.getFanTokenByEvmAddress(tokenEvmAddress);

    if (!fanToken) {
      // Create a basic fan token
      const tokenId = databaseService.generateId();
      const insertTokenStmt = db.prepare(`
        INSERT INTO fan_tokens (id, evmAddress, name, symbol) 
        VALUES (?, ?, ?, ?)
      `);
      insertTokenStmt.run(tokenId, tokenEvmAddress, `Token ${tokenEvmAddress.slice(0, 6)}...`, 'FAN');
      fanToken = this.getFanTokenByEvmAddress(tokenEvmAddress)!;
    }

    // Add or update user's fan token balance
    const existingStmt = db.prepare('SELECT * FROM user_fan_tokens WHERE userId = ? AND tokenId = ?');
    const existing = existingStmt.get(userId, fanToken.id) as UserFanToken | undefined;

    if (existing) {
      // Update balance
      const updateStmt = db.prepare('UPDATE user_fan_tokens SET balance = ?, updatedAt = datetime(\'now\') WHERE userId = ? AND tokenId = ?');
      updateStmt.run(balance, userId, fanToken.id);
    } else {
      // Insert new relationship
      const insertStmt = db.prepare(`
        INSERT INTO user_fan_tokens (id, userId, tokenId, balance) 
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(databaseService.generateId(), userId, fanToken.id, balance);
    }
  }

  async removeFanToken(userId: string, tokenEvmAddress: string): Promise<void> {
    const fanToken = this.getFanTokenByEvmAddress(tokenEvmAddress);
    if (fanToken) {
      const stmt = db.prepare('DELETE FROM user_fan_tokens WHERE userId = ? AND tokenId = ?');
      stmt.run(userId, fanToken.id);
    }
  }

  getFanTokenByEvmAddress(evmAddress: string): FanToken | null {
    const stmt = db.prepare('SELECT * FROM fan_tokens WHERE evmAddress = ?');
    const token = stmt.get(evmAddress) as FanToken | undefined;
    return token || null;
  }

  getTiktokProfileById(id: string): TiktokProfile | null {
    const stmt = db.prepare('SELECT * FROM tiktok_profiles WHERE id = ?');
    const profile = stmt.get(id) as TiktokProfile | undefined;
    return profile || null;
  }

  generateJWT(user: User): string {
    const payload = {
      userId: user.id,
      evmAddress: user.evmAddress,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);
  }

  verifyJWT(token: string): { userId: string; evmAddress: string; role: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return {
        userId: decoded.userId,
        evmAddress: decoded.evmAddress,
        role: decoded.role,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: UserWithTokens[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const countResult = countStmt.get() as { count: number };
    const total = countResult.count;

    // Get users with pagination
    const usersStmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?');
    const users = usersStmt.all(limit, offset) as User[];

    // Convert to UserWithTokens
    const usersWithTokens = users.map(user => this.getUserWithTokensById(user.id)!);

    return {
      users: usersWithTokens,
      total,
      page,
      limit,
    };
  }
}

export const userService = new UserService();