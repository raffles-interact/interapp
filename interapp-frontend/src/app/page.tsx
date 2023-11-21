'use client';
import Image from 'next/image';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  return (
    <>
      <button onClick={() => router.push('/auth/login')}>Login</button>
      <button onClick={() => router.push('/auth/signup')}>Sign Up</button>
      <button onClick={() => router.push('/protected')}>protec</button>
      {user && (
        <>
          <h1>{user.username}</h1>
          <h2>{user.userId}</h2>
          <h2>{user.email}</h2>
          <h2>{user.permissions}</h2>
          <h3>{user.verified}</h3>
          <h3>{user.serviceHours}</h3>

          <button onClick={logout}>Logout</button>
        </>
      )}
    </>
  );
}
