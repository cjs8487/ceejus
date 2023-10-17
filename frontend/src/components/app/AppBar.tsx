import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const AppBar = () => {
    const { user } = useContext(UserContext).state;
    return (
        <div className="flex grow bg-green-500 p-2 text-white">
            <div className="grow" />
            <div className="pr-3 text-white">
                {user && user.username}
                {!user && <a href="/api/auth/twitch/doauth">Log In</a>}
            </div>
        </div>
    );
};

export default AppBar;
