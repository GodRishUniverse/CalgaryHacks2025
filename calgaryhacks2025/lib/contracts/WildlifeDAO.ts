import { ethers } from "ethers";
import WildlifeDAOABI from "./WildlifeDAOABI.json";

// Update these addresses with the newly deployed contracts
export const WILDLIFE_DAO_ADDRESS = "0x526E3592154b4462c8C3BD757f742884027052CF";
export const WILDLIFE_TOKEN_ADDRESS = "0xEee63a8CB5ee79d5931FaBf6f5FE8470371ee556";

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
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "support",
        "type": "bool"
      }
    ],
    "name": "voteOnProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  "function addValidator(address validator) external",
  "function wldToken() external view returns (address)",
  "function totalValueLocked() external view returns (uint256)",
  "function totalWLD() external view returns (uint256)",
  "function exchangeRate() external view returns (uint256)",
  "function getProjectVotes(uint256 projectId) external view returns (uint256 forVotes, uint256 againstVotes, uint256 votingEndTime)",
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
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProjectState",
    "outputs": [
      {
        "internalType": "enum ProjectStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "votingStartTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votingEndTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "forVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "againstVotes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
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
