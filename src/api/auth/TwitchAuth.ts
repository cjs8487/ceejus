import { NextFunction, Request, Response, Router } from 'express';
import { ApiClient } from '@twurple/api';
import { AccessToken, StaticAuthProvider } from '@twurple/auth';
import { tokenManager, userManager } from '../../System';
import { twitchClientId } from '../../Environment';
import { logError } from '../../Logger';

const twitchAuth = Router();

twitchAuth.post('/authorized', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.body;
        const firstToken: AccessToken | undefined = await tokenManager?.exchangeCode(code);
        if (firstToken === undefined) {
            res.status(500).send('An unknown error courred while processing the request. You have not been authorized');
            return;
        }
        const authProvider = new StaticAuthProvider(twitchClientId, firstToken.accessToken);
        const apiClient = new ApiClient({ authProvider });
        const user = await (apiClient.users.getMe());

        let userId: number;
        if (!userManager.userExists(user.displayName)) {
            userId = userManager.registerUser(user.displayName, user.id, firstToken);
            tokenManager.registerUser(userId, firstToken);
        } else {
            userId = userManager.getUser(user.displayName).userId;
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
});

export default twitchAuth;
