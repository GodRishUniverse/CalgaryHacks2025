import { ethers } from "ethers";
import { WILDLIFE_DAO_ADDRESS } from "./WildlifeDAO";

export const DONATION_ABI = [
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
    ],
    name: "DonationReceived",
    type: "event",
  },
];

export const getDonationContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(
    "0x526E3592154b4462c8C3BD757f742884027052CF", // Updated WildlifeDAO address
    DONATION_ABI,
    signer
  );
};
