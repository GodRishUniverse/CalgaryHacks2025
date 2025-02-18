"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { createAIAnalysisString } from '@/lib/utils/projectUtils';

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
  const [title, setTitle] = useState("Sumatran Rhino Conservation");
  const [description, setDescription] = useState(
    "Protecting the critically endangered Sumatran rhinos through habitat preservation and anti-poaching measures."
  );
  const [fundingRequired, setFundingRequired] = useState("60000");
  const [location, setLocation] = useState("Sumatra, Indonesia");
  const [timeline, setTimeline] = useState("12 months");
  const [technicalRequirements, setTechnicalRequirements] = useState(
    "Anti-poaching technology deployment and habitat monitoring systems"
  );
  const [impactMetrics, setImpactMetrics] = useState(
    "Increase in rhino population, reduction in poaching incidents"
  );
  const [teamBackground, setTeamBackground] = useState(
    "Team of conservation experts and local rangers"
  );
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { item: "Anti-poaching equipment", amount: 20000 },
    { item: "Habitat restoration", amount: 25000 },
    { item: "Community engagement", amount: 15000 },
  ]);
  const [milestones, setMilestones] = useState<Milestone[]>([
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
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [isAiScoring, setIsAiScoring] = useState(false);
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

  const getAIScore = async (analysisText: string) => {
    setIsAiScoring(true);
    try {
      console.log("Sending AI scoring request:", analysisText);
      const response = await fetch('/api/ai-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: analysisText
      });
      console.log("AI scoring response:", response);

      if (!response.ok) {
        throw new Error('AI scoring failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI score:', error);
      return null;
    } finally {
      setIsAiScoring(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this feature");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const daoContract = await getWildlifeDAOContract(signer);

      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please login first");
      }

      // Generate a unique ID for the project
      const uniqueId = `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log("Submitting to smart contract:", {
        uniqueId,
        title,
        description,
        fundingRequired
      });

      // Submit to smart contract first
      const tx = await daoContract.submitProject(
        uniqueId,
        title,
        description,
        ethers.parseEther(fundingRequired.toString())
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Full receipt:", receipt);

      // Get the project ID from the transaction receipt
      const log = receipt.logs[0];
      console.log("Event log:", log);

      // The project ID is in topics[1] (first indexed parameter)
      const onchainProjectId = parseInt(log.topics[1], 16);
      console.log("Received onchain project ID:", onchainProjectId);

      // Create and send the analysis string to AI
      const analysisString = createAIAnalysisString({
        title,
        description,
        funding_required: Number(fundingRequired),
        location,
        timeline,
        technical_requirements: technicalRequirements,
        impact_metrics: impactMetrics,
        team_background: teamBackground,
        budget_breakdown: budgetItems,
        milestones
      });

      const aiScoreData = await getAIScore(analysisString);
      console.log("AI Score Data:", aiScoreData);

      // Now save to Supabase with the AI scores
      const { data, error } = await supabase.from("projects").insert([
        {
          user_id: user.id,
          title,
          description,
          funding_required: fundingRequired,
          status: "Voting",
          proposal_id: uniqueId,
          onchain_id: onchainProjectId,
          location,
          timeline,
          technical_requirements: technicalRequirements,
          impact_metrics: impactMetrics,
          team_background: teamBackground,
          budget_breakdown: budgetItems,
          milestones: milestones,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ai_score: aiScoreData?.final_score || null,
          ai_score_breakdown: aiScoreData?.score_breakdown || null
        }
      ]);

      if (error) throw error;

      console.log("Project saved to database");
      router.push("/projects");

    } catch (error: any) {
      console.error("Error submitting project:", error);
      if (error.data) {
        console.error("Error data:", error.data);
      }
      if (error.receipt) {
        console.error("Transaction receipt:", error.receipt);
      }
      alert("Failed to submit project: " + error.message);
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
                disabled={isAiScoring}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 
                  text-white rounded-lg font-semibold transition-all hover:scale-105 
                  disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isAiScoring ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting AI Score...
                  </>
                ) : (
                  "Submit Project"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
