import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a href="https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=sgfaaq3ny118n9rcw74jd54ig5qozf&redirect_uri=http://localhost:3000&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls&state=c3ab8aa609ea11e793ae92361f002671">
        Authorize with Twitch
        </a>
      </header>
    </div>
  );
}

export default App;
