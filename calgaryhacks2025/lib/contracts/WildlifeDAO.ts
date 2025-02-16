import { ethers } from 'ethers';

export const WILDLIFE_DAO_ADDRESS = "0x9a6d98d5332D05a775f9CFb41d2c5430f7f2dCA4";
export const WILDLIFE_TOKEN_ADDRESS = "0x59c4005f57CA093863703E8e6D735b3A72d5C41c";

export const WILDLIFE_DAO_ABI = [
  "function donate(uint256 _usdAmount, address _recipient) external payable",
  "event DonationReceived(address indexed donor, uint256 usdAmount, uint256 wldMinted)",
  "function totalValueLocked() view returns (uint256)",
  "function totalWLD() view returns (uint256)",
  "function exchangeRate() view returns (uint256)"
];

export const getWildlifeDAOContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(WILDLIFE_DAO_ADDRESS, WILDLIFE_DAO_ABI, signer);
}; 