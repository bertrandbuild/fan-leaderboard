import { Request, Response } from 'express';
import { userService } from '../services/user';
import {
  userCreateRequestSchema,
  userUpdateRequestSchema,
  userRoleUpdateRequestSchema,
  fanTokenValidationRequestSchema,
  userQuerySchema,
  userIdParamSchema,
  evmAddressParamSchema,
  sanitizeEvmAddress,
  type UserCreateRequestInput,
  type UserUpdateRequestInput,
  type UserRoleUpdateRequestInput,
  type FanTokenValidationRequestInput,
  type UserQueryInput,
  type UserIdParamInput,
  type EvmAddressParamInput,
} from '../middlewares/user.schema';
import { IApiErrorResponse } from '../types';

export const userController = {
  /**
   * POST /api/users
   * Create a new user profile
   */
  createUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const parse = userCreateRequestSchema.safeParse(req.body);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const user = await userService.createUserProfile(parse.data);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        const code = error.message.includes('already exists') ? 409 : 500;
        errorResponse = {
          status: 'error',
          code,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(errorResponse.code).json(errorResponse);
    }
  },

  /**
   * GET /api/users/:id
   * Get user profile by ID
   */
  getUserById: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = userIdParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid user ID',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const user = await userService.getUserById(paramParse.data.id);
      if (!user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 404,
          message: 'User not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/users/address/:address
   * Get user profile by EVM address
   */
  getUserByEvmAddress: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = evmAddressParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid EVM address',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const user = await userService.getUserByEvmAddress(paramParse.data.address);
      if (!user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 404,
          message: 'User not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user by EVM address:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/users/:id/tiktok-profile
   * Get user TikTok profile data
   */
  getUserTikTokProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = userIdParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid user ID',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const profile = await userService.getUserTikTokProfile(paramParse.data.id);
      if (!profile) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 404,
          message: 'User not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json(profile);
    } catch (error) {
      console.error('Error getting user profile:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * PUT /api/users/:id
   * Update user profile
   */
  updateUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = userIdParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid user ID',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const parse = userUpdateRequestSchema.safeParse(req.body);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const user = await userService.updateUserProfile(paramParse.data.id, parse.data);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 : 500;
        errorResponse = {
          status: 'error',
          code,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(errorResponse.code).json(errorResponse);
    }
  },

  /**
   * DELETE /api/users/:id
   * Delete user profile
   */
  deleteUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = userIdParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid user ID',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      await userService.deleteUser(paramParse.data.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 : 500;
        errorResponse = {
          status: 'error',
          code,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(errorResponse.code).json(errorResponse);
    }
  },

  /**
   * GET /api/users
   * List users with pagination
   */
  listUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const parse = userQuerySchema.safeParse(req.query);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid query parameters',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const { page, limit, role } = parse.data;
      const result = await userService.listUsers(page, limit, role);
      res.json(result);
    } catch (error) {
      console.error('Error listing users:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * PUT /api/users/:id/role
   * Update user role
   */
  updateUserRole: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = evmAddressParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid EVM address',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const parse = userRoleUpdateRequestSchema.safeParse(req.body);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const user = await userService.updateUserRole(paramParse.data.address, parse.data.role);
      res.json(user);
    } catch (error) {
      console.error('Error updating user role:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 : 500;
        errorResponse = {
          status: 'error',
          code,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(errorResponse.code).json(errorResponse);
    }
  },

  /**
   * GET /api/users/club-admins
   * List club admins
   */
  listClubAdmins: async (req: Request, res: Response): Promise<void> => {
    try {
      const admins = await userService.listClubAdmins();
      res.json({
        club_admins: admins,
        total_count: admins.length,
      });
    } catch (error) {
      console.error('Error listing club admins:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },
}; 