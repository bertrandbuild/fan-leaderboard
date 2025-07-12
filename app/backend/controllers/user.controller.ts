import { Request, Response } from 'express';
import { userService, CreateUserInput, UpdateUserInput } from '../services/user.service';
import { IApiErrorResponse } from '../types';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format'),
  twitterId: z.string().optional(),
  youtubeId: z.string().optional(),
  telegramId: z.string().optional(),
  tiktokId: z.string().optional(),
});

const updateUserSchema = z.object({
  twitterId: z.string().optional(),
  youtubeId: z.string().optional(),
  telegramId: z.string().optional(),
  tiktokId: z.string().optional(),
});

const addFanTokenSchema = z.object({
  tokenEvmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format'),
  balance: z.string().regex(/^\d+$/, 'Balance must be a valid number string'),
});

const adminAddressSchema = z.object({
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format'),
});

export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const validation = createUserSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: validation.error.issues,
        });
        return;
      }

      const user = await userService.createUser(validation.data);
      const token = userService.generateJWT(user);

      res.status(201).json({
        status: 'success',
        code: 201,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            evmAddress: user.evmAddress,
            role: user.role,
            twitterId: user.twitterId,
            youtubeId: user.youtubeId,
            telegramId: user.telegramId,
            tiktokId: user.tiktokId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { evmAddress } = req.body;
      
      if (!evmAddress || !/^0x[a-fA-F0-9]{40}$/.test(evmAddress)) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Valid EVM address is required',
        });
        return;
      }

      const user = await userService.getUserByEvmAddressWithTokens(evmAddress);
      
      if (!user) {
        res.status(404).json({
          status: 'error',
          code: 404,
          message: 'User not found',
        });
        return;
      }

      const token = userService.generateJWT(user);

      res.json({
        status: 'success',
        code: 200,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            evmAddress: user.evmAddress,
            role: user.role,
            twitterId: user.twitterId,
            youtubeId: user.youtubeId,
            telegramId: user.telegramId,
            tiktokId: user.tiktokId,
            fanTokens: user.fanTokens,
            tiktokProfile: user.tiktokProfile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        status: 'error',
        code: 500,
        message,
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = userService.getUserWithTokensById(req.user!.userId);
      
      if (!user) {
        res.status(404).json({
          status: 'error',
          code: 404,
          message: 'User not found',
        });
        return;
      }

      res.json({
        status: 'success',
        code: 200,
        message: 'Profile retrieved successfully',
        data: {
          id: user.id,
          evmAddress: user.evmAddress,
          role: user.role,
          twitterId: user.twitterId,
          youtubeId: user.youtubeId,
          telegramId: user.telegramId,
          tiktokId: user.tiktokId,
          fanTokens: user.fanTokens,
          tiktokProfile: user.tiktokProfile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        status: 'error',
        code: 500,
        message,
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const validation = updateUserSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: validation.error.issues,
        });
        return;
      }

      const targetUserId = req.params.userId || req.user!.userId;
      const user = await userService.updateUser(targetUserId, validation.data);

      res.json({
        status: 'success',
        code: 200,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          evmAddress: user.evmAddress,
          role: user.role,
          twitterId: user.twitterId,
          youtubeId: user.youtubeId,
          telegramId: user.telegramId,
          tiktokId: user.tiktokId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }

  async addFanToken(req: Request, res: Response): Promise<void> {
    try {
      const validation = addFanTokenSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: validation.error.issues,
        });
        return;
      }

      const targetUserId = req.params.userId || req.user!.userId;
      await userService.addFanToken(
        targetUserId,
        validation.data.tokenEvmAddress,
        validation.data.balance
      );

      res.json({
        status: 'success',
        code: 200,
        message: 'Fan token added successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }

  async removeFanToken(req: Request, res: Response): Promise<void> {
    try {
      const { tokenEvmAddress } = req.params;
      
      if (!tokenEvmAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenEvmAddress)) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Valid token EVM address is required',
        });
        return;
      }

      const targetUserId = req.params.userId || req.user!.userId;
      await userService.removeFanToken(targetUserId, tokenEvmAddress);

      res.json({
        status: 'success',
        code: 200,
        message: 'Fan token removed successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }

  // Admin functions
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await userService.getAllUsers(page, limit);

      res.json({
        status: 'success',
        code: 200,
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        status: 'error',
        code: 500,
        message,
      });
    }
  }

  async addAdminAddress(req: Request, res: Response): Promise<void> {
    try {
      const validation = adminAddressSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: validation.error.issues,
        });
        return;
      }

      await userService.addAdminAddress(validation.data.evmAddress);

      res.json({
        status: 'success',
        code: 200,
        message: 'Admin address added successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }

  async removeAdminAddress(req: Request, res: Response): Promise<void> {
    try {
      const { evmAddress } = req.params;
      
      if (!evmAddress || !/^0x[a-fA-F0-9]{40}$/.test(evmAddress)) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Valid EVM address is required',
        });
        return;
      }

      await userService.removeAdminAddress(evmAddress);

      res.json({
        status: 'success',
        code: 200,
        message: 'Admin address removed successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          status: 'error',
          code: 400,
          message: 'User ID is required',
        });
        return;
      }

      await userService.deleteUser(userId);

      res.json({
        status: 'success',
        code: 200,
        message: 'User deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        status: 'error',
        code: 400,
        message,
      });
    }
  }
}

export const userController = new UserController();