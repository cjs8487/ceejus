import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const AppBar = () => {
    const { user } = useContext(UserContext).state;
    console.log(user?.avatar);
    return (
        <div className="flex grow border-b border-solid border-b-gray-200 bg-gray-50 p-2">
            <div className="grow" />
            <div className="pr-3">
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
