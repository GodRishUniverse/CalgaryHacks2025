import { ethers } from 'ethers';

export const WILDLIFE_DAO_ADDRESS = ""; // Add the deployed DAO address
export const WILDLIFE_TOKEN_ADDRESS = ""; // Add the deployed token address

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