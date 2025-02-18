"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { updateUserMetrics } from "@/lib/metrics";
import AuthGuard from "@/components/AuthGuard";
import { ethers } from "ethers";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";

interface MetaMaskError {
  code: number;
  message: string;
}

interface UserMetrics {
  wld_balance: number;
  total_donated: number;
  projects_supported: number;
  votes_cast: number;
}

// Add interface for proposals
interface Proposal {
  id: number;
  title: string;
  description: string;
  status: string;
  proposal_id: string;
  funding_required: number;
  created_at: string;
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  // Add new function to fetch token balance
  const fetchTokenBalance = async (walletAddress: string) => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = await getWLDTokenContract(signer);

      try {
        const balance = await tokenContract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, 18); // assuming 18 decimals
        setTokenBalance(formattedBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setTokenBalance("0");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    // Get user metrics
    const { data: metricsData } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("id", user.id)
      .single();

    setMetrics(metricsData);

    // Fetch user's proposals
    const { data: userProposals, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposals:", error);
    } else {
      setProposals(userProposals);
    }

    // Check if user has a wallet already connected
    const { data } = await supabase
      .from("profiles")
      .select("wallet_address")
      .eq("id", user.id)
      .single();

    if (data?.wallet_address) {
      setWallet(data.wallet_address);
      // Fetch token balance when wallet is connected
      await fetchTokenBalance(data.wallet_address);
    }

    // If wallet is connected, update metrics
    if (wallet) {
      await updateUserMetrics(user.id, wallet);
    }
  };

  // Update the metrics when wallet is connected
  useEffect(() => {
    if (user && wallet) {
      updateUserMetrics(user.id, wallet);
    }
  }, [wallet, user]);

  // Update balance when wallet changes
  useEffect(() => {
    if (wallet) {
      fetchTokenBalance(wallet);
    }
  }, [wallet]);

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

      // Fetch token balance after connecting wallet
      await fetchTokenBalance(walletAddress);
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
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Wallet Connection
              </h2>
              {wallet ? (
                <div className="space-y-2">
                  <p className="text-pink-500 font-medium">Wallet Connected:</p>
                  <p className="font-mono text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {wallet}
                  </p>
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
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Your Contributions
                </h2>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-pink-500">
                    ${Number(tokenBalance).toLocaleString()}
                  </div>
                  <p className="text-gray-600">
                    {Number(tokenBalance) > 0 
                      ? "Total Contributions" 
                      : "No contributions yet"}
                  </p>
                  <button
                    onClick={() => router.push("/projects")}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 
                    text-white rounded-lg font-semibold transition-all transform hover:scale-105 
                    hover:from-pink-600 hover:to-rose-500 text-sm"
                  >
                    {Number(tokenBalance) > 0 ? "View Projects" : "Get Started"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Active Proposals
                </h2>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-pink-500">
                    {proposals.length}
                  </div>
                  <p className="text-gray-600">
                    {proposals.length === 1
                      ? "Active Proposal"
                      : "Active Proposals"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push("/projects")}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 
                      text-white rounded-lg font-semibold transition-all transform hover:scale-105 
                      hover:from-pink-600 hover:to-rose-500 text-sm"
                    >
                      View All Projects
                    </button>
                    <button
                      onClick={() => router.push("/projects/user")}
                      className="px-4 py-2 text-pink-500 border border-pink-500 
                      rounded-lg font-semibold transition-all hover:bg-pink-50 text-sm"
                    >
                      View Your Proposals
                    </button>
                  </div>
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
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  MetaMask Required
                </h3>
                <p className="text-gray-600 mb-6">
                  To connect your wallet and participate in WildlifeDAO, you
                  need to install the MetaMask browser extension.
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
