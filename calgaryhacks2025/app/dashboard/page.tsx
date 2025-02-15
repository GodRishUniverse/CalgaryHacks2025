"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface MetaMaskError {
  code: number;
  message: string;
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
    } else {
      setUser(user);
      // Check if user has a wallet already connected
      const { data } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("id", user.id)
        .single();

      if (data?.wallet_address) {
        setWallet(data.wallet_address);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setShowMetaMaskModal(true);
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];
      setWallet(walletAddress);

      // Save wallet address to Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        wallet_address: walletAddress,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      const metamaskError = error as MetaMaskError;
      if (metamaskError.code === -32002) {
        alert("Please check MetaMask. A connection request is pending.");
      } else {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet");
      }
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-gray-800">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
            Dashboard
          </h1>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 mb-8 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Wallet Connection</h2>
              {wallet ? (
                <div className="space-y-2">
                  <p className="text-pink-500 font-medium">Wallet Connected:</p>
                  <p className="font-mono text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{wallet}</p>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 
                  text-white rounded-lg font-semibold transition-all transform hover:scale-105 
                  hover:from-pink-600 hover:to-rose-500"
                >
                  Connect MetaMask
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Contributions</h2>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-pink-500">$0</div>
                  <p className="text-gray-600">No contributions yet</p>
                  <button
                    onClick={() => router.push('/donate')}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 
                    text-white rounded-lg font-semibold transition-all transform hover:scale-105 
                    hover:from-pink-600 hover:to-rose-500 text-sm"
                  >
                    Make First Donation
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Active Proposals</h2>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-pink-500">0</div>
                  <p className="text-gray-600">No active proposals</p>
                  <button
                    className="px-4 py-2 text-pink-500 border border-pink-500 
                    rounded-lg font-semibold transition-all hover:bg-pink-50 text-sm"
                  >
                    View All Projects
                  </button>
                </div>
              </div>
            </div>
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
    </AuthGuard>
  );
}
