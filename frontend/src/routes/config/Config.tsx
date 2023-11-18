import Toggle from 'react-toggle';
import { ChangeEvent, useState } from 'react';
import 'react-toggle/style.css';
import { Disclosure, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useGetApi } from '../../controller/Hooks';
import { ModuleDetails, UserConfig } from '../../types';

type ModuleProps = {
    name: string;
    description: string;
    isEnabled: boolean;
    commands: string[];
    hasAdditionalConfig?: boolean;
    configPath?: string;
};

const modules: ModuleProps[] = [
    {
        name: 'Commands',
        description: 'Have Ceejus respond to custom commands in your chat',
        isEnabled: true,
        commands: [],
        // hasAdditionalConfig: true,
        // configPath: './economy',
    },
    {
        name: 'Quotes',
        description:
            'Let viewers quote memorable things said on stream or in chat, into a shared community database',
        isEnabled: true,
        commands: ['quote'],
    },
    {
        name: 'Economy',
        description:
            'Run an economy in your chat and Discord server with Ceejus. Viewers can exchange channel points for currency, gamble their currency, and more!',
        isEnabled: false,
        commands: ['money', 'gamble'],
        hasAdditionalConfig: true,
        configPath: './economy',
    },
];

const ModuleConfig = ({
    name,
    description,
    isEnabled,
    commands,
    hasAdditionalConfig,
    configPath,
}: ModuleProps) => {
    const [enabled, setEnabled] = useState(isEnabled);

    const updateEnabled = (event: ChangeEvent<HTMLInputElement>) => {
        setEnabled(event.target.checked);
    };
    return (
        <Disclosure>
            {({ open }) => (
                <div className="w-4/5 rounded-md bg-gray-500 text-white shadow-lg">
                    <div className="flex py-3 pr-4 text-xl shadow-lg">
                        <div className="flex items-center pl-2">
                            <Toggle
                                checked={enabled}
                                onChange={updateEnabled}
                            />
                        </div>
                        <Disclosure.Button className="flex w-full items-center">
                            <span className="grow font-bold">{name}</span>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={`${
                                    open ? 'rotate-180' : ''
                                } transition-all duration-500`}
                            />
                        </Disclosure.Button>
                    </div>
                    <Transition
                        enter="transition-all duration-500 ease-in-out"
                        enterFrom="max-h-0"
                        enterTo="max-h-36"
                        leave="transition-all duration-500 ease-in-out"
                        leaveFrom="max-h-36"
                        leaveTo="max-h-0 border-none"
                    >
                        <Disclosure.Panel className="flex flex-col justify-center border-t border-t-slate-700 px-4 pb-3 pt-2 text-sm">
                            <div className="pb-3">{description}</div>
                            <div className="flex ">
                                {commands.length > 0 && (
                                    <div>
                                        <div className="text-xl font-medium">
                                            Commands
                                        </div>
                                        <div>
                                            <div className="">
                                                {commands
                                                    .map(
                                                        (command) =>
                                                            `!${command}`,
                                                    )
                                                    .join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="grow" />
                                <div className="flex items-center">
                                    {hasAdditionalConfig && configPath && (
                                        <Link
                                            to={configPath}
                                            className="rounded-md bg-blue-200 p-2 text-gray-700"
                                        >
                                            Module Configuration
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    );
};

const Config = () => {
    const {
        data: userConfig,
        error,
        isLoading,
    } = useGetApi<UserConfig>('/api/config');

    if (isLoading) return null;
    if (error || !userConfig)
        return <div>Error loading configuration data</div>;

    console.log(userConfig);

    return (
        <div className="flex flex-col items-center justify-center gap-y-4">
            <div className="text-3xl">Modules</div>
            {userConfig.config.map((configEntry) => (
                <ModuleConfig
                    key={configEntry.module.name}
                    name={configEntry.module.name}
                    description={configEntry.module.description}
                    isEnabled={configEntry.module.isEnabled}
                    commands={configEntry.module.commands}
                    hasAdditionalConfig={configEntry.module.hasAdditionalConfig}
                    configPath={`./${configEntry.module.name.toLowerCase()}`}
                />
            ))}
        </div>
    );
};

export default Config;
