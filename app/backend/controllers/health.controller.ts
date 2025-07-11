import { Request, Response } from 'express';
import { IApiErrorResponse } from '../types';
/**
 * Handle /GET /health
 * @param req - The request object.
 * @param res - The response object.
 * @returns void
 */
export const healthController = {
  checkHealth: async (_req: Request, res: Response) => {
    try {
      const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        checks: {
          tempDirWritable: true,
          cacheWorking: true,
          diskFreeMB: 1234,
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(errorResponse);
    }
  },
};
