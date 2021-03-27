const Database = require('better-sqlite3');
const fs = require('fs');
const { DiscordBot } = require('./discord/DiscordBot');
const TwitchBot = require('./twitch/TwitchBot');
require('dotenv').config();

const db = new Database('database.db', { verbose: console.log });

// set up the databse
// the setup script will run everytime the bot starts.
// Take care that it will not overwrite data and will always work or the bot may not start
const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

const twitchBot = new TwitchBot.TwitchBot(db);
twitchBot.setupDb(db);
const discordBot = new DiscordBot(db);

// Ensure that the database connection is closed when the process terminates
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
