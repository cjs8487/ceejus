import fs from 'fs';
import Database, { Database as DB } from 'better-sqlite3';
import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { testing, twitchClientId, twitchClientSecret, twitchAuthToken, ngrokUrl, secret } from './Environment';
import UserManager from './database/UserManager';
import { EconomyRedemptionsManager } from './database/EconomyRedemptionsManager';
import { RedemptionsManager } from './database/RedemptionsManager';
import TokenManager from './auth/TokenManager';
import TwitchEventSubHandler from './lib/TwitchEventSub';
import EconomyManager from './database/EconomyManager';

// set up the databse
// the setup script will run everytime the bot starts.
// Take care that it will not overwrite data and will always work or the bot may not start
// eslint-disable-next-line import/no-mutable-exports
export let db: DB;
if (testing) {
    db = new Database('database.db', { verbose: console.log });
} else {
    db = new Database('database.db');
}
const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

// Ensure that the database connection is closed when the process terminates
process.on('exit', () => db.close());

const botAuthProvider = new StaticAuthProvider(twitchClientId, twitchAuthToken, undefined, 'app');
const apiClient = new ApiClient({ authProvider: botAuthProvider });

export const userManager = new UserManager(db);
export const economyRedemptionsManager = new EconomyRedemptionsManager(db);
export const redemptionsManager = new RedemptionsManager(db);
export const tokenManager = new TokenManager(twitchClientId, twitchClientSecret, userManager);
export const eventSubManager =
    new TwitchEventSubHandler(twitchClientId, apiClient, secret, botAuthProvider, ngrokUrl);
export const economyManager = new EconomyManager(db);
