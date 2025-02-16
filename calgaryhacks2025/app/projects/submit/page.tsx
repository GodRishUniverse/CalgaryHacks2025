"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";

interface BudgetItem {
  item: string;
  amount: number;
}

interface Milestone {
  title: string;
  description: string;
  deadline: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  fundingRequired: number;
  location: string;
  timeline: string;
  technicalRequirements: string;
  impactMetrics: string;
  teamBackground: string;
  budgetBreakdown: BudgetItem[];
  milestones: Milestone[];
}

export default function SubmitProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fundingRequired, setFundingRequired] = useState("");
  const [location, setLocation] = useState("");
  const [timeline, setTimeline] = useState("");
  const [technicalRequirements, setTechnicalRequirements] = useState("");
  const [impactMetrics, setImpactMetrics] = useState("");
  const [teamBackground, setTeamBackground] = useState("");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { item: "", amount: 0 },
  ]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", deadline: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, { item: "", amount: 0 }]);
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const updateBudgetItem = (
    index: number,
    field: keyof BudgetItem,
    value: string | number
  ) => {
    const newBudgetItems = [...budgetItems];
    newBudgetItems[index] = {
      ...newBudgetItems[index],
      [field]: field === "amount" ? Number(value) : value,
    };
    setBudgetItems(newBudgetItems);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", description: "", deadline: "" },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (
    index: number,
    field: keyof Milestone,
    value: string
  ) => {
    const newMilestones = [...milestones];
    newMilestones[index] = {
      ...newMilestones[index],
      [field]: value,
    };
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please login first");
      }

      // Generate a unique proposal ID
      const proposalId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // First save to Supabase
      const { data: project, error } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            proposal_id: proposalId,
            title: title.trim(),
            description: description.trim(),
            funding_required: Number(fundingRequired),
            location: location.trim(),
            timeline: timeline.trim(),
            technical_requirements: technicalRequirements.trim(),
            impact_metrics: impactMetrics.trim(),
            team_background: teamBackground.trim(),
            budget_breakdown: budgetItems,
            milestones: milestones,
            status: "Validating",
            validation_status: "Validating",
            validator_comments: [],
            blockchain_status: "Validating",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Now submit to blockchain
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to submit to blockchain");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      console.log("Submitting to blockchain:", {
        proposalId,
        title,
        description,
        fundingRequired,
      });

      const tx = await daoContract.submitProject(
        proposalId,
        title.trim(),
        description.trim(),
        ethers.parseUnits(fundingRequired, 0),
        { gasLimit: 500000 }
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();

      // Look for all relevant events
      const submittedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "ProposalSubmitted"
      );

      const statusEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "ProjectStatusChanged"
      );

      const votingEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "VotingStarted"
      );

      if (submittedEvent && statusEvent && votingEvent) {
        const projectId = submittedEvent.args.projectId;
        const status = submittedEvent.args.status;
        const votingStart = Number(votingEvent.args.startTime);
        const votingEnd = Number(votingEvent.args.endTime);

        console.log("Project submitted with ID:", projectId);
        console.log("Status:", status);
        console.log("Voting period:", {
          start: new Date(votingStart * 1000).toISOString(),
          end: new Date(votingEnd * 1000).toISOString()
        });

        // Update Supabase with all the information
        await supabase
          .from("projects")
          .update({
            status: "Approved",
            validation_status: "Approved",
            blockchain_status: "Approved",
            contract_project_id: projectId.toString(),
            voting_start_time: new Date(votingStart * 1000).toISOString(),
            voting_end_time: new Date(votingEnd * 1000).toISOString()
          })
          .eq("id", project.id);

        alert("Project submitted and voting started!");
        router.push(`/projects/${projectId}`);
      } else {
        console.error("Required events not found in transaction receipt");
        console.log("Available events:", receipt.logs);
        throw new Error("Project submission events not found");
      }
    } catch (error: any) {
      console.error("Error submitting project:", error);
      alert(`Failed to submit project: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Add function to check project status
  const checkProjectStatus = async (projectId: string, daoContract: any) => {
    try {
      const status = await daoContract.getProjectStatus(projectId);
      console.log("Current project status:", status);
      return status;
    } catch (error) {
      console.error("Error checking project status:", error);
      return null;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
              Submit New Project
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <textarea
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Requirements
                  </label>
                  <textarea
                    value={technicalRequirements}
                    onChange={(e) => setTechnicalRequirements(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Metrics
                  </label>
                  <textarea
                    value={impactMetrics}
                    onChange={(e) => setImpactMetrics(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Background
                  </label>
                  <textarea
                    value={teamBackground}
                    onChange={(e) => setTeamBackground(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Breakdown
                </label>
                {budgetItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) =>
                        updateBudgetItem(index, "item", e.target.value)
                      }
                      placeholder="Item description"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateBudgetItem(index, "amount", e.target.value)
                      }
                      placeholder="Amount"
                      className="w-32 px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeBudgetItem(index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBudgetItem}
                  className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                >
                  + Add Budget Item
                </button>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Milestones
                </label>
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="space-y-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) =>
                        updateMilestone(index, "title", e.target.value)
                      }
                      placeholder="Milestone title"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <textarea
                      value={milestone.description}
                      onChange={(e) =>
                        updateMilestone(index, "description", e.target.value)
                      }
                      placeholder="Milestone description"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      rows={2}
                    />
                    <input
                      type="date"
                      value={milestone.deadline}
                      onChange={(e) =>
                        updateMilestone(index, "deadline", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Remove Milestone
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                >
                  + Add Milestone
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Required (USD)
                </label>
                <input
                  type="number"
                  value={fundingRequired}
                  onChange={(e) => setFundingRequired(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-rose-400 
                text-white rounded-lg font-semibold transition-all transform hover:scale-105
                ${submitting ? "opacity-50 cursor-not-allowed" : "hover:from-pink-600 hover:to-rose-500"}`}
              >
                {submitting ? "Submitting..." : "Submit Project"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
