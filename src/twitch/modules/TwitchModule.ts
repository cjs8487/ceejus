import { HandlerDelegate } from '../../modules/Modules';

export type TwitchModule = {
    name: string;
    key: string;
    supportsArbitraryCommands?: boolean;
    arbitraryDelegate?: HandlerDelegate;
    commandHandlers: Map<string, HandlerDelegate>;
};
