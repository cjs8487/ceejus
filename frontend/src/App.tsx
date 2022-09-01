import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

function App() {
    const location = useLocation();
        const [username, setUsername] = useState<string>();
        useEffect(() => {
            const checkStatus = async () => {
                const hasSession = await fetch('/api/me', {
                    credentials: 'same-origin'
                });
                const { userId, username: sessionUsername } = JSON.parse(await hasSession.text());
                if (userId && sessionUsername) {
                    setUsername(sessionUsername)
                }
            }
            const authorize = async (code: string) => {
                const response = await fetch('/api/auth/twitch/authorized', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        code
                    })
                });
                console.log(response.headers)
                const sessionValue = await fetch('/api/me', {
                    credentials: 'same-origin'
                });
                console.log(sessionValue);
            } 
            const token = new URLSearchParams(location.search);
            const code = token.get('code');
            const scope = token.get('scope');
            const state = token.get('state');
            if (code) {
                console.log('authorizing')
                authorize(code);
            } else {
                checkStatus();
            }
        }, [location.search])
    return (
        <div className="App">
        <header className="App-header">
            { !username &&
                <a href="https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=sgfaaq3ny118n9rcw74jd54ig5qozf&redirect_uri=http://localhost:3000&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls+channel:manage:redemptions">
                Authorize with Twitch
                </a>
            }
            {
                username &&
                <h1>Welcome, {username}</h1>
            }
        </header>
        </div>
    );
}

export default App;
