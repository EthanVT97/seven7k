import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
    status?: number;
}

export const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);

    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong!';

    res.status(status).json({
        error: true,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}; 