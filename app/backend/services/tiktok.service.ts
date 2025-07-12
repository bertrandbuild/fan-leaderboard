import { prisma } from './database';

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

type TiktokProfile = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  followers: number;
  following: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

class TiktokService {
  async createTiktokProfile(input: CreateTiktokProfileInput): Promise<TiktokProfile> {
    // Check if profile already exists
    const existingProfile = await prisma.tiktokProfile.findUnique({
      where: { username: input.username },
    });

    if (existingProfile) {
      throw new Error('TikTok profile with this username already exists');
    }

    const profile = await prisma.tiktokProfile.create({
      data: {
        username: input.username,
        displayName: input.displayName,
        bio: input.bio,
        followers: input.followers || 0,
        following: input.following || 0,
        verified: input.verified || false,
      },
    });

    return profile;
  }

  async getTiktokProfileById(id: string): Promise<TiktokProfile | null> {
    const profile = await prisma.tiktokProfile.findUnique({
      where: { id },
    });

    return profile;
  }

  async getTiktokProfileByUsername(username: string): Promise<TiktokProfile | null> {
    const profile = await prisma.tiktokProfile.findUnique({
      where: { username },
    });

    return profile;
  }

  async updateTiktokProfile(id: string, input: UpdateTiktokProfileInput): Promise<TiktokProfile> {
    const profile = await prisma.tiktokProfile.update({
      where: { id },
      data: input,
    });

    return profile;
  }

  async deleteTiktokProfile(id: string): Promise<void> {
    await prisma.tiktokProfile.delete({
      where: { id },
    });
  }

  async getAllTiktokProfiles(page: number = 1, limit: number = 10): Promise<{
    profiles: TiktokProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [profiles, total] = await Promise.all([
      prisma.tiktokProfile.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tiktokProfile.count(),
    ]);

    return {
      profiles,
      total,
      page,
      limit,
    };
  }

  async searchTiktokProfiles(query: string, page: number = 1, limit: number = 10): Promise<{
    profiles: TiktokProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [profiles, total] = await Promise.all([
      prisma.tiktokProfile.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { displayName: { contains: query } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tiktokProfile.count({
        where: {
          OR: [
            { username: { contains: query } },
            { displayName: { contains: query } },
          ],
        },
      }),
    ]);

    return {
      profiles,
      total,
      page,
      limit,
    };
  }

  async getTiktokProfileWithUsers(id: string): Promise<TiktokProfile & { users: any[] } | null> {
    const profile = await prisma.tiktokProfile.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            evmAddress: true,
            role: true,
            twitterId: true,
            youtubeId: true,
            telegramId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return profile;
  }
}

export const tiktokService = new TiktokService();