"use client";

import AuthForm from "@/components/Auth";
import { Suspense } from "react";

function LoginContent() {
  return <AuthForm />;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
