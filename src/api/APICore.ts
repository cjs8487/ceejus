import { NextFunction, Request, Response } from 'express';

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (req.session.user) next();
    else res.sendStatus(401);
};

export default {};
