"use client";

import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { getWildlifeDAOContract } from '@/lib/contracts/WildlifeDAO';
import { getWLDTokenContract } from '@/lib/contracts/WildlifeDAOToken';

export default function PaymentForm() {
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const fetchTokenBalance = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const tokenContract = await getWLDTokenContract(signer);
      
      try {
        const balance = await tokenContract.balanceOf(address);
        // Format balance with proper decimals
        setTokenBalance(ethers.formatUnits(balance, 18));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setTokenBalance("0");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);
      
      const rate = await daoContract.exchangeRate();
      setExchangeRate(Number(rate));
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not connected");
      }

      const donationAmount = Number(amount);
      if (isNaN(donationAmount)) {
        throw new Error("Invalid donation amount");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get DAO contract instance
      const daoContract = await getWildlifeDAOContract(signer);

      // Send donation transaction
      const tx = await daoContract.donate(donationAmount, address);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Check for DonationReceived event
      const event = receipt.logs.find(
        (log: any) => log.eventName === 'DonationReceived'
      );

      if (event) {
        alert(`Successfully donated $${donationAmount} and received ${donationAmount} WLD tokens!`);
        await fetchTokenBalance(); // Refresh balance after successful donation
      } else {
        throw new Error("Donation failed");
      }

    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Fetch both balance and exchange rate when component mounts
  useEffect(() => {
    fetchTokenBalance();
    fetchExchangeRate();
  }, []);

  // Calculate WLD amount based on USD and current exchange rate
  const calculateWLDAmount = (usdAmount: string): number => {
    const amount = Number(usdAmount);
    if (isNaN(amount)) return 0;
    return amount * exchangeRate;
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
        Make a Donation
      </h1>

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Your WLD Balance: <span className="text-pink-500 font-medium">{Number(tokenBalance).toFixed(2)} WLD</span>
          </p>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
              You will receive <span className="text-pink-500 font-medium">
                {calculateWLDAmount(amount)} WLD
              </span> tokens
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
    </div>
  );
}
