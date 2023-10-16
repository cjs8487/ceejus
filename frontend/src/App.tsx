import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>();
    const [rewards, setRewards] = useState<any[]>();
    useEffect(() => {
        const checkStatus = async () => {
            const hasSession = await fetch('/api/me', {
                credentials: 'same-origin',
            });
            const { userId, username: sessionUsername } = JSON.parse(
                await hasSession.text(),
            );
            if (userId && sessionUsername) {
                setUsername(sessionUsername);
                const rewardResposne = await fetch(
                    `/api/rewards/all/${userId}`,
                    {
                        credentials: 'same-origin',
                    },
                );
                setRewards(JSON.parse(await rewardResposne.text()));
            }
        };
        checkStatus();
    }, [location.search, navigate]);
    return (
        <div className="App">
            <header className="App-header">
                {!username && (
                    <a href="/api/auth/twitch/doauth">Authorize with Twitch</a>
                )}
                {username && <h1>Welcome, {username}</h1>}
                {rewards && (
                    <>
                        <h4>Registered Twitch Rewards</h4>
                        <ul>
                            {rewards.map((reward) => (
                                <li>
                                    Twitch ID: {reward.twitchRewardId} Amount:{' '}
                                    {reward.amount}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </header>
        </div>
    );
}

export default App;
