import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // Tracks login status
  const [userInfo, setUserInfo] = useState(null); // Stores logged-in user details

  const handleLogin = (userData) => {
    setUserInfo(userData); // Store user details
    setLoggedIn(true); // Set logged-in status
  };

  const handleLogout = () => {
    setUserInfo(null); // Clear user details
    setLoggedIn(false); // Set logged-out status
  };

  return (
    <div>
      <div style={{ textAlign: 'right', padding: '10px' }}>
        {!loggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
      {loggedIn && <Dashboard user={userInfo} />} {/* Pass user info to Dashboard */}
    </div>
  );
}

export default App;
