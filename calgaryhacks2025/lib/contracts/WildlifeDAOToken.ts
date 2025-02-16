import { ethers } from "ethers";

// Update with the new token address
export const WILDLIFE_TOKEN_ADDRESS = "0x6E54fbCaaeb8410e34d238b797aFFC250959987A";

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
