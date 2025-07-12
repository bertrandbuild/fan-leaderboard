import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { IApiErrorResponse } from '../types';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        evmAddress: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Authorization header is required',
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Bearer token is required',
      });
      return;
    }

    const decoded = userService.verifyJWT(token);
    
    // Verify user still exists
    const user = await userService.getUserById(decoded.userId);
    
    if (!user) {
      res.status(401).json({
        status: 'error',
        code: 401,
        message: 'User not found',
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      evmAddress: decoded.evmAddress,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Invalid or expired token',
    });
  }
};

export const requireAuth = authenticate;

export const requireAdmin = async (
  req: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // First authenticate
    await authenticate(req, res, () => {});
    
    if (!req.user) {
      return; // authenticate already sent error response
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Admin access required',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

export const requireOwnershipOrAdmin = async (
  req: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // First authenticate
    await authenticate(req, res, () => {});
    
    if (!req.user) {
      return; // authenticate already sent error response
    }

    const targetUserId = req.params.userId || req.params.id;
    
    // Allow if user is admin or owns the resource
    if (req.user.role === 'ADMIN' || req.user.userId === targetUserId) {
      next();
      return;
    }

    res.status(403).json({
      status: 'error',
      code: 403,
      message: 'You can only access your own profile or need admin privileges',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      next();
      return;
    }

    const decoded = userService.verifyJWT(token);
    
    // Verify user still exists
    const user = await userService.getUserById(decoded.userId);
    
    if (user) {
      req.user = {
        userId: decoded.userId,
        evmAddress: decoded.evmAddress,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};