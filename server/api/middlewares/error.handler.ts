import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';


// eslint-disable-next-line no-unused-vars, no-shadow
export default function errorHandler(err, req: Request, res: Response, next?: NextFunction) {
  const errors = err.errors || [{ message: err.message }];
  return res
    .status(err.status || 500)
    .json({
      status: HttpStatus.getStatusText(err.status),
      errors: errors
    });
}

