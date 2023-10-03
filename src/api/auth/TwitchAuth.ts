import { NextFunction, Request, Response, Router } from 'express';
import { logError } from '../../Logger';
import {
    apiClient,
    doCodeExchange,
    registerUserAuth,
} from '../../auth/TwitchAuth';
import { getUserByName, registerUser, userExists } from '../../database/Users';

const twitchAuth = Router();

twitchAuth.post(
    '/authorized',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code } = req.body;
            const firstToken = await doCodeExchange(code);
            if (!firstToken) {
                res.status(500).send(
                    'An unknown error ocurred while processing the request. You have not been authorized',
                );
                return;
            }
            registerUserAuth(firstToken);
            const user = await apiClient.users.getAuthenticatedUser(
                firstToken.userId,
            );

            let userId: number;
            if (!userExists(user.displayName)) {
                userId = registerUser(user.displayName, user.id, firstToken);
            } else {
                userId = getUserByName(user.displayName).userId;
            }
            req.session.regenerate((err) => {
                if (err) {
                    next(err);
                    return;
                }
                req.session.user = { userId, username: user.displayName };
                req.session.save((saveErr) => {
                    if (saveErr) {
                        next(saveErr);
                        return;
                    }
                    res.status(200).send('Successfully authorized');
                });
            });
        } catch (e: any) {
            logError(e);
            res.status(500).send(e.message);
        }
    },
);

export default twitchAuth;
