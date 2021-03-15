const TwitchBot = require('./twitch/TwitchBot');
require('dotenv').config();

const twitchBot = new TwitchBot.TwitchBot();
twitchBot.setupDb();
