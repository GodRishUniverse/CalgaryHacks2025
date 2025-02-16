"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { ethers } from "ethers";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  description: string;
  fundingRequired: number;
  status: "Pending" | "Validating" | "Approved" | "Rejected" | "Executed";
  forVotes: number;
  againstVotes: number;
  votingEnds: Date;
  votingStartTime: number;
  votingEndTime: number;
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
    votingEnds: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    votingStartTime: Date.now(),
    votingEndTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
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
    votingEnds: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    votingStartTime: Date.now(),
    votingEndTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
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
    votingEnds: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    votingStartTime: Date.now(),
    votingEndTime: Date.now() + 24 * 60 * 60 * 1000,
  },
];

// Add this helper function at the top of the file
function getVotingTimeStatus(project: Project) {
  const now = new Date();
  const endTime = new Date(project.votingEndTime);
  const startTime = new Date(project.votingStartTime);

  if (now > endTime) {
    return {
      status: "Ended",
      timeLeft: "Voting ended",
      color: "text-red-500",
    };
  }

  const timeLeft = endTime.getTime() - now.getTime();
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  let status = "Active";
  let color = "text-green-500";

  if (daysLeft < 1) {
    status = "Ending Soon";
    color = "text-yellow-500";
  }

  return {
    status,
    timeLeft:
      daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h left` : `${hoursLeft}h left`,
    color,
  };
}

// First, let's create a helper function to get emojis for projects
function getProjectEmoji(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("rhino")) return "🦏";
  if (titleLower.includes("rainforest") || titleLower.includes("amazon"))
    return "🌳";
  if (titleLower.includes("arctic") || titleLower.includes("fox")) return "🦊";
  if (titleLower.includes("ocean")) return "🌊";
  if (titleLower.includes("elephant")) return "🐘";
  if (titleLower.includes("tiger")) return "🐯";
  if (titleLower.includes("panda")) return "🐼";
  if (titleLower.includes("whale")) return "🐋";
  return "🌍"; // Default emoji for other conservation projects
}

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [votingPower, setVotingPower] = useState<number>(0);
  const [totalValueLocked, setTotalValueLocked] = useState<string>("0");
  const router = useRouter();
  const [now, setNow] = useState(new Date());

  const fetchTokenInfo = async (walletAddress: string) => {
    try {
      if (!window.ethereum) {
        alert("Please connect MetaMask to view your voting power");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get both contracts
      const daoContract = await getWildlifeDAOContract(signer);
      const wldToken = await getWLDTokenContract(signer);

      try {
        // First, let's log the raw TVL value
        const rawTVL = await daoContract.totalValueLocked();
        console.log("Raw TVL:", rawTVL.toString());

        // Fetch all data in parallel
        const [balance, supply, tvl] = await Promise.all([
          wldToken.balanceOf(walletAddress),
          wldToken.totalSupply(),
          daoContract.totalValueLocked(),
        ]);

        // Format the values and log them
        const formattedBalance = ethers.formatUnits(balance, 18);
        const formattedSupply = ethers.formatUnits(supply, 18);
        const formattedTVL = ethers.formatUnits(tvl, 18);

        console.log("Formatted values:", {
          balance: formattedBalance,
          supply: formattedSupply,
          tvl: formattedTVL,
        });

        // Update state
        setTokenBalance(formattedBalance);
        setTotalSupply(formattedSupply);
        setTotalValueLocked(formattedTVL);

        // Calculate voting power
        const votingPowerBips =
          (Number(formattedBalance) * 10000) / Number(formattedSupply);
        setVotingPower(votingPowerBips);
      } catch (error) {
        console.error("Error fetching contract data:", error);
        // Log more detailed error information
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
          });
        }
      }
    } catch (error) {
      console.error("Error setting up contracts:", error);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("id", user.id)
        .single();

      if (profile?.wallet_address) {
        await fetchTokenInfo(profile.wallet_address);
      }
    };

    checkAuthAndFetchData();

    // Listen for wallet changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts[0]) {
          fetchTokenInfo(accounts[0]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleVote = async (projectId: number, support: boolean) => {
    try {
      if (!window.ethereum) {
        alert("Please connect MetaMask first");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      // Check if user has already voted
      const hasVoted = await daoContract.hasVoted(
        projectId,
        await signer.getAddress()
      );
      if (hasVoted) {
        alert("You have already voted on this project");
        return;
      }

      // Send vote transaction
      const tx = await daoContract.voteOnProject(projectId, support);

      // Wait for transaction and get receipt
      const receipt = await tx.wait();

      // Look for VoteCast event
      const voteCastEvent = receipt.logs.find(
        (log: any) => log.eventName === "VoteCast"
      );

      if (voteCastEvent) {
        const votingPower = Number(voteCastEvent.args.votingPower) / 100; // Convert from basis points
        alert(
          `Successfully voted ${support ? "for" : "against"} the project with ${votingPower.toFixed(2)}% voting power!`
        );

        // Refresh project data
        // TODO: Add function to refresh project data
      }
    } catch (error) {
      console.error("Voting failed:", error);
      alert("Failed to vote. Please try again.");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Governance Stats */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">
                  {Number(tokenBalance).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  WLD
                </div>
                <div className="text-gray-600">Your Balance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">
                  {(votingPower / 100).toFixed(2)}%
                </div>
                <div className="text-gray-600">Voting Power</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">
                  {Number(totalSupply).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  WLD
                </div>
                <div className="text-gray-600">Total Supply</div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROJECTS.map((project) => (
              <Link
                href={`/projects/${project.id}`}
                key={project.id}
                className="block transition-transform hover:scale-105"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-300 transition-all shadow-md">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span>{getProjectEmoji(project.title)}</span>
                        {project.title}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {project.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{project.description}</p>

                    <div className="space-y-4">
                      {/* Funding Required */}
                      <div className="text-sm text-gray-600">
                        Funding Required: $
                        {project.fundingRequired.toLocaleString()}
                      </div>

                      {/* Voting Progress Bar */}
                      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 h-full bg-green-500"
                          style={{ width: `${project.forVotes / 100}%` }}
                        />
                        <div
                          className="absolute right-0 h-full bg-red-500"
                          style={{ width: `${project.againstVotes / 100}%` }}
                        />
                      </div>

                      {/* Voting Stats */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="text-green-600 font-medium">
                          Support: {(project.forVotes / 100).toFixed(1)}%
                        </span>
                        <span className="text-gray-600">
                          Participation:{" "}
                          {(
                            (project.forVotes + project.againstVotes) /
                            100
                          ).toFixed(1)}
                          %
                        </span>
                        <span className="text-red-600 font-medium">
                          Against: {(project.againstVotes / 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* Voting Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleVote(project.id, true)}
                          disabled={now > project.votingEnds}
                          className={`flex-1 px-4 py-3 rounded-lg font-semibold 
                          text-center transition-colors
                          ${
                            now > project.votingEnds
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          Support
                        </button>
                        <button
                          onClick={() => handleVote(project.id, false)}
                          disabled={now > project.votingEnds}
                          className={`flex-1 px-4 py-3 rounded-lg font-semibold 
                          text-center transition-colors
                          ${
                            now > project.votingEnds
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          Reject
                        </button>
                      </div>

                      {/* Voting Period */}
                      {project.status === "Approved" && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Voting Period
                            </span>
                            <span
                              className={`text-sm font-bold ${getVotingTimeStatus(project).color}`}
                            >
                              {getVotingTimeStatus(project).status}
                            </span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                getVotingTimeStatus(project).color.includes(
                                  "red"
                                )
                                  ? "bg-red-500"
                                  : getVotingTimeStatus(project).color.includes(
                                        "yellow"
                                      )
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    ((project.votingEndTime - Date.now()) /
                                      (7 * 24 * 60 * 60 * 1000)) *
                                      100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
