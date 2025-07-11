import { Request, Response } from 'express';
import { config } from '../config/index';
import { LettaError } from '@letta-ai/letta-client/errors';

/**
 * Global error handler
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 */
export function errorHandler(err: any, _req: Request, res: Response) {
  if (config.env !== 'test') {
    console.error('Unhandled error: ', err);
  }
  if (err instanceof LettaError) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      code: err.statusCode || 500,
      message: err.message,
    });
  } else {
    res.status(err.statusCode || 500).json({
      status: 'error',
      code: err.statusCode || 500,
      message: err.message || 'Internal Server Error',
      ...(err.details && { details: err.details }),
    });
  }
}
