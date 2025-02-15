"use client";

import AuthGuard from "@/components/AuthGuard";
import PaymentForm from "@/components/PaymentForm";

export default function DonatePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <PaymentForm />
        </div>
      </div>
    </AuthGuard>
  );
}
