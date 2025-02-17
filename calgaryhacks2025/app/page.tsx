"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";
import {
  WILDLIFE_DAO_ADDRESS,
  WILDLIFE_TOKEN_ADDRESS,
} from "@/lib/contracts/WildlifeDAO";
import { getDonationContract } from "@/lib/contracts/DonationABI";

const TOP_PROJECTS = [
  {
    title: "Sumatran Rhino Conservation",
    raised: "45,000",
    goal: "60,000",
    votes: 234,
    icon: "🦏",
    progress: 75,
  },
  {
    title: "Amazon Rainforest Protection",
    raised: "128,000",
    goal: "150,000",
    votes: 543,
    icon: "🌳",
    progress: 85,
  },
  {
    title: "Arctic Fox Habitat Preservation",
    raised: "28,000",
    goal: "50,000",
    votes: 167,
    icon: "🦊",
    progress: 56,
  },
];

const FAQ_ITEMS = [
  {
    question: "How does the voting system work?",
    answer: "Each WLD token represents one vote. Projects need majority support and minimum participation to pass. Voting periods last 7 days, and results are recorded on the blockchain for transparency.",
  },
  {
    question: "What happens after I donate?",
    answer: "Your ETH donation is converted to WLD tokens at a rate of 1 WLD per $1. These tokens give you voting power to influence which conservation projects receive funding. All transactions are recorded on the blockchain.",
  },
  {
    question: "How are projects validated?",
    answer: "Projects undergo AI analysis for viability scoring and community voting. The AI evaluates factors like scientific alignment, biodiversity impact, and sustainability. Community members then vote using their WLD tokens.",
  },
];

const STATISTICS = [
  { number: "$1.2M", label: "Total Value Locked" },
  { number: "156", label: "Active Projects" },
  { number: "45K", label: "WLD Holders" },
  { number: "92%", label: "Project Success Rate" },
];

const HOW_IT_WORKS_STEPS = [
  {
    title: "Make a Donation",
    description: "Contribute ETH to receive WLD governance tokens.",
    icon: "💰",
  },
  {
    title: "Receive WLD Tokens",
    description: "Get 1 WLD token for every $1 worth of ETH donated.",
    icon: "🎫",
  },
  {
    title: "Vote on Projects",
    description: "Use your WLD tokens to support conservation projects through voting.",
    icon: "✋",
  },
  {
    title: "Track Impact",
    description: "Monitor project progress and voting results on-chain.",
    icon: "📊",
  },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDonateClick = () => {
    if (user) {
      router.push("/donate");
    } else {
      router.push("/login?redirect=/donate");
    }
  };

  const handleDonate = async (amount: number) => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      // First request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const donationContract = await getDonationContract(signer);

      console.log("Starting donation...");
      console.log("Amount:", amount);
      console.log("Signer:", await signer.getAddress());

      // First check if token contract has approved DAO
      const tokenContract = await getWLDTokenContract(signer);
      const daoAddress = await tokenContract.daoContract();
      console.log("DAO address in token contract:", daoAddress);
      console.log("Expected DAO address:", WILDLIFE_DAO_ADDRESS);

      // Make the donation
      const tx = await donationContract.donate(
        amount, // USD amount
        await signer.getAddress(), // recipient
        {
          gasLimit: 500000, // Increased gas limit
        }
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      alert("Donation successful! You have received WLD tokens.");
    } catch (error: any) {
      console.error("Donation error:", error);
      if (error.message.includes("user rejected")) {
        alert("Transaction was rejected in MetaMask. Please try again.");
      } else if (error.message.includes("insufficient funds")) {
        alert(
          "Insufficient ETH for gas fees. Please add more ETH to your wallet."
        );
      } else {
        alert(`Donation failed: ${error.message}`);
      }
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
            WildlifeDAO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            A decentralized governance system empowering donors to
            democratically fund wildlife conservation projects.
          </p>
          <button
            onClick={handleDonateClick}
            className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white 
            rounded-full font-bold text-lg hover:from-pink-600 hover:to-rose-500 
            transform hover:scale-105 transition-all shadow-lg animate-pulse 
            hover:animate-none"
          >
            Donate Now
          </button>
        </div>
      </div>

      {/* New Mission Section */}
      <div className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            Revolutionizing Wildlife Conservation
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            WildlifeDAO combines blockchain technology with democratic
            governance to create a transparent, efficient, and fair system for
            funding conservation projects. Through quadratic voting, we ensure
            that every donor's voice matters, regardless of contribution size.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {STATISTICS.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-pink-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section (Enhanced) */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={index} className="relative">
              <div
                className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm 
                            hover:border-pink-300 transition-all text-center"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <span className="text-pink-500 text-2xl">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Projects Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Top Conservation Projects
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {TOP_PROJECTS.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-300 
              transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="h-48 w-full flex items-center justify-center bg-gray-50 text-6xl">
                {project.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {project.title}
                </h3>
                <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-400 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${project.raised} raised</span>
                    <span>Goal: ${project.goal}</span>
                  </div>
                  <div className="text-sm text-pink-500">
                    {project.votes} votes
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Technology Section */}
      <div className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Powered by Blockchain Technology
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our platform leverages Ethereum L2 solutions for fast,
              cost-effective, and environmentally friendly transactions. Smart
              contracts ensure complete transparency and automated fund
              distribution.
            </p>
            <ul className="space-y-4">
              {[
                "ERC-20Votes tokens for governance",
                "Quadratic voting for fair decision making",
                "Automated treasury management",
                "Real-time transaction tracking",
              ].map((item, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="text-pink-500 mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-96">
            
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Quadratic Voting"
            description="Fair governance through diminishing returns on voting power"
            icon="🗳️"
          />
          <FeatureCard
            title="Transparent Funding"
            description="All votes and fund disbursements recorded on-chain"
            icon="🔗"
          />
          <FeatureCard
            title="Secure Auathentication"
            description="MetaMask integration with one-wallet-per-user policy"
            icon="🔒"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            >
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-semibold text-gray-800">
                  {item.question}
                </span>
                <span className="text-2xl text-pink-500">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-gray-600">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Join our community of conservation innovators. Submit your wildlife
            preservation project or contribute to existing initiatives.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects/submit"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold 
              bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl 
              shadow-lg hover:scale-105 transition-all duration-200"
            >
              Submit a Project 🌿
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold 
              bg-white text-pink-600 border-2 border-pink-500 rounded-xl 
              shadow-md hover:scale-105 transition-all duration-200"
            >
              View Projects 🔍
            </Link>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="text-lg font-semibold mb-2">Submit Your Vision</h3>
              <p className="text-gray-600">
                Propose your wildlife conservation project and get community
                support
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Get Validated</h3>
              <p className="text-gray-600">
                Projects are reviewed by our expert validators for feasibility
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Receive Funding</h3>
              <p className="text-gray-600">
                Approved projects get funded through community voting
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div
      className="p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-300 
    transition-all shadow-sm hover:shadow-md"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
