import Toggle from 'react-toggle';
import { ChangeEvent, useState } from 'react';
import 'react-toggle/style.css';
import { Disclosure, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type ModuleProps = {
    name: string;
    description: string;
    isEnabled: boolean;
};

const modules: ModuleProps[] = [
    {
        name: 'Commands',
        description: 'Have Ceejus respond to custom commands in your chat',
        isEnabled: true,
    },
    {
        name: 'Quotes',
        description:
            'Let viewers quote memorable things said on stream or in chat, into a shared community database',
        isEnabled: true,
    },
    {
        name: 'Economy',
        description:
            'Run an economy in your chat and Discord server with Ceejus. Viewers can exchange channel points for currency, gamble their currency, and more!',
        isEnabled: false,
    },
];

const ModuleConfig = ({ name, description, isEnabled }: ModuleProps) => {
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
                                icon={open ? faChevronDown : faChevronUp}
                            />
                        </Disclosure.Button>
                    </div>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="flex justify-center border-t border-t-slate-700 px-4 pb-3 pt-2 text-sm">
                            {description}
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    );
};

const Config = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-y-4">
            <div className="text-3xl">Modules</div>
            {modules.map((module) => (
                <ModuleConfig
                    name={module.name}
                    description={module.description}
                    isEnabled={module.isEnabled}
                />
            ))}
        </div>
    );
};

export default Config;
