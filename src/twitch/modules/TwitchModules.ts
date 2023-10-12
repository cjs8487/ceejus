import commandsModule from './Commands';
import economyModule from './Economy';
import quotesModule from './Quotes';
import { TwitchModule } from './TwitchModule';

const allModules: TwitchModule[] = [];

export const registerModule = (module: TwitchModule) => {
    allModules.push(module);
};

export const handleCommand = async (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
) => {
    const command = commandParts[0];
    if (!command) return undefined;
    let response: string | undefined;
    // eslint-disable-next-line no-restricted-syntax
    for (const module of allModules) {
        // does this module declaratively handle this command?
        if (module.commandHandlers.has(command)) {
            const handler = module.commandHandlers.get(command);
            if (handler) {
                commandParts.shift();
                // eslint-disable-next-line no-await-in-loop
                response = await handler(
                    commandParts,
                    sender,
                    mod,
                    ...metadata,
                );
                break;
            }
        }
        // does the module handle arbitrary commands (ie it supports a dynamic set of comamnds that changes at runtime)
        if (module.supportsArbitraryCommands) {
            // eslint-disable-next-line no-await-in-loop
            const res = await module.arbitraryDelegate!(
                commandParts,
                sender,
                mod,
                ...metadata,
            );
            if (res) {
                response = res;
                break;
            }
        }
    }
    return response;
};

export const registerAllModules = () => {
    registerModule(quotesModule);
    registerModule(economyModule);
    registerModule(commandsModule);
};
