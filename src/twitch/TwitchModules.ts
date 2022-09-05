import _ from 'lodash';
import { HandlerDelegate } from '../modules/Modules';
import { db } from '../System';

const paramRegex = /(?:\$param(?<index>\d*))/g;

export const handleCommand: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
): Promise<string> => {
    // standard text commands
    const commandName = commandParts.shift();
    const response = db.prepare('select output from commands where command_string=?').get(commandName);
    if (response === undefined) return ''; // invalid command
    // parse argument based commands
    let success = true;
    const parsed = response.output.replaceAll(paramRegex, (match: string, p1: string) => {
        if (p1 === 'undefined') {
            success = false;
        }
        return commandParts[_.toNumber(p1) + 1];
    });
    if (success) {
        return parsed;
    }
    return `@${sender} incorrect syntax for command ${commandName}`;
};

export default {};
