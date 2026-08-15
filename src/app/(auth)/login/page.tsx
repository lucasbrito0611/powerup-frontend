import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: "PowerUP - Login", 
};

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}