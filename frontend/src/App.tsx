import React, { useContext, useEffect } from 'react';
import './App.css';
import { UserContext, UserContextProvider } from './contexts/UserContext';
import AppShell from './components/app/AppShell';

function App() {
    const { update } = useContext(UserContext);

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
    return (
        <div className="dark h-screen">
            <AppShell />
        </div>
    );
}

const AppWrapper = () => (
    <UserContextProvider>
        <App />
    </UserContextProvider>
);

export default AppWrapper;
