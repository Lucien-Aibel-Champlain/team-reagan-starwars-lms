import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fetch the employee's name and role from the database
    const res = await fetch('http://localhost:5000/getEmployeeDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }), // Send the userID (email) to the backend
    });

    if (res.ok) {
      const data = await res.json();

      // Continue with the login process
      const loginRes = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        // Pass the name, role, and userID to the parent component
        onLogin({  name: data.name, role: data.role, employeeID: data.employeeID, adminBool: data.adminBool});
      } else {
        alert('Invalid credentials');
      }
    } else {
      alert('User not found in the database');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
