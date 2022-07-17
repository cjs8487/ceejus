import { NextFunction, Request, Response, Router } from 'express';
import { ApiClient } from '@twurple/api';
import AuthManager from 'src/auth/AuthManager';
import UserManager from 'src/database/UserManager';
import { AccessToken, StaticAuthProvider } from '@twurple/auth';

const twitchAuth = Router();

let userManager: UserManager;
let authManager: AuthManager;
let clientId: string;

twitchAuth.use((req: Request, res: Response, next: NextFunction) => {
    if (userManager === undefined) {
        userManager = req.app.get('userManager');
    }
    if (authManager === undefined) {
        authManager = req.app.get('authManager');
    }
    if (clientId === undefined) {
        clientId = req.app.get('clientId');
    }
    next();
});

twitchAuth.post('/authorized', async (req: Request, res: Response) => {
    console.log(userManager);
    console.log(authManager);
    console.log(clientId);
    try {
        const { code } = req.body;
        // console.log(code);
        const firstToken: AccessToken | undefined = await authManager?.exchangeCode(code);
        if (firstToken === undefined) {
            res.status(500).send('An unknown error courred while processing the request. You have not been authorized');
            return;
        }
        const authProvider = new StaticAuthProvider(clientId, firstToken.accessToken);
        const apiClient = new ApiClient({ authProvider });
        const user = await (apiClient.users.getMe());

        const userId = userManager.registerUser(user.displayName, firstToken);
        authManager.registerUser(userId, firstToken);
        res.status(200).send('Successfully registered');
    } catch (e: any) {
        // console.log(e);
        res.status(500).send(e.message);
    }
});

export default twitchAuth;
