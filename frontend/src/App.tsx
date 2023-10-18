import React, { useContext, useEffect } from 'react';
import './App.css';
import { UserContext, UserContextProvider } from './contexts/UserContext';
import AppShell from './components/app/AppShell';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './routes/Login';
import Logout from './routes/Logout';

function App() {
    const {
        update,
        state: { loggedIn },
    } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkStatus = async () => {
            const hasSession = await fetch('/api/me', {
                credentials: 'same-origin',
            });
            if (hasSession.ok) {
                const userData = await hasSession.json();
                update({ loggedIn: true, user: userData });
            } else {
                update({ loggedIn: false, user: undefined });
            }
        };
        checkStatus();
    }, [update]);

    if (!loggedIn && location.pathname !== '/login') {
        navigate('/login');
        return null;
    }

    if (loggedIn && location.pathname === '/login') {
        navigate('/');
        return null;
    }

    return (
        <div className="dark h-screen">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/*" element={<AppShell />} />
            </Routes>
        </div>
    );
}

const AppWrapper = () => (
    <UserContextProvider>
        <App />
    </UserContextProvider>
);

export default AppWrapper;
