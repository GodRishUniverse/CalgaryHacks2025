"use client";

import { useState } from "react";
import { ethers } from 'ethers';
import { getWildlifeDAOContract } from '@/lib/contracts/WildlifeDAO';

export default function PaymentForm() {
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);

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
        alert(`Successfully donated $${donationAmount} and received ${donationAmount * 100} WLD tokens!`);
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

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
        Make a Donation
      </h1>

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 hover:border-pink-300 transition-all">
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
    </div>
  );
}
