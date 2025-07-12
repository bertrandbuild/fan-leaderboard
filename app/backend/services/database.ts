import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Create a singleton Prisma client instance
class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('📊 Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('📊 Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection error:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
export const prisma = databaseService.getClient();