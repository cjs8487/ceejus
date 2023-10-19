import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import {
    autoUpdate,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
    useTransitionStyles,
} from '@floating-ui/react';
import { useNavigate } from 'react-router-dom';

const userMenu = [
    {
        label: 'Logout',
        to: '/logout',
    },
];

type UserMenuItemProps = {
    label: string;
    to: string;
};

const UserMenuItem = ({ label, to }: UserMenuItemProps) => {
    const navigate = useNavigate();
    const onClick = () => {
        navigate(to);
    };
    return (
        <div
            role="button"
            className="w-full px-3 py-1 hover:bg-slate-500 hover:bg-opacity-10"
            onClick={onClick}
        >
            {label}
        </div>
    );
};

const AppBar = () => {
    const { user } = useContext(UserContext).state;

    const [menuOpen, setMenuOpen] = useState(false);

    const { refs, context } = useFloating({
        whileElementsMounted: autoUpdate,
        open: menuOpen,
        onOpenChange: setMenuOpen,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'menu' });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss,
        role,
    ]);

    const { isMounted, styles } = useTransitionStyles(context, {
        initial: {
            transform: 'scale(0)',
        },
    });

    return (
        <div className="flex h-14 grow border-b border-solid border-b-gray-200 bg-gray-50 p-2">
            <div className="grow" />
            <div className="pr-3">
                {user && (
                    <>
                        <div
                            className="flex items-center"
                            role="button"
                            ref={refs.setReference}
                            {...getReferenceProps()}
                        >
                            <div className="pr-2">{user.username}</div>
                            <img
                                className="h-8 w-8"
                                src={user.avatar}
                                alt="user avatar"
                            />
                        </div>
                        {isMounted && (
                            <div
                                ref={refs.setFloating}
                                style={styles}
                                className="absolute flex w-max flex-col rounded-lg border border-slate-200 bg-white py-2 shadow-xl"
                                {...getFloatingProps}
                            >
                                {userMenu.map((item) => (
                                    <UserMenuItem
                                        key={item.label}
                                        label={item.label}
                                        to={item.to}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
                {!user && <a href="/api/auth/twitch/doauth">Log In</a>}
            </div>
        </div>
    );
};

export default AppBar;
