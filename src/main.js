const Database = require('better-sqlite3');
const fs = require('fs');
const { DiscordBot } = require('./discord/DiscordBot');
const TwitchBot = require('./twitch/TwitchBot');
require('dotenv').config();

const db = new Database('database.db', { verbose: console.log });

const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

const twitchBot = new TwitchBot.TwitchBot(db);
twitchBot.setupDb(db);
const discordBot = new DiscordBot(db);

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
