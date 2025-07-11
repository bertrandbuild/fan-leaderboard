import { Request, Response } from 'express';

/**
 * Not found handler
 * @param req - The request object
 * @param res - The response object
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Not Found',
    details: { method: req.method, url: req.originalUrl },
  });
}
