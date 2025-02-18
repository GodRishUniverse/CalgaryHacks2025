"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ethers } from "ethers";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import { getWLDTokenContract } from "@/lib/contracts/WildlifeDAOToken";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AuthGuard from "@/components/AuthGuard";

interface Project {
  id: number;
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
  created_at: string;
  ai_score: number;
  ai_score_breakdown: {
    alignment_with_latest_conservation_science: number;
    biodiversity_outcomes: number;
    community_impact: number;
    replicability: number;
    sustainability: number;
  };
  forVotes: number;
  againstVotes: number;
  votingEndTime: number;
  onchain_id?: number;
}

const HARDCODED_PROJECTS = {
  "1": {
    id: 1,
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
    created_at: new Date().toISOString(),
    ai_score: 85,
    ai_score_breakdown: {
      alignment_with_latest_conservation_science: 90,
      biodiversity_outcomes: 80,
      community_impact: 80,
      replicability: 80,
      sustainability: 80,
    },
    forVotes: 45,
    againstVotes: 25,
    votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(),
  },
  "2": {
    id: 2,
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
    created_at: new Date().toISOString(),
    ai_score: 80,
    ai_score_breakdown: {
      alignment_with_latest_conservation_science: 80,
      biodiversity_outcomes: 70,
      community_impact: 70,
      replicability: 70,
      sustainability: 70,
    },
    forVotes: 60,
    againstVotes: 15,
    votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(),
  },
  "3": {
    id: 3,
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
    created_at: new Date().toISOString(),
    ai_score: 70,
    ai_score_breakdown: {
      alignment_with_latest_conservation_science: 70,
      biodiversity_outcomes: 60,
      community_impact: 60,
      replicability: 60,
      sustainability: 60,
    },
    forVotes: 30,
    againstVotes: 20,
    votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(),
  },
};

const VOTING_DAYS_LEFT = 7;

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProjectVotes = async (projectId: number) => {
    try {
      if (!window.ethereum) return null;

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      const state = await daoContract.getProjectState(BigInt(projectId));
      console.log("Project state from contract:", state);

      return {
        forVotes: Number(state[3]),
        againstVotes: Number(state[4]),
      };
    } catch (error) {
      console.error("Error fetching project votes:", error);
      return null;
    }
  };

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      if (data.onchain_id) {
        const votes = await fetchProjectVotes(data.onchain_id);
        if (votes) {
          data.forVotes = votes.forVotes;
          data.againstVotes = votes.againstVotes;
        }
      }

      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (support: boolean) => {
    try {
      if (!window.ethereum || !project?.onchain_id) {
        alert("Please connect MetaMask first");
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      const tx = await daoContract.voteOnProject(
        BigInt(project.onchain_id),
        support
      );
      await tx.wait();

      const votes = await fetchProjectVotes(project.onchain_id);
      if (votes) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                forVotes: votes.forVotes,
                againstVotes: votes.againstVotes,
              }
            : null
        );
      }

      alert(`Successfully voted ${support ? "for" : "against"} the project!`);
    } catch (error: any) {
      console.error("Error voting:", error);
      alert("Failed to vote: " + error.message);
    }
  };

  const getTimeLeft = (): string => {
    return `${VOTING_DAYS_LEFT}d 0h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Project not found</div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.title}
              </h1>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {project.status}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {getTimeLeft()} left
                </span>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">{project.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-pink-500">
                ${project.funding_required.toLocaleString()} Required
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-medium text-lg">
                  AI Score: {project.ai_score}%
                </span>
                <span className="text-gray-400">🤖</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Project Details */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Project Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="text-gray-800">{project.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Timeline
                    </h3>
                    <p className="text-gray-800">{project.timeline}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Technical Requirements
                    </h3>
                    <p className="text-gray-800">
                      {project.technical_requirements}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Impact Metrics
                    </h3>
                    <p className="text-gray-800">{project.impact_metrics}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Team Background
                    </h3>
                    <p className="text-gray-800">{project.team_background}</p>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Budget Breakdown
                </h2>
                <div className="space-y-3">
                  {project.budget_breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600">{item.item}</span>
                      <span className="font-medium">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span className="text-pink-500">
                        ${project.funding_required.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Voting Status */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Voting Status
                </h2>
                <div className="space-y-4">
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 h-full bg-green-500"
                      style={{
                        width: `${project.forVotes ? (project.forVotes * 100) / (project.forVotes + project.againstVotes || 1) : 0}%`,
                      }}
                    />
                    <div
                      className="absolute right-0 h-full bg-red-500"
                      style={{
                        width: `${project.againstVotes ? (project.againstVotes * 100) / (project.forVotes + project.againstVotes || 1) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      Support:{" "}
                      {project.forVotes
                        ? (
                            (project.forVotes * 100) /
                            (project.forVotes + project.againstVotes || 1)
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                    <span className="text-gray-600">
                      Participation:{" "}
                      {(
                        ((project.forVotes + project.againstVotes) * 100) /
                        10000
                      ).toFixed(1)}
                      %
                    </span>
                    <span className="text-red-600 font-medium">
                      Against:{" "}
                      {project.againstVotes
                        ? (
                            (project.againstVotes * 100) /
                            (project.forVotes + project.againstVotes || 1)
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 mt-4">
                    <button
                      onClick={() => handleVote(true)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Support
                    </button>
                    <button
                      onClick={() => handleVote(false)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Score Breakdown */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  AI Analysis Breakdown
                </h2>
                <div className="space-y-4">
                  {project.ai_score_breakdown &&
                    Object.entries(project.ai_score_breakdown).map(
                      ([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-600">
                              {key
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </span>
                            <span className="text-sm font-medium text-purple-600">
                              {value}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Project Milestones
                </h2>
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-pink-500 pl-4 pb-4"
                    >
                      <div className="font-medium text-gray-800">
                        {milestone.title}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {milestone.description}
                      </div>
                      <div className="text-sm text-pink-500">
                        Deadline:{" "}
                        {new Date(milestone.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
