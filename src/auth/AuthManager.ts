import { AccessToken, exchangeCode, RefreshingAuthProvider } from '@twurple/auth';
import UserManager from 'src/database/UserManager';

class AuthManager {
    clientId: string
    clientSecret: string
    userManager: UserManager;
    authProviders: Map<number, RefreshingAuthProvider>;

    constructor(clientId: string, clientSecret: string, userManager: UserManager) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.userManager = userManager;
        this.authProviders = new Map();
    }

    registerUser(user: number, token: AccessToken): void {
        const provider = new RefreshingAuthProvider(
            {
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                onRefresh: (newToken) => this.userManager.updateAuth(user, newToken),
            },
            token,
        );
        this.authProviders.set(user, provider);
    }

    async getAuthToken(user: number): Promise<AccessToken | null | undefined> {
        return this.authProviders.get(user)?.getAccessToken();
    }

    async exchangeCode(code: string): Promise<AccessToken> {
        return exchangeCode(this.clientId, this.clientSecret, code, 'http://localhost:3000');
    }
}

export default AuthManager;
