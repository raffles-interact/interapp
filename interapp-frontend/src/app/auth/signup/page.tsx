'use client';
import { useState, useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';

export default function SignUp() {
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { registerUserAccount } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!userId || !email || !username || !password) {
      return;
    }
    if (Number.isNaN(Number(userId))) {
      return;
    }
    const id = Number(userId);

    await registerUserAccount({ userId: id, email, username, password });
  };
  return (
    <div>
      <input
        type='text'
        placeholder='user id'
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type='text'
        placeholder='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
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
    </div>
  );
}
