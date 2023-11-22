import { db } from '../System';

export enum Module {
    Quotes,
    Commands,
    Economy,
}

const additionalModuleInfo = new Map([
    [
        Module.Quotes,
        {
            description:
                'Let viewers quote memorable things said on stream or in chat, into a shared community database',
            commands: ['quote'],
            // hasAdditionalConfig: true,
        },
    ],
    [
        Module.Commands,
        {
            description: 'Have Ceejus respond to custom commands in your chat',
            commands: [],
        },
    ],
    [
        Module.Economy,
        {
            description:
                'Run an economy in your chat and Discord server with Ceejus. Viewers can exchange channel points ' +
                'for currency, gamble their currency, and more!',
            commands: ['money', 'gamble'],
            hasAdditionalConfig: true,
        },
    ],
]);

export type ModuleDetails = {
    id: number;
    name: string;
    description: string;
    commands: string[];
    hasAdditionalConfig?: boolean;
};

export type ConfigEntry = {
    module: ModuleDetails;
    enabled: boolean;
};

export type UserConfig = {
    userId: number;
    config: ConfigEntry[];
};

const defaultConfig = new Map<Module, boolean>([
    [Module.Quotes, true],
    [Module.Commands, false],
    [Module.Economy, false],
]);

export const createDefaultConfig = (user: number) => {
    defaultConfig.forEach((enabled, module) => {
        db.prepare(
            'insert into config (owner, module, enabled) values (?, ?, ?)',
        ).run(user, module, enabled ? 1 : 0);
    });
};

export const enableModule = (user: number, module: Module) => {
    db.prepare('update config set enabled=? where owner=? and module=?').run(
        1,
        user,
        module,
    );
};

export const disableModule = (user: number, module: Module) => {
    db.prepare('update config set enabled=? where owner=? and module=?').run(
        0,
        user,
        module,
    );
};

export const getUserConfig = (user: number): UserConfig => {
    const entries = db.prepare('select * from config where owner=?').all(user);
    if (!entries || entries.length === 0) {
        createDefaultConfig(user);
        return getUserConfig(user);
    }
    const config: ConfigEntry[] = [];
    entries.forEach((entry) => {
        const details = additionalModuleInfo.get(entry.module);
        config.push({
            module: {
                id: entry.module,
                name: Module[entry.module],
                description: details!.description,
                commands: details!.commands,
                hasAdditionalConfig: details!.hasAdditionalConfig,
            },
            enabled: !!entry.enabled,
        });
    });
    return { userId: user, config };
};

export const getAvailableModules = (): ModuleDetails[] =>
    (
        Object.values(Module).filter(
            (item) => !Number.isNaN(Number(item)),
        ) as Module[]
    ).map((module) => {
        const details = additionalModuleInfo.get(module);
        return {
            id: module,
            name: Module[module],
            description: details!.description,
            commands: details!.commands,
            hasAdditionalConfig: details!.hasAdditionalConfig,
        };
    });
