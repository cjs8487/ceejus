import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient, ChatMessage } from '@twurple/chat';
import fs from 'fs';
import { db } from '../System';
import { User, getAllUsers } from '../database/Users';
import { botOAuthToken, botUsername, twitchClientId } from '../Environment';
// import { MultiTwitch } from './modules/MultiTwitch';
import { isUserMod } from './TwitchUtils';
import { handleCommand, registerAllModules } from './modules/TwitchModules';

// const multiModule = new MultiTwitch();

const channels: string[] = getAllUsers(true).map((user: User) => user.username);
const client = new ChatClient({
    authProvider: new StaticAuthProvider(twitchClientId, botOAuthToken),
    channels,
});

/**
 * Handles an incoming chat messsage
 * @param {*} channel The channel the message was sent in
 * @param {*} user The user who sent the message
 * @param {*} messageText The message that was sent
 */
const onMessageHandler = async (
    channel: string,
    user: string,
    messageText: string,
    message: ChatMessage,
) => {
    if (user === botUsername) {
        return;
    }

    // TODO: TIMED MESSAGE HANDLING

    let commandName = messageText.trim();

    if (!commandName.startsWith('!')) {
        // not a command
        // TODO: MODERATION?
        return;
    }

    const commandParts = messageText.substring(1).split(' ');
    commandName = commandParts[0].toLowerCase();

    const mod = isUserMod(message.userInfo);
    let handled = false;
    const modulesResponse = await handleCommand(
        commandParts,
        user,
        mod,
        channel,
    );
    if (modulesResponse) {
        client.say(channel, modulesResponse);
        handled = true;
    }
    if (handled) return;
    if (commandName === 'addcomm') {
        if (!isUserMod(message.userInfo)) return;
        const newCommand = commandParts[1].toLowerCase();
        const output = commandParts.slice(2).join(' ');
        db.prepare(
            'insert into commands (command_string, output) values (?, ?)',
        ).run(newCommand, output);
        client.say(
            channel,
            `@${user} command !${newCommand} successfully created`,
        );
    } else if (commandName === 'editcomm') {
        if (!isUserMod(message.userInfo)) return;
        const editCommand = commandParts[1].toLowerCase();
        const output = commandParts.slice(2).join(' ');
        db.prepare('update commands set output=? where command_string=?').run(
            output,
            editCommand,
        );
        client.say(
            channel,
            `@${user} command !${editCommand} editted successfully`,
        );
    } else if (commandName === 'deletecomm') {
        if (!isUserMod(message.userInfo)) return;
        const deleteCommand = commandParts[1].toLowerCase();
        db.prepare('delete from commands where command_string=?').run(
            deleteCommand,
        );
        client.say(
            channel,
            `@${user} command !${deleteCommand} deleted sucessfully`,
        );
    } else if (commandName === 'multi') {
        // pass the message on to the quotes bot to handle
        // we remove the !quote because the bot assumes that the message has already been parsed
        // const multiResponse = multiModule.handleCommand(
        //     commandParts.slice(1),
        //     user,
        //     mod,
        // );
        // if (multiResponse === '') {
        //     return;
        // }
        // client.say(channel, `${multiResponse}`);
        // } else if (commandName === 'floha') {
        //     let quote;
        //     if (commandParts.length > 1) {
        //         const quoteNumber = parseInt(commandParts[1], 10);
        //         if (Number.isNaN(quoteNumber)) {
        //             quote = await (
        //                 await fetch(
        // eslint-disable-next-line max-len
        //                   `https://flohabot.bingothon.com/api/quotes/quote?alias=${commandParts.slice(1).join(' ')}`,
        //                 )
        //             ).json();
        //         } else {
        //             quote = await (
        //                 await fetch(`https://flohabot.bingothon.com/api/quotes/quote?quoteNumber=${quoteNumber}`)
        //             ).json();
        //         }
        //     } else {
        //         quote = await (await fetch('https://flohabot.bingothon.com/api/quotes/quote')).json();
        //     }
        //     client.say(channel, `@${user} #${quote.id}: ${quote.quote_text}`);
    } else {
        const response = await handleCommand(commandParts, user, mod);
        if (response) {
            client.say(channel, response);
        }
    }
};

/**
 * Checks the database for existing data and loads the initial dataset if the is no data present
 */
export const setupDb = () => {
    const commands = db.prepare('select * from commands');
    if (commands === undefined) {
        const setupScript = fs.readFileSync(
            'src/twitch/initalCommandSetup.sql',
            'utf-8',
        );
        db.exec(setupScript);
    }
};

export const initTwitchBot = () => {
    registerAllModules();

    client.onMessage(onMessageHandler);
    client.connect();
};
