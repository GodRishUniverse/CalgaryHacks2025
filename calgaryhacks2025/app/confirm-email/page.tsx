'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ConfirmEmail() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Confirming email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      fetch(`/api/confirm-email?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus('Email confirmed successfully!');
          } else {
            setStatus('Failed to confirm email.');
          }
        })
        .catch(() => {
          setStatus('Failed to confirm email.');
        });
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Email Confirmation</h1>
        <p>{status}</p>
      </div>
    </div>
  );
} 