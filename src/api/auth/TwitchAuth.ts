import { NextFunction, Request, Response, Router } from 'express';
import { ApiClient } from '@twurple/api';
import { AccessToken, StaticAuthProvider } from '@twurple/auth';
import TokenManager from 'src/auth/TokenManager';
import UserManager from 'src/database/UserManager';

const twitchAuth = Router();

let userManager: UserManager;
let tokenManager: TokenManager;
let clientId: string;

twitchAuth.use((req: Request, res: Response, next: NextFunction) => {
    if (userManager === undefined) {
        userManager = req.app.get('userManager');
    }
    if (tokenManager === undefined) {
        tokenManager = req.app.get('tokenManager');
    }
    if (clientId === undefined) {
        clientId = req.app.get('clientId');
    }
    next();
});

twitchAuth.post('/authorized', async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        // console.log(code);
        const firstToken: AccessToken | undefined = await tokenManager?.exchangeCode(code);
        if (firstToken === undefined) {
            res.status(500).send('An unknown error courred while processing the request. You have not been authorized');
            return;
        }
        const authProvider = new StaticAuthProvider(clientId, firstToken.accessToken);
        const apiClient = new ApiClient({ authProvider });
        const user = await (apiClient.users.getMe());

        if (!userManager.userExists(user.displayName)) {
            const userId = userManager.registerUser(user.displayName, user.id, firstToken);
            tokenManager.registerUser(userId, firstToken);
            res.status(200).send('Successfully registered');
        } else {
            res.status(409).send('Already registered');
        }
    } catch (e: any) {
        // console.log(e);
        res.status(500).send(e.message);
    }
});

export default twitchAuth;
