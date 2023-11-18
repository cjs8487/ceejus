import { useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

const Login = () => {
    const { loggedIn } = useContext(UserContext).state;
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedIn) {
            navigate('/s');
        }
    }, [loggedIn, navigate]);
    if (loggedIn) {
        return null;
    }

    return (
        <div className="p-1/2 flex h-full w-full grow items-center bg-slate-700">
            <div className="grow" />
            <div className="flex grow animate-[fadeIn_3s] flex-col items-center gap-y-8 rounded-2xl bg-white py-16 shadow-2xl">
                <span className="border-b border-b-slate-300 px-2 pb-3 font-mono text-4xl font-semibold tracking-widest text-gray-500">
                    Ceejus
                </span>
                <a
                    className="flex items-center justify-center gap-x-2.5 rounded-lg bg-twitch-purple px-4 py-2 text-lg text-white"
                    role="button"
                    href="/api/auth/twitch/doAuth"
                >
                    <FontAwesomeIcon icon={faTwitch} />
                    Sign in with Twitch
                </a>
            </div>
            <div className="grow" />
        </div>
    );
};

export default Login;
