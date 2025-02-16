"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { ethers } from "ethers";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";
import {
  getWildlifeDAOContract,
  WILDLIFE_DAO_ADDRESS,
  WILDLIFE_DAO_ABI,
} from "@/lib/contracts/WildlifeDAO";
import { supabase } from "@/lib/supabase";

interface Project {
  id: number;
  title: string;
  description: string;
  fundingRequired: number;
  status: "Pending" | "Validating" | "Approved" | "Rejected" | "Executed";
  forVotes: number;
  againstVotes: number;
  votingStartTime: number;
  votingEndTime: number;
  location?: string;
  impact?: string;
  team?: string;
  timeline?: string;
  milestones?: { title: string; description: string; date: string }[];
  submissionTime: number;
}

// Helper function for formatting time
function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return "Voting ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// Mock project data with additional details
const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Sumatran Rhino Conservation",
    description:
      "Protecting the critically endangered Sumatran rhinos through habitat preservation and anti-poaching measures.",
    fundingRequired: 60000,
    status: "Approved",
    forVotes: 4500,
    againstVotes: 2500,
    votingStartTime: 1700000000,
    votingEndTime: 1700000000,
    location: "Sumatra, Indonesia",
    impact:
      "Protection of 50 Sumatran rhinos and their habitat, supporting local communities through conservation jobs.",
    team: "Led by Dr. Sarah Chen, with 15 years of experience in wildlife conservation.",
    timeline: "12-month project with quarterly milestones",
    milestones: [
      {
        title: "Phase 1: Habitat Assessment",
        description:
          "Complete survey of rhino populations and habitat conditions",
        date: "Q1 2024",
      },
      {
        title: "Phase 2: Anti-poaching Measures",
        description:
          "Deploy advanced monitoring systems and train local rangers",
        date: "Q2 2024",
      },
      {
        title: "Phase 3: Community Engagement",
        description: "Establish community-based conservation programs",
        date: "Q3 2024",
      },
    ],
    submissionTime: 1700000000,
  },
  {
    id: 2,
    title: "Amazon Rainforest Protection",
    description:
      "Supporting indigenous communities in protecting their ancestral forests from illegal logging.",
    fundingRequired: 150000,
    status: "Approved",
    forVotes: 6000,
    againstVotes: 1500,
    votingStartTime: 1700000000,
    votingEndTime: 1700000000,
    location: "Amazon Basin, Brazil",
    impact:
      "Protection of 10,000 hectares of rainforest and support for 5 indigenous communities.",
    team: "Partnership with Indigenous Rights Foundation and local leaders",
    timeline: "24-month project with biannual reviews",
    milestones: [
      {
        title: "Phase 1: Community Consultation",
        description: "Establish partnerships with indigenous communities",
        date: "Q1 2024",
      },
      {
        title: "Phase 2: Surveillance System",
        description: "Install forest monitoring technology",
        date: "Q2 2024",
      },
      {
        title: "Phase 3: Sustainable Agriculture",
        description: "Implement sustainable farming practices",
        date: "Q3 2024",
      },
    ],
    submissionTime: 1700000000,
  },
  {
    id: 3,
    title: "Arctic Fox Habitat Preservation",
    description:
      "Establishing protected areas for Arctic fox breeding grounds in Iceland.",
    fundingRequired: 50000,
    status: "Approved",
    forVotes: 3000,
    againstVotes: 2000,
    votingStartTime: 1700000000,
    votingEndTime: 1700000000,
    location: "Northern Iceland",
    impact:
      "Protection of critical breeding grounds affecting 200+ Arctic foxes",
    team: "Collaboration with Icelandic Wildlife Service",
    timeline: "18-month project with quarterly reviews",
    milestones: [
      {
        title: "Phase 1: Territory Mapping",
        description: "GPS tracking and den site identification",
        date: "Q1 2024",
      },
      {
        title: "Phase 2: Protected Area Designation",
        description: "Legal establishment of conservation zones",
        date: "Q2 2024",
      },
      {
        title: "Phase 3: Population Monitoring",
        description: "Implementation of long-term monitoring program",
        date: "Q4 2024",
      },
    ],
    submissionTime: 1700000000,
  },
];

// Add type guard
const checkEthereum = () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }
  return window.ethereum as ethers.Eip1193Provider;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [votingPower, setVotingPower] = useState<number>(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    console.log("Project ID from params:", params.id);
    const found = MOCK_PROJECTS.find((p) => p.id.toString() === params.id);
    console.log("Found project:", found);
    if (found) {
      setProject({ ...found, votingEndTime: Number(found.votingEndTime) });
    }
    checkAuth();
  }, [params.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("wallet_address")
      .eq("id", user.id)
      .single();

    if (data?.wallet_address) {
      await fetchTokenInfo(data.wallet_address);
    }
  };

  const fetchTokenInfo = async (walletAddress: string) => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(checkEthereum());
      const signer = await provider.getSigner();
      const tokenContract = await getWLDTokenContract(signer);

      const [balance, supply] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.totalSupply(),
      ]);

      const formattedBalance = ethers.formatUnits(balance, 18);
      const formattedSupply = ethers.formatUnits(supply, 18);

      setTokenBalance(formattedBalance);
      setTotalSupply(formattedSupply);

      const votingPowerBips =
        (Number(formattedBalance) * 10000) / Number(formattedSupply);
      setVotingPower(votingPowerBips);
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
  };

  const fetchProjectData = async (projectId: number) => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(checkEthereum());
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      // Fetch project data from the smart contract
      const project = await daoContract.projects(projectId);
      const [forVotes, againstVotes, votingEndTime] =
        await daoContract.getProjectVotes(projectId);

      // Format the data
      const formattedProject: Project = {
        id: projectId,
        title: project.title,
        description: project.description,
        fundingRequired: Number(project.fundingRequired),
        status: project.status,
        forVotes: Number(ethers.formatUnits(forVotes, 2)),
        againstVotes: Number(ethers.formatUnits(againstVotes, 2)),
        votingStartTime: Number(project.votingStartTime),
        votingEndTime: Number(votingEndTime), // This will be in Unix seconds
        submissionTime: Number(project.submissionTime),
      };

      console.log(
        "Project voting end time:",
        new Date(formattedProject.votingEndTime * 1000).toLocaleString()
      );
      setProject(formattedProject);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const handleVote = async (projectId: number, support: boolean) => {
    try {
      if (!window.ethereum) {
        alert("Please connect MetaMask first");
        return;
      }

      const provider = new ethers.BrowserProvider(checkEthereum());
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      console.log("Sending vote transaction...");
      console.log("Project ID:", projectId);
      console.log("Support:", support);

      // Call the voteOnProject function from our smart contract
      const tx = await daoContract.voteOnProject(projectId, support);
      console.log("Transaction sent:", tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      // Find the VoteCast event in the receipt
      const voteCastEvent = receipt.logs.find(
        (log: any) => log.eventName === "VoteCast"
      );

      if (voteCastEvent) {
        console.log("Vote cast event:", voteCastEvent);
        // Refresh the project data
        await fetchProjectData(projectId);

        alert("Vote cast successfully!");
      }
    } catch (error: any) {
      console.error("Error casting vote:", error);
      if (error.message.includes("execution reverted")) {
        alert(
          "Transaction failed. Make sure you have enough WLD tokens and haven't already voted."
        );
      } else {
        alert("Error casting vote. Please try again.");
      }
    }
  };

  // Use useEffect to fetch project data when the page loads
  useEffect(() => {
    if (params.id) {
      fetchProjectData(Number(params.id));
    }
  }, [params.id]);

  // Add real-time updates
  useEffect(() => {
    if (!project || !window.ethereum) return;

    const interval = setInterval(async () => {
      try {
        const provider = new ethers.BrowserProvider(checkEthereum());
        const signer = await provider.getSigner();
        const daoContract = await getWildlifeDAOContract(signer);

        // Fetch latest vote counts
        const [forVotes, againstVotes, votingEndTime] =
          await daoContract.getProjectVotes(project.id);

        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            forVotes: Number(ethers.formatUnits(forVotes, 2)),
            againstVotes: Number(ethers.formatUnits(againstVotes, 2)),
            votingEndTime: Number(votingEndTime),
          };
        });
      } catch (error) {
        console.error("Error updating vote counts:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [project?.id]);

  // Update the time comparison logic
  const isVotingEnded = (votingEndTime: number) => {
    return Date.now() > votingEndTime * 1000; // Convert blockchain timestamp to milliseconds
  };

  // Update the time remaining display
  const getTimeStatus = (votingEndTime: number) => {
    const now = Date.now();
    const endTime = votingEndTime * 1000; // Convert to milliseconds
    const oneDay = 24 * 60 * 60 * 1000;

    if (now > endTime) {
      return {
        status: "Ended",
        color: "text-red-500",
        timeLeft: "Voting ended",
      };
    }

    const timeLeft = endTime - now;
    if (timeLeft < oneDay) {
      return {
        status: "Ending Soon",
        color: "text-yellow-500",
        timeLeft: formatTimeRemaining(new Date(endTime)),
      };
    }

    return {
      status: "Active",
      color: "text-green-500",
      timeLeft: formatTimeRemaining(new Date(endTime)),
    };
  };

  // Add this to your useEffect in the project detail page
  useEffect(() => {
    if (!project || project.status !== "Pending") return;

    const checkAutoValidation = async () => {
      try {
        const submissionTime = new Date(project.submissionTime).getTime();
        const validationEndTime = submissionTime + 60 * 1000; // 1 minute in milliseconds

        if (Date.now() >= validationEndTime) {
          const provider = new ethers.BrowserProvider(checkEthereum());
          const signer = await provider.getSigner();
          const daoContract = await getWildlifeDAOContract(signer);

          console.log("Checking auto-validation for project:", project.id);
          const tx = await daoContract.checkAndAutoValidate(project.id);
          await tx.wait();

          // Refresh project data
          await fetchProjectData(project.id);
        }
      } catch (error) {
        console.error("Error checking auto-validation:", error);
      }
    };

    const timer = setInterval(checkAutoValidation, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, [project]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {project ? (
            <div className="max-w-4xl mx-auto">
              {/* Project Header */}
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {project.title}
                  </h1>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full">
                    {project.status}
                  </span>
                </div>

                {/* Project Description */}
                <p className="text-gray-600 text-lg mb-6">
                  {project.description}
                </p>

                {/* Project Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-pink-500">
                      ${project.fundingRequired.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Funding Required</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                      {(project.forVotes / 100).toFixed(1)}%
                    </div>
                    <div className="text-gray-600">Support Rate</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">
                      {(
                        (project.forVotes + project.againstVotes) /
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-gray-600">Participation Rate</div>
                  </div>
                </div>

                {/* Voting Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Cast Your Vote
                  </h2>

                  {/* Your Voting Power */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-lg font-medium text-gray-800 mb-2">
                      Your Voting Power
                    </div>
                    <div className="text-3xl font-bold text-pink-500">
                      {(votingPower / 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Based on your WLD token balance
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-lg font-medium text-gray-800">
                        Time Remaining
                      </div>
                      <div
                        className={`font-medium ${getTimeStatus(project.votingEndTime).color}`}
                      >
                        {getTimeStatus(project.votingEndTime).timeLeft}
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 h-full transition-all duration-500 ${
                          getTimeStatus(project.votingEndTime).color
                        }`}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              ((project.votingEndTime - now.getTime()) /
                                (7 * 24 * 60 * 60 * 1000)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  <div className="flex gap-6">
                    <button
                      onClick={() => handleVote(project.id, true)}
                      disabled={isVotingEnded(project.votingEndTime)}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg
                      transition-all transform hover:scale-105
                      ${
                        isVotingEnded(project.votingEndTime)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      }`}
                    >
                      Support Project
                    </button>
                    <button
                      onClick={() => handleVote(project.id, false)}
                      disabled={isVotingEnded(project.votingEndTime)}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg
                      transition-all transform hover:scale-105
                      ${
                        isVotingEnded(project.votingEndTime)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                      }`}
                    >
                      Reject Project
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Project Details */}
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Project Details
                </h2>

                {project?.location && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Location
                    </h3>
                    <p className="text-gray-600">{project.location}</p>
                  </div>
                )}

                {project?.impact && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Expected Impact
                    </h3>
                    <p className="text-gray-600">{project.impact}</p>
                  </div>
                )}

                {project?.team && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Team
                    </h3>
                    <p className="text-gray-600">{project.team}</p>
                  </div>
                )}

                {project?.timeline && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Timeline
                    </h3>
                    <p className="text-gray-600">{project.timeline}</p>
                  </div>
                )}

                {project?.milestones && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Milestones
                    </h3>
                    <div className="space-y-4">
                      {project.milestones.map((milestone, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800">
                              {milestone.title}
                            </h4>
                            <span className="text-sm text-pink-500">
                              {milestone.date}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {milestone.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-2xl text-gray-600">Project not found</div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
