import React, { useContext, useEffect } from 'react';
import './App.css';
import { UserContext, UserContextProvider } from './contexts/UserContext';
import Home from './routes/Home';

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
    });
    return (
        <div>
            <Home />
        </div>
    );
}

const AppWrapper = () => (
    <UserContextProvider>
        <App />
    </UserContextProvider>
);

export default AppWrapper;
