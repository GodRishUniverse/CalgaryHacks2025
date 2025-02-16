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
  id: string;
  title: string;
  description: string;
  funding_required: number;
  status: string;
  contract_project_id: string;
  location: string;
  created_at: string;
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
    id: "1",
    title: "Sumatran Rhino Conservation",
    description:
      "Protecting the critically endangered Sumatran rhinos through habitat preservation and anti-poaching measures.",
    funding_required: 60000,
    status: "Approved",
    contract_project_id: "1",
    location: "Sumatra, Indonesia",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Amazon Rainforest Protection",
    description:
      "Supporting indigenous communities in protecting their ancestral forests from illegal logging.",
    funding_required: 150000,
    status: "Approved",
    contract_project_id: "2",
    location: "Amazon Basin, South America",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Arctic Fox Habitat Preservation",
    description:
      "Establishing protected areas for Arctic fox breeding grounds in Iceland.",
    funding_required: 50000,
    status: "Approved",
    contract_project_id: "3",
    location: "Iceland",
    created_at: new Date().toISOString(),
  },
];

// Add this helper function at the top of the file
function getVotingTimeStatus(project: Project) {
  const now = new Date();
  const endTime = new Date(project.created_at);
  const startTime = new Date(project.created_at);

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [votingPower, setVotingPower] = useState<number>(0);
  const [totalValueLocked, setTotalValueLocked] = useState<string>("0");
  const router = useRouter();
  const [now, setNow] = useState(new Date());

  const fetchProjects = async () => {
    try {
      // Only fetch approved projects
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "Approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchProjects();
  }, []);

  const handleVote = async (projectId: string, support: boolean) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
            Loading Projects...
          </h1>
        </div>
      </div>
    );
  }

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
              Active Projects
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const votingStatus = getVotingTimeStatus(project);
              const projectEmoji = getProjectEmoji(project.title);
              
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.contract_project_id}`}
                  className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      <span className="mr-2">{projectEmoji}</span>
                      {project.title}
                    </h2>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-pink-500 font-medium">
                      ${project.funding_required.toLocaleString()} USD
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.location}
                    </span>
                  </div>

                  {/* Voting Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Voting Progress</span>
                      <span className="text-gray-900 font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-rose-400 h-2 rounded-full" 
                        style={{ width: '45%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      votingStatus.status === "Active" 
                        ? "bg-green-100 text-green-800"
                        : votingStatus.status === "Ending Soon"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {votingStatus.status}
                    </span>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">
                        {votingStatus.timeLeft}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-1">👍</span>
                      <span>24 For</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="mr-1">👎</span>
                      <span>12 Against</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl text-gray-600">
                No active projects found. Be the first to submit one!
              </h3>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
