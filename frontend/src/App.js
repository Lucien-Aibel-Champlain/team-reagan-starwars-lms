import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // Tracks login status
  const [userID, setUserID] = useState(null); // Stores logged-in user details

  const handleLogin = (loginUserID) => {
    setUserID(loginUserID); // Store user details
    setLoggedIn(true); // Set logged-in status
  };

  const handleLogout = () => {
    setUserID(null); // Clear user details
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
      {loggedIn && <Dashboard user={userID} />} {/* Pass user info to Dashboard */}
    </div>
  );
}

export default App;
