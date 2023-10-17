import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const AppBar = () => {
    const { user } = useContext(UserContext).state;
    console.log(user?.avatar);
    return (
        <div className="flex grow bg-green-500 p-2 text-white">
            <div className="grow" />
            <div className="pr-3 text-white">
                {user && (
                    <div className="flex items-center">
                        <div className="pr-2">{user.username}</div>
                        <img
                            className="h-8 w-8"
                            src={user.avatar}
                            alt="user avatar"
                        />
                    </div>
                )}
                {!user && <a href="/api/auth/twitch/doauth">Log In</a>}
            </div>
        </div>
    );
};

export default AppBar;
