"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface MetaMaskError {
  code: number;
  message: string;
}

export default function DonatePage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirect=/donate");
      return;
    }

    setUser(user);

    // Check if user has wallet connected
    const { data } = await supabase
      .from("profiles")
      .select("wallet_address")
      .eq("id", user.id)
      .single();

    if (data?.wallet_address) {
      setWallet(data.wallet_address);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setShowMetaMaskModal(true);
      return;
    }

    try {
      // First handle MetaMask connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];
      
      // Check if we have a user before trying to save to Supabase
      if (!user) {
        console.error("No user found in state");
        throw new Error("No user found");
      }

      try {
        // Separate try-catch for Supabase operation
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          wallet_address: walletAddress,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        // Only set wallet if Supabase update succeeds
        setWallet(walletAddress);
      } catch (supabaseError) {
        console.error("Failed to save wallet to database:", supabaseError);
        alert("Wallet connected but failed to save to profile. Please try again.");
      }

    } catch (error) {
      const metamaskError = error as MetaMaskError;
      if (metamaskError.code === -32002) {
        alert("Please check MetaMask. A connection request is pending.");
      } else {
        console.error("MetaMask connection error:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Placeholder for smart contract interaction
      console.log(`Processing payment of $${amount}`);
      alert(`Payment of $${amount} would trigger smart contract (not implemented)`);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
            Make a Donation
          </h1>

          {!wallet ? (
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                To make a donation, you'll need to connect your MetaMask wallet first.
              </p>
              <button
                onClick={connectWallet}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-400 
                text-white rounded-lg font-semibold transition-all transform hover:scale-105 
                hover:from-pink-600 hover:to-rose-500"
              >
                Connect MetaMask
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
              <div className="mb-6">
                <p className="text-pink-500 font-medium">Connected Wallet:</p>
                <p className="font-mono text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{wallet}</p>
              </div>
              
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
          )}
        </div>
      </div>

      {/* MetaMask Modal */}
      {showMetaMaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🦊</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">MetaMask Required</h3>
              <p className="text-gray-600 mb-6">
                To connect your wallet and participate in WildlifeDAO, you need to install the MetaMask browser extension.
              </p>
              <div className="space-y-4">
                <a
                  href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-400 
                  text-white rounded-lg font-semibold transition-all transform hover:scale-105 
                  hover:from-pink-600 hover:to-rose-500"
                >
                  Install MetaMask
                </a>
                <button
                  onClick={() => setShowMetaMaskModal(false)}
                  className="block w-full py-3 px-4 border border-gray-200 
                  text-gray-600 rounded-lg font-semibold transition-all hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                After installing, refresh this page and try connecting again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
