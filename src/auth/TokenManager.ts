import { ApiClient } from '@twurple/api';
import { AccessToken, exchangeCode, RefreshingAuthProvider } from '@twurple/auth';
import UserManager, { User } from 'src/database/UserManager';

class TokenManager {
    clientId: string
    clientSecret: string
    userManager: UserManager;
    authProviders: Map<number, RefreshingAuthProvider>;
    apiClients: Map<number, ApiClient>

    constructor(clientId: string, clientSecret: string, userManager: UserManager) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.userManager = userManager;
        this.authProviders = new Map();
        this.apiClients = new Map();
        this.userManager.getAllUsers().forEach((user: User) => {
            this.registerUser(user.userId, userManager.getAccessToken(user.userId));
        });
    }

    registerUser(user: number, token: AccessToken): void {
        const provider = new RefreshingAuthProvider(
            {
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                onRefresh: (newToken) => {
                    this.userManager.updateAuth(user, newToken);
                },
            },
            token,
        );
        this.authProviders.set(user, provider);
        this.apiClients.set(user, new ApiClient({ authProvider: provider }));
    }

    getApiClient(user: number): ApiClient | undefined {
        return this.apiClients.get(user);
    }

    async getAuthToken(user: number): Promise<AccessToken | null | undefined> {
        return this.authProviders.get(user)?.getAccessToken();
    }

    async exchangeCode(code: string): Promise<AccessToken> {
        return exchangeCode(this.clientId, this.clientSecret, code, 'http://localhost:3000');
    }
}

export default TokenManager;
