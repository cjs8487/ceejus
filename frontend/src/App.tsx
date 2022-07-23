import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

function App() {
    const location = useLocation();
        useEffect(() => {
            async function authorize(code: string) {
                const response = await fetch('http://localhost:8080/api/auth/twitch/authorized', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    body: JSON.stringify({
                        code
                    })
                });
                console.log(response)
            }
            const token = new URLSearchParams(location.search);
            const code = token.get('code');
            const scope = token.get('scope');
            const state = token.get('state');
            if (code) {
                console.log('authorizing')
                authorize(code);
            } else {
                console.log('no code')
            }
        })
    return (
        <div className="App">
        <header className="App-header">
            <a href="https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=sgfaaq3ny118n9rcw74jd54ig5qozf&redirect_uri=http://localhost:3000&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls+channel:manage:redemptions">
            Authorize with Twitch
            </a>
        </header>
        </div>
    );
}

export default App;
