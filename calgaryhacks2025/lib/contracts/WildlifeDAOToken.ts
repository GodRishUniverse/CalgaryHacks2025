import { ethers } from 'ethers';
import { WILDLIFE_TOKEN_ADDRESS } from './WildlifeDAO';

export const WLD_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export const getWLDTokenContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(WILDLIFE_TOKEN_ADDRESS, WLD_TOKEN_ABI, signer);
}; 