"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { ethers } from "ethers";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import Link from "next/link";
import { getVotingContract } from "@/lib/contracts/VotingABI";
import { WILDLIFE_DAO_ABI } from "@/lib/contracts/WildlifeDAO";

interface Project {
  id: number;          // Supabase ID
  onchain_id: number;  // Smart contract project ID
  title: string;
  description: string;
  funding_required: number;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log("Fetching projects from Supabase...");
        
        // Get projects from Supabase without status filter
        const { data: dbProjects, error } = await supabase
          .from("projects")
          .select("*")
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching projects:", error);
          return;
        }

        console.log("Fetched projects:", dbProjects);

        // Map the projects to include voting info
        const allProjects = dbProjects.map((project) => ({
          ...project,
          forVotes: 0,
          againstVotes: 0,
          votingEnds: new Date(project.created_at).getTime() + (7 * 24 * 60 * 60 * 1000), // 7 days from creation
          votingStartTime: new Date(project.created_at).getTime(),
          votingEndTime: new Date(project.created_at).getTime() + (7 * 24 * 60 * 60 * 1000)
        }));

        console.log("Processed projects:", allProjects);
        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleVote = async (project: Project, support: boolean) => {
    try {
      if (!window.ethereum) {
        alert("Please connect MetaMask first");
        return;
      }

      if (!project.onchain_id) {
        alert("Project not found on blockchain");
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      console.log("Sending vote transaction:", {
        projectId: BigInt(project.onchain_id).toString(),
        support: support,
        contractAddress: daoContract.target
      });

      const tx = await daoContract.voteOnProject(
        BigInt(project.onchain_id),
        support,
        {
          gasLimit: BigInt(500000)
        }
      );

      console.log("Transaction sent:", {
        hash: tx.hash,
        data: tx.data,
        to: tx.to,
        from: tx.from
      });

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      if (receipt && receipt.status === 1) {
        alert(`Successfully voted ${support ? "for" : "against"} the project!`);
        window.location.reload();
      }

    } catch (error: any) {
      console.error("Voting failed:", error);
      
      // Log the error details
      if (error.data) console.error("Error data:", error.data);
      if (error.transaction) console.error("Transaction details:", error.transaction);
      if (error.code) console.error("Error code:", error.code);
      if (error.reason) console.error("Error reason:", error.reason);

      if (error.message.includes("execution reverted")) {
        alert("Transaction failed: " + error.message);
      } else if (error.message.includes("user rejected")) {
        alert("Transaction was rejected by user");
      } else {
        alert("Failed to vote: " + error.message);
      }
    }
  };

  const checkProjectStatus = async (projectId: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);
      
      const status = await daoContract.debugProjectStatus(BigInt(projectId));
      console.log("Project status:", {
        status: status[0], // ProjectStatus enum value
        validationCount: status[1].toString(),
        currentTime: new Date(Number(status[2]) * 1000),
        votingStartTime: new Date(Number(status[3]) * 1000),
        votingEndTime: new Date(Number(status[4]) * 1000),
        canVoteNow: status[5]
      });
    } catch (error) {
      console.error("Error checking project status:", error);
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
            {projects.map((project) => (
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
                        {project.funding_required.toLocaleString()}
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
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => handleVote(project, true)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Support
                        </button>
                        <button
                          onClick={() => handleVote(project, false)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
