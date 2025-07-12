import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user';
import { sanitizeEvmAddress } from './user.schema';
import { IApiErrorResponse, IUser, IAuthContext } from '../types';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: IAuthContext;
    }
  }
}

/**
 * Basic authentication middleware
 * For now, this is a simple implementation that checks for an EVM address header
 * In production, this would integrate with a proper authentication system
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get EVM address from header or query parameter
    const evmAddress = req.headers['x-evm-address'] as string || req.query.evm_address as string;
    
    if (!evmAddress) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 401,
        message: 'Authentication required. Please provide EVM address in x-evm-address header.',
      };
      res.status(401).json(error);
      return;
    }

    const sanitizedAddress = sanitizeEvmAddress(evmAddress);
    const user = await userService.getUserByEvmAddress(sanitizedAddress);

    if (!user) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 401,
        message: 'User not found. Please create an account first.',
      };
      res.status(401).json(error);
      return;
    }

    // Set user context
    req.user = {
      user,
      role: user.role,
      is_authenticated: true,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    const errorResponse: IApiErrorResponse = {
      status: 'error',
      code: 500,
      message: 'Authentication failed',
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Authorization middleware for user profile updates
 * Users can only update their own profiles
 */
export const authorizeProfileUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.is_authenticated) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 401,
        message: 'Authentication required',
      };
      res.status(401).json(error);
      return;
    }

    const userId = req.params.id;
    const currentUser = req.user.user;

    if (!currentUser || !userId) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 400,
        message: 'Invalid request parameters',
      };
      res.status(400).json(error);
      return;
    }

    // Users can update their own profile
    if (currentUser.id === userId) {
      next();
      return;
    }

    // Otherwise, unauthorized
    const error: IApiErrorResponse = {
      status: 'error',
      code: 403,
      message: 'Unauthorized. You can only update your own profile.',
    };
    res.status(403).json(error);
  } catch (error) {
    console.error('Authorization error:', error);
    const errorResponse: IApiErrorResponse = {
      status: 'error',
      code: 500,
      message: 'Authorization failed',
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Authorization middleware for club admin operations
 * Only club admins can perform these operations
 */
export const authorizeClubAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.is_authenticated) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 401,
        message: 'Authentication required',
      };
      res.status(401).json(error);
      return;
    }

    const currentUser = req.user.user;

    if (!currentUser || currentUser.role !== 'club_admin') {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 403,
        message: 'Unauthorized. Club admin privileges required.',
      };
      res.status(403).json(error);
      return;
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    const errorResponse: IApiErrorResponse = {
      status: 'error',
      code: 500,
      message: 'Authorization failed',
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Authorization middleware for user deletion
 * Users can delete their own account, club admins can delete any account
 */
export const authorizeUserDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.is_authenticated) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 401,
        message: 'Authentication required',
      };
      res.status(401).json(error);
      return;
    }

    const userId = req.params.id;
    const currentUser = req.user.user;

    if (!currentUser || !userId) {
      const error: IApiErrorResponse = {
        status: 'error',
        code: 400,
        message: 'Invalid request parameters',
      };
      res.status(400).json(error);
      return;
    }

    // Users can delete their own account
    if (currentUser.id === userId) {
      next();
      return;
    }

    // Club admins can delete any account
    if (currentUser.role === 'club_admin') {
      next();
      return;
    }

    // Otherwise, unauthorized
    const error: IApiErrorResponse = {
      status: 'error',
      code: 403,
      message: 'Unauthorized. You can only delete your own account.',
    };
    res.status(403).json(error);
  } catch (error) {
    console.error('Authorization error:', error);
    const errorResponse: IApiErrorResponse = {
      status: 'error',
      code: 500,
      message: 'Authorization failed',
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Optional authentication middleware
 * Does not require authentication, but sets user context if available
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const evmAddress = req.headers['x-evm-address'] as string || req.query.evm_address as string;
    
    if (evmAddress) {
      const sanitizedAddress = sanitizeEvmAddress(evmAddress);
      const user = await userService.getUserByEvmAddress(sanitizedAddress);

      if (user) {
        req.user = {
          user,
          role: user.role,
          is_authenticated: true,
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue without authentication for optional middleware
    next();
  }
}; 