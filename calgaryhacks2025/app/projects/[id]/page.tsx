"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ethers } from "ethers";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Project {
  id: string;
  title: string;
  description: string;
  funding_required: number;
  location: string;
  timeline: string;
  technical_requirements: string;
  impact_metrics: string;
  team_background: string;
  budget_breakdown: Array<{ item: string; amount: number }>;
  milestones: Array<{ title: string; description: string; deadline: string }>;
  status: string;
  validation_status: string;
  blockchain_status: string;
  contract_project_id: string;
  voting_start_time: string;
  voting_end_time: string;
  votes: { forVotes: number; againstVotes: number; participation: number };
}

const HARDCODED_PROJECTS = {
  "1": {
    id: "1",
    title: "Sumatran Rhino Conservation",
    description:
      "Protecting the critically endangered Sumatran rhinos through habitat preservation and anti-poaching measures.",
    funding_required: 60000,
    location: "Sumatra, Indonesia",
    timeline: "12 months",
    technical_requirements:
      "Anti-poaching technology deployment and habitat monitoring systems",
    impact_metrics:
      "Increase in rhino population, reduction in poaching incidents",
    team_background: "Team of conservation experts and local rangers",
    budget_breakdown: [
      { item: "Anti-poaching equipment", amount: 20000 },
      { item: "Habitat restoration", amount: 25000 },
      { item: "Community engagement", amount: 15000 },
    ],
    milestones: [
      {
        title: "Initial Assessment",
        description: "Complete survey of current rhino population",
        deadline: "2024-04-01",
      },
      {
        title: "Equipment Deployment",
        description: "Install monitoring systems",
        deadline: "2024-06-01",
      },
      {
        title: "Community Program",
        description: "Launch local community conservation program",
        deadline: "2024-08-01",
      },
    ],
    status: "Approved",
    validation_status: "Approved",
    blockchain_status: "Approved",
    contract_project_id: "1",
    voting_start_time: new Date().toISOString(),
    voting_end_time: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: { forVotes: 45, againstVotes: 25, participation: 70 },
  },
  "2": {
    id: "2",
    title: "Amazon Rainforest Protection",
    description:
      "Supporting indigenous communities in protecting their ancestral forests from illegal logging.",
    funding_required: 150000,
    location: "Amazon Basin, Brazil",
    timeline: "24 months",
    technical_requirements:
      "Satellite monitoring systems and drone surveillance",
    impact_metrics:
      "Hectares of forest protected, reduction in illegal logging",
    team_background: "Indigenous leaders and environmental scientists",
    budget_breakdown: [
      { item: "Monitoring equipment", amount: 50000 },
      { item: "Community support", amount: 60000 },
      { item: "Legal assistance", amount: 40000 },
    ],
    milestones: [
      {
        title: "Community Engagement",
        description: "Establish partnerships with local tribes",
        deadline: "2024-05-01",
      },
      {
        title: "Technology Setup",
        description: "Deploy monitoring systems",
        deadline: "2024-07-01",
      },
      {
        title: "Training Program",
        description: "Complete community ranger training",
        deadline: "2024-09-01",
      },
    ],
    status: "Approved",
    validation_status: "Approved",
    blockchain_status: "Approved",
    contract_project_id: "2",
    voting_start_time: new Date().toISOString(),
    voting_end_time: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: { forVotes: 60, againstVotes: 15, participation: 75 },
  },
  "3": {
    id: "3",
    title: "Arctic Fox Habitat Preservation",
    description:
      "Establishing protected areas for Arctic fox breeding grounds in Iceland.",
    funding_required: 50000,
    location: "Iceland",
    timeline: "18 months",
    technical_requirements: "Wildlife tracking systems and habitat monitoring",
    impact_metrics: "Number of breeding pairs, cubs survival rate",
    team_background: "Arctic wildlife specialists and local conservationists",
    budget_breakdown: [
      { item: "Habitat protection", amount: 20000 },
      { item: "Research equipment", amount: 15000 },
      { item: "Conservation measures", amount: 15000 },
    ],
    milestones: [
      {
        title: "Site Selection",
        description: "Identify key breeding areas",
        deadline: "2024-03-01",
      },
      {
        title: "Protection Setup",
        description: "Establish protected zones",
        deadline: "2024-06-01",
      },
      {
        title: "Monitoring Program",
        description: "Implement tracking system",
        deadline: "2024-08-01",
      },
    ],
    status: "Approved",
    validation_status: "Approved",
    blockchain_status: "Approved",
    contract_project_id: "3",
    voting_start_time: new Date().toISOString(),
    voting_end_time: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: { forVotes: 30, againstVotes: 20, participation: 50 },
  },
};

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [votes, setVotes] = useState({ forVotes: 0, againstVotes: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // First try to get from Supabase
        const { data: dbProject, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          console.log("No DB project found, checking mock projects");
          // If not in DB, check mock projects
          const mockProject =
            HARDCODED_PROJECTS[params.id as keyof typeof HARDCODED_PROJECTS];
          if (mockProject) {
            setProject(mockProject);
            setVotes({
              forVotes: mockProject.votes.forVotes,
              againstVotes: mockProject.votes.againstVotes,
            });
          }
        } else {
          // Found in DB, format it like a Project
          const formattedProject: Project = {
            ...dbProject,
            votes: {
              forVotes: 0,
              againstVotes: 0,
              participation: 0,
            },
          };
          setProject(formattedProject);

          // If project has contract ID, fetch blockchain voting data
          if (formattedProject.contract_project_id) {
            await fetchVotingData(formattedProject.contract_project_id);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [params.id]);

  // Update timer every second
  useEffect(() => {
    if (!project?.voting_end_time) return;

    const timer = setInterval(() => {
      const end = new Date(project.voting_end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Voting Ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [project]);

  const handleVote = async (support: boolean) => {
    if (!project?.contract_project_id || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      // Add detailed logging
      console.log("Project details:", {
        project,
        contract_project_id: project.contract_project_id,
        support,
        status: project.status,
      });

      // Check project status first
      const projectState = await daoContract.projects(
        project.contract_project_id
      );
      console.log("Project state from blockchain:", projectState);

      if (projectState.status !== 1) {
        // 1 is typically the APPROVED status
        alert(
          "Project is not in voting phase. Current status: " +
            projectState.status
        );
        return;
      }

      // First check if user has enough tokens to vote (100 WLD required)
      const tokenContract = await getWLDTokenContract(signer);
      const balance = await tokenContract.balanceOf(signer.address);
      const MIN_VOTE_POWER = ethers.parseEther("100");

      if (balance < MIN_VOTE_POWER) {
        alert("You need at least 100 WLD tokens to vote");
        return;
      }

      // Check if voting period is active
      const votingData = await daoContract.getProjectVotes(
        project.contract_project_id
      );
      const now = Math.floor(Date.now() / 1000);
      if (now > Number(votingData.votingEndTime)) {
        alert("Voting period has ended");
        return;
      }

      // Check if user has already voted
      const hasUserVoted = await daoContract.hasVoted(
        project.contract_project_id,
        signer.address
      );
      if (hasUserVoted) {
        alert("You have already voted on this project");
        return;
      }

      // Submit vote to blockchain
      console.log(
        `Voting ${support ? "for" : "against"} project ${project.contract_project_id}`
      );
      const tx = await daoContract.voteOnProject(
        project.contract_project_id,
        support,
        { gasLimit: 300000 }
      );

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Vote confirmed on blockchain");

      // Update UI with new voting data
      const updatedVotes = await daoContract.getProjectVotes(
        project.contract_project_id
      );
      const totalVotes =
        Number(updatedVotes.forVotes) + Number(updatedVotes.againstVotes);

      setVotes({
        forVotes: Math.round(
          (Number(updatedVotes.forVotes) / totalVotes) * 100
        ),
        againstVotes: Math.round(
          (Number(updatedVotes.againstVotes) / totalVotes) * 100
        ),
      });
      setHasVoted(true);

      alert("Vote successfully recorded!");
    } catch (error: any) {
      console.error("Error voting:", error);
      if (error.message.includes("execution reverted")) {
        alert(
          "Transaction failed. Make sure you have enough tokens and haven't voted already."
        );
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Update fetchVotingData to properly calculate percentages
  const fetchVotingData = async (contractProjectId: string) => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      const [votingData, hasUserVoted] = await Promise.all([
        daoContract.getProjectVotes(contractProjectId),
        daoContract.hasVoted(contractProjectId, signer.address),
      ]);

      const totalVotes =
        Number(votingData.forVotes) + Number(votingData.againstVotes);

      setVotes({
        forVotes:
          totalVotes > 0
            ? Math.round((Number(votingData.forVotes) / totalVotes) * 100)
            : 0,
        againstVotes:
          totalVotes > 0
            ? Math.round((Number(votingData.againstVotes) / totalVotes) * 100)
            : 0,
      });
      setHasVoted(hasUserVoted);
    } catch (error) {
      console.error("Error fetching voting data:", error);
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Projects
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{project.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Timeline</p>
                    <p className="font-medium">{project.timeline}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Funding Required</p>
                    <p className="font-medium">
                      ${project.funding_required.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {project.status}
              </span>
            </div>
          </div>

          {/* Voting Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Project Voting</h2>
              <div className="text-pink-500 font-medium">{timeLeft}</div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-500">Support</p>
                  <p className="text-2xl font-bold text-green-600">
                    {votes.forVotes}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Against</p>
                  <p className="text-2xl font-bold text-red-600">
                    {votes.againstVotes}%
                  </p>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={hasVoted}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 
                    text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Support
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={hasVoted}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 
                    text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
