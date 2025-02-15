'use client';

import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';

export default function WalletButton() {
  const { isConnected, address, connectWallet, disconnect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connectWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 
          text-white rounded-lg font-semibold transition-all transform 
          hover:scale-105 hover:from-pink-600 hover:to-rose-500 
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm bg-gray-100 px-4 py-2 rounded-lg">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="px-4 py-2 text-rose-500 border border-rose-500 
        rounded-lg hover:bg-rose-50 transition-all"
      >
        Disconnect
      </button>
    </div>
  );
} 