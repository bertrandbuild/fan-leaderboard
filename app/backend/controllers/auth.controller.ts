import { Request, Response } from 'express';
import { IApiErrorResponse } from '../types';

/**
 * Login controller
 * @param req - The request object
 * @param res - The response object
 */
export const authController = {
  login: async (req: Request, res: Response) => {
    const { id, password } = req.body;
    if (id === 'hello' && password === 'world') {
      res.json({ success: true });
    }
    const errorResponse: IApiErrorResponse = {
      status: 'error',
      code: 401,
      message: 'Invalid credentials',
    };
    res.status(401).json(errorResponse);
  },
};
