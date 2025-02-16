import { supabase } from './supabase';
import { getWLDTokenContract } from './contracts/WildlifeDAOToken';
import { ethers } from 'ethers';

export async function updateUserMetrics(userId: string, walletAddress: string) {
  try {
    // Get provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Get WLD token contract
    const wldToken = await getWLDTokenContract(signer);
    
    // Get token balance
    const balance = await wldToken.balanceOf(walletAddress);
    const decimals = await wldToken.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);

    // Update Supabase
    const { error } = await supabase
      .from('user_metrics')
      .upsert({
        id: userId,
        wld_balance: formattedBalance,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
} 