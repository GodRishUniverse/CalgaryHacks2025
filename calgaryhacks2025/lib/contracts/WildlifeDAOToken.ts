import { ethers } from "ethers";

// Update with the new token address
export const WILDLIFE_TOKEN_ADDRESS = "0xEee63a8CB5ee79d5931FaBf6f5FE8470371ee556";

export const WLD_TOKEN_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function transfer(address, uint256) external returns (bool)",
  "function allowance(address, address) external view returns (uint256)",
  "function approve(address, uint256) external returns (bool)",
  "function transferFrom(address, address, uint256) external returns (bool)",
  "function mintWLD(address recipient, uint256 amount) external",
];

export const getWLDTokenContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(WILDLIFE_TOKEN_ADDRESS, WLD_TOKEN_ABI, signer);
};
