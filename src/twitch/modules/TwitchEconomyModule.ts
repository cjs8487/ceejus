import EconomyCore from 'src/modules/economy/EconomyCore';
import { BotModule } from '../../modules/BotModule';

class TwitchEconomyModule extends BotModule {
    core: EconomyCore;

    constructor(core: EconomyCore) {
        super(['gamble', 'money']);
        this.core = core;
    }

    // eslint-disable-next-line class-methods-use-this
    handleCommand(commandParts: string[], sender: string, mod: boolean): string {
        const command = commandParts[0];
        if (command === 'money') {
            return `${this.core.getCurrency(sender)}`;
        }
        return '';
    }
}

export default TwitchEconomyModule;
