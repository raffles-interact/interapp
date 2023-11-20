'use client';
import { useState, useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, logout } = useContext(AuthContext);

  const handleLogin = async () => {
    await login({ username, password });
  };
  return (
    <div>
      <input
        type='text'
        placeholder='username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
