import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from 'react-router-dom';

type NavbarRowProps = {
    text: string;
    to: string;
    icon?: IconProp;
};

const NavbarRow = ({ text, to, icon }: NavbarRowProps) => {
    const location = useLocation();
    const prefix = location.pathname === to ? '' : 'hover:';
    return (
        <Link
            role="button"
            className={`py-2 pl-4 pr-6 ${prefix}bg-sky-300 ${prefix}bg-opacity-20 flex items-center gap-x-2`}
            to={to}
        >
            {icon && <FontAwesomeIcon icon={icon} className="w-1/6" />}
            {!icon && <div className="w-1/6" />}
            {text}
        </Link>
    );
};

const items = [
    // { text: 'Dashboard', to: '/dashboard' },
    { text: 'Configuration', to: '/config', icon: faCog },
];

const Navbar = () => (
    <div className="flex h-full flex-col bg-gray-700 text-white">
        <div
            className={`h-14 bg-gray-900 px-8 py-2 font-mono text-3xl font-semibold tracking-widest`}
        >
            Ceejus
        </div>
        {items.map((item) => (
            <NavbarRow
                key={`${item.text}-${item.to}`}
                text={item.text}
                to={item.to}
                icon={item.icon}
            />
        ))}
    </div>
);

export default Navbar;
