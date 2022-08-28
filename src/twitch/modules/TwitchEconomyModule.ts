import { economyManager, userManager } from '../../System';
import { BotModule } from '../../modules/BotModule';

class TwitchEconomyModule extends BotModule {
    constructor() {
        super(['gamble', 'money']);
    }

    // eslint-disable-next-line class-methods-use-this
    handleCommand(commandParts: string[], sender: string, mod: boolean): string {
        const command = commandParts[0];
        if (command === 'money') {
            return `${economyManager.getCurrency(
                userManager.getUser(sender).userId,
                userManager.getUser('cjs0789').userId,
            )}`;
        }
        return '';
    }
}

export default TwitchEconomyModule;
