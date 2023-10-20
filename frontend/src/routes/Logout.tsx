import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const Logout = () => {
    const {
        state: { loggedIn },
        update,
    } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            if (loggedIn) {
                const res = await fetch('/api/logout');
                if (res.ok) {
                    update({ loggedIn: false, user: undefined });
                    navigate('/');
                } else if (res.status === 401) {
                    update({ loggedIn: false, user: undefined });
                    navigate('/');
                } else {
                    console.error('ERROR UNABLE TO LOG OUT');
                }
            }
        };
        logout();
    });
    return null;
};

export default Logout;
