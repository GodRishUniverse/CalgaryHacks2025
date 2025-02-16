import { ethers } from 'ethers';

export const WILDLIFE_DAO_ADDRESS = "0x6a347e814f5D76c42fDf05D4A3413A7D8AFd96c3";
export const WILDLIFE_TOKEN_ADDRESS = "0x1E9861Dfa9D6A345Af913221B41cE61b761820A7";

export const WILDLIFE_DAO_ABI = [
  "function donate(uint256 _usdAmount, address _recipient) external payable",
  "function submitProject(string memory title, string memory description, uint256 fundingRequired) external",
  "function validateProject(uint256 projectId) external",
  "function voteOnProject(uint256 projectId, bool support) external",
  "function addValidator(address validator) external",
  "event DonationReceived(address indexed donor, uint256 usdAmount, uint256 wldMinted, uint256 daoFeeAmount)",
  "event ProjectSubmitted(uint256 indexed projectId, address indexed proposer, string title, uint256 fundingRequired)",
  "event ProjectValidated(uint256 indexed projectId, address indexed validator, uint256 currentValidations)",
  "event ProjectStatusUpdated(uint256 indexed projectId, ProjectStatus newStatus)",
  "function totalValueLocked() view returns (uint256)",
  "function totalWLD() view returns (uint256)",
  "function exchangeRate() view returns (uint256)"
];

export const getWildlifeDAOContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(WILDLIFE_DAO_ADDRESS, WILDLIFE_DAO_ABI, signer);
}; 