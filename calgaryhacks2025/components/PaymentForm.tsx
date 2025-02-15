"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PaymentForm() {
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !user) return;

    setProcessing(true);

    try {
      // Mock successful payment with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save donation record to Supabase (optional)
      await supabase.from('donations').insert({
        user_id: user.id,
        amount: Number(amount),
        tokens: Number(amount) * 100,
        created_at: new Date().toISOString()
      });
      
      // Direct navigation
      window.location.href = '/projects';
      
    } catch (error) {
      console.error("Payment failed:", error);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md border border-gray-200 hover:border-pink-300 transition-all">
      <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
        Make a Donation
      </h2>
      <form onSubmit={handlePayment} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Donation Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-pink-500 focus:border-transparent
              hover:border-pink-300 transition-all"
              placeholder="0"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You will receive <span className="text-pink-500 font-medium">{amount ? Number(amount) * 100 : 0} WLD</span> tokens
          </p>
        </div>

        <button
          type="submit"
          disabled={processing || !amount}
          className={`w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-rose-400 
          text-white rounded-lg font-semibold transition-all transform hover:scale-105 
          ${processing || !amount ? "opacity-50 cursor-not-allowed" : "hover:from-pink-600 hover:to-rose-500"}`}
        >
          {processing ? "Processing..." : "Complete Donation"}
        </button>
      </form>
    </div>
  );
}
