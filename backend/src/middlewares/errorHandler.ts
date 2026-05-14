import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({ code: status, message: err.message || 'Internal Server Error' });
}; 