import { Client, GatewayIntentBits } from 'discord.js';
import { logInfo } from '../Logger';
import { discordToken, testing } from '../Environment';
import onInteraction from './handlers/Interactionhandler';

/**
 * An IRC bot operating on the Discord platform. This bot can ooperate on the same (or different) database as any of the
 * bots. The bot expects some form of structure to the database - the same structure as is defined in the databse
 * initialization script. Avoid changing what database is used by this bot unless it is completely necessary, and you
 * know what you are doing.
 */
export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

export const initDiscordBot = () => {
    client.once('ready', () => {
        logInfo('Discord module ready and active');
        if (testing) {
            client.user?.setPresence({
                status: 'online',
                activities: [
                    {
                        name: `Test Mode (v${process.env.npm_package_version})`,
                    },
                ],
            });
        } else {
            client.user?.setPresence({
                status: 'online',
                activities: [
                    {
                        name: `Ceejus v${process.env.npm_package_version}`,
                    },
                ],
            });
        }
    });

    client.login(discordToken);
    client.on('interactionCreate', onInteraction);
};
