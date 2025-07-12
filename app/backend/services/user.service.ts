import { PrismaClient } from '@prisma/client';
import { prisma } from './database';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

// Define types from Prisma schema
type User = {
  id: string;
  evmAddress: string;
  role: 'USER' | 'ADMIN';
  twitterId: string | null;
  youtubeId: string | null;
  telegramId: string | null;
  tiktokId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserRole = 'USER' | 'ADMIN';

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

export interface UserWithTokens extends User {
  fanTokens: Array<{
    id: string;
    token: {
      id: string;
      evmAddress: string;
      name: string;
      symbol: string;
      clubName: string | null;
    };
    balance: string;
  }>;
}

class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { evmAddress: input.evmAddress },
    });

    if (existingUser) {
      throw new Error('User with this EVM address already exists');
    }

    // Check if the EVM address is in the admin list
    const isAdmin = await this.isAdminAddress(input.evmAddress);
    
    // Validate tiktokId if provided
    if (input.tiktokId) {
      const tiktokProfile = await prisma.tiktokProfile.findUnique({
        where: { id: input.tiktokId },
      });
      
      if (!tiktokProfile) {
        throw new Error('Invalid TikTok profile ID');
      }
    }

    const user = await prisma.user.create({
      data: {
        evmAddress: input.evmAddress,
        role: isAdmin ? 'ADMIN' : 'USER',
        twitterId: input.twitterId,
        youtubeId: input.youtubeId,
        telegramId: input.telegramId,
        tiktokId: input.tiktokId,
      },
    });

    return user;
  }

  async getUserByEvmAddress(evmAddress: string): Promise<UserWithTokens | null> {
    const user = await prisma.user.findUnique({
      where: { evmAddress },
      include: {
        fanTokens: {
          include: {
            token: true,
          },
        },
        tiktokProfile: true,
      },
    });

    return user;
  }

  async getUserById(id: string): Promise<UserWithTokens | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        fanTokens: {
          include: {
            token: true,
          },
        },
        tiktokProfile: true,
      },
    });

    return user;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    // Validate tiktokId if provided
    if (input.tiktokId) {
      const tiktokProfile = await prisma.tiktokProfile.findUnique({
        where: { id: input.tiktokId },
      });
      
      if (!tiktokProfile) {
        throw new Error('Invalid TikTok profile ID');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: input,
    });

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async isAdminAddress(evmAddress: string): Promise<boolean> {
    const adminAddress = await prisma.adminAddress.findUnique({
      where: { evmAddress, isActive: true },
    });

    return !!adminAddress;
  }

  async addAdminAddress(evmAddress: string): Promise<void> {
    await prisma.adminAddress.upsert({
      where: { evmAddress },
      update: { isActive: true },
      create: { evmAddress, isActive: true },
    });

    // Update user role if user exists
    const user = await prisma.user.findUnique({
      where: { evmAddress },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }
  }

  async removeAdminAddress(evmAddress: string): Promise<void> {
    await prisma.adminAddress.update({
      where: { evmAddress },
      data: { isActive: false },
    });

    // Update user role if user exists
    const user = await prisma.user.findUnique({
      where: { evmAddress },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'USER' },
      });
    }
  }

  async addFanToken(userId: string, tokenEvmAddress: string, balance: string): Promise<void> {
    // Find or create the fan token
    let fanToken = await prisma.fanToken.findUnique({
      where: { evmAddress: tokenEvmAddress },
    });

    if (!fanToken) {
      // For now, create a basic fan token. In production, you'd fetch token details from blockchain
      fanToken = await prisma.fanToken.create({
        data: {
          evmAddress: tokenEvmAddress,
          name: `Token ${tokenEvmAddress.slice(0, 6)}...`,
          symbol: 'FAN',
        },
      });
    }

    // Add or update user's fan token balance
    await prisma.userFanToken.upsert({
      where: {
        userId_tokenId: {
          userId,
          tokenId: fanToken.id,
        },
      },
      update: { balance },
      create: {
        userId,
        tokenId: fanToken.id,
        balance,
      },
    });
  }

  async removeFanToken(userId: string, tokenEvmAddress: string): Promise<void> {
    const fanToken = await prisma.fanToken.findUnique({
      where: { evmAddress: tokenEvmAddress },
    });

    if (fanToken) {
      await prisma.userFanToken.delete({
        where: {
          userId_tokenId: {
            userId,
            tokenId: fanToken.id,
          },
        },
      });
    }
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

  verifyJWT(token: string): { userId: string; evmAddress: string; role: UserRole } {
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
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          fanTokens: {
            include: {
              token: true,
            },
          },
          tiktokProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }
}

export const userService = new UserService();