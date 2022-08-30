import { getOrCreateUserName } from '../../util/UserUtils';
import { economyManager, userManager } from '../../System';
import { BotModule } from '../../modules/BotModule';

class TwitchEconomyModule extends BotModule {
    constructor() {
        super(['gamble', 'money']);
    }

    // eslint-disable-next-line class-methods-use-this
    async handleCommand(commandParts: string[], sender: string, mod: boolean, ...metadata: any): Promise<string> {
        const command = commandParts[0];
        if (command === 'money') {
            return `${economyManager.getCurrency(
                await getOrCreateUserName(sender),
                userManager.getUser(metadata[0]).userId,
            )}`;
        }
        return '';
    }
}

export default TwitchEconomyModule;
