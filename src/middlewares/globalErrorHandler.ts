import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from '../config/logger';

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    logger.error(err.message, {
        meta: {
            stack: err.stack,
            path: req.path,
            method: req.method,
        },
    });

    const statusCode = err.statusCode || err.status || 500;
    
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            },
        ],
    });
};
