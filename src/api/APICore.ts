import { NextFunction, Request, Response } from 'express';

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (req.session.user) next();
    else res.sendStatus(401);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
    req.session.user = undefined;
    req.session.save((err) => {
        if (err) next(err);

        req.session.destroy((destErr) => {
            if (destErr) next(destErr);

            res.sendStatus(200);
        });
    });
};
