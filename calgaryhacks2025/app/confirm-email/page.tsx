"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
          Email Confirmation
        </h1>
        
        {error ? (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        ) : message ? (
          <div className="text-green-500 text-center mb-4">
            {message}
          </div>
        ) : (
          <div className="text-gray-600 text-center mb-4">
            Please check your email to confirm your account.
          </div>
        )}

        <a
          href="/login"
          className="block w-full py-3 text-center bg-gradient-to-r from-pink-500 to-rose-400 
          text-white rounded-lg font-semibold transition-all hover:from-pink-600 hover:to-rose-500"
        >
          Return to Login
        </a>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
} 