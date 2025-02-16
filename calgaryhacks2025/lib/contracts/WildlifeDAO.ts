import { ethers } from "ethers";
import WildlifeDAOABI from "./WildlifeDAOABI.json";

// Update these addresses with the newly deployed contracts
export const WILDLIFE_DAO_ADDRESS =
  "0x30499FC4Bc807942498f6b6660486Ee9233d06B0";
export const WILDLIFE_TOKEN_ADDRESS =
  "0x0091524C5C7DBA5b1b418390E23c468D2d99b54D";

export const WILDLIFE_DAO_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "proposalId",
        type: "string",
      },
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "fundingRequired",
        type: "uint256",
      },
    ],
    name: "submitProject",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wldMinted",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "daoFeeAmount",
        type: "uint256",
      },
    ],
    name: "DonationReceived",
    type: "event",
  },
  "function validateProject(uint256 projectId) external",
  "function voteOnProject(uint256 projectId, bool support) external",
  "function addValidator(address validator) external",
  "function wldToken() external view returns (address)",
  "function totalValueLocked() external view returns (uint256)",
  "function totalWLD() external view returns (uint256)",
  "function exchangeRate() external view returns (uint256)",
  "function getProjectVotes(uint256 projectId) external view returns (uint256 forVotes, uint256 againstVotes, uint256 votingEndTime)",
  "function hasVoted(uint256 projectId, address voter) external view returns (bool)",
  "event ProjectSubmitted(uint256 indexed projectId, address indexed proposer, string title, uint256 fundingRequired)",
  "event ProjectValidated(uint256 indexed projectId, address indexed validator, uint256 currentValidations)",
  "event ProjectStatusUpdated(uint256 indexed projectId, uint8 newStatus)",
  "event VoteCast(uint256 indexed projectId, address indexed voter, bool support, uint256 votingPower)",
  "event ProjectStatusChanged(uint256 indexed projectId, uint8 oldStatus, uint8 newStatus)",
  "function projects(uint256) external view returns (string title, string description, address proposer, uint256 fundingRequired, uint256 validationCount, uint8 status, uint256 votingStartTime, uint256 votingEndTime, bool executed)",
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_usdAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
    ],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export const PROPOSAL_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "proposalId",
        type: "string",
      },
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "fundingRequired",
        type: "uint256",
      },
    ],
    name: "submitProject",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "proposalId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "submitter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fundingRequired",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "status",
        type: "string",
      },
    ],
    name: "ProposalSubmitted",
    type: "event",
  },
];

export const getWildlifeDAOContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(WILDLIFE_DAO_ADDRESS, WILDLIFE_DAO_ABI, signer);
};

export const getProposalContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(WILDLIFE_DAO_ADDRESS, PROPOSAL_ABI, signer);
};
