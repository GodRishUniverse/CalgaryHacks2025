"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ethers } from "ethers";
import { getWildlifeDAOContract } from "@/lib/contracts/WildlifeDAO";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";

// Simplified form type without validation
interface ProjectFormData {
  title: string;
  description: string;
  fundingRequired: number;
  location: string;
  timeline: string;
  technicalRequirements: string;
  impactMetrics: string;
  teamBackground: string;
  budgetBreakdown: {
    item: string;
    amount: number;
    description: string;
  }[];
  milestones: {
    title: string;
    description: string;
    deadline: string;
    deliverables: string[];
  }[];
}

// Update InputField to use forwardRef
const InputField = forwardRef(({ label, error, ...props }: any, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      ref={ref}
      {...props}
      className={`w-full px-4 py-2 rounded-lg border ${
        error ? "border-red-500" : "border-gray-200"
      } focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
));

// Update TextAreaField to use forwardRef
const TextAreaField = forwardRef(({ label, error, ...props }: any, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      ref={ref}
      {...props}
      className={`w-full px-4 py-2 rounded-lg border ${
        error ? "border-red-500" : "border-gray-200"
      } focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
));

// Add display names for better debugging
InputField.displayName = "InputField";
TextAreaField.displayName = "TextAreaField";

export default function SubmitProject() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProjectFormData>({
    defaultValues: {
      budgetBreakdown: [{ item: "", amount: 0, description: "" }],
      milestones: [
        { title: "", description: "", deadline: "", deliverables: [""] },
      ],
    },
  });

  const {
    fields: budgetFields,
    append: appendBudget,
    remove: removeBudget,
  } = useFieldArray({
    control,
    name: "budgetBreakdown",
  });

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control,
    name: "milestones",
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log("Form submitted with data:", data);

      if (!user) {
        alert("Please login first");
        return;
      }

      // Generate a unique proposal identifier
      const proposalId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // First save to Supabase
      const { data: project, error } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            proposal_id: proposalId,
            title: data.title.trim(),
            description: data.description.trim(),
            funding_required: Number(data.fundingRequired),
            location: data.location.trim(),
            timeline: data.timeline?.trim() || null,
            technical_requirements: data.technicalRequirements?.trim() || null,
            impact_metrics: data.impactMetrics?.trim() || null,
            team_background: data.teamBackground?.trim() || null,
            budget_breakdown: data.budgetBreakdown || [],
            milestones: data.milestones || [],
            status: "Pending",
            validation_status: "Awaiting Review",
            validator_comments: [],
            blockchain_status: null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Now submit to blockchain
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask to submit to blockchain");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const daoContract = await getWildlifeDAOContract(signer);

        console.log("Submitting to blockchain:", {
          proposalId,
          title: data.title,
          description: data.description,
          fundingRequired: data.fundingRequired,
        });

        // Convert funding required to wei (assuming 18 decimals)
        const fundingInWei = ethers.parseEther(data.fundingRequired.toString());

        // Call the smart contract
        const tx = await daoContract.submitProject(
          proposalId,
          data.title.trim(),
          data.description.trim(),
          fundingInWei
        );

        console.log("Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        // Look for ProposalSubmitted event
        const event = receipt.logs.find(
          (log: any) => log.eventName === "ProposalSubmitted"
        );

        if (!event) {
          throw new Error("ProposalSubmitted event not found");
        }

        // Update the Supabase record with blockchain status
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            blockchain_status: "Submitted",
            contract_project_id: event.args?.projectId.toString(),
          })
          .eq("id", project.id);

        if (updateError) throw updateError;

        alert("Project submitted successfully!");
        router.push(`/projects/${project.id}`);
      } catch (blockchainError: any) {
        console.error("Blockchain submission failed:", blockchainError);
        alert(
          `Project saved but blockchain submission failed: ${blockchainError.message}`
        );
        router.push(`/projects/${project.id}`);
      }
    } catch (error: any) {
      console.error("Error submitting project:", error);
      alert("Failed to submit project. Please try again.");
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Submit a Project
          </h1>
          <p className="text-gray-600 mb-8">
            Share your wildlife conservation initiative with our community.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Basic Information
              </h2>

              <InputField
                label="Project Title"
                {...register("title", { required: true })}
                placeholder="Enter project title"
              />

              <TextAreaField
                label="Project Description"
                {...register("description", { required: true })}
                placeholder="Describe your conservation project..."
                rows={4}
              />

              <InputField
                label="Funding Required (USD)"
                type="number"
                step="0.01"
                {...register("fundingRequired", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                })}
                placeholder="Enter amount in USD"
              />

              <InputField
                label="Location"
                {...register("location", { required: true })}
                placeholder="Project location"
              />

              <TextAreaField
                label="Timeline"
                {...register("timeline")}
                placeholder="Outline your project timeline..."
                rows={3}
              />
            </section>

            {/* Technical Details */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Technical Details
              </h2>

              <TextAreaField
                label="Technical Requirements"
                {...register("technicalRequirements")}
                placeholder="List technical requirements and specifications..."
                rows={4}
              />

              <TextAreaField
                label="Impact Metrics"
                {...register("impactMetrics")}
                placeholder="How will you measure the project's success?"
                rows={4}
              />

              <TextAreaField
                label="Team Background"
                {...register("teamBackground")}
                placeholder="Describe your team's experience and qualifications..."
                rows={4}
              />
            </section>

            {/* Budget Breakdown */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Budget Breakdown
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    appendBudget({ item: "", amount: 0, description: "" })
                  }
                  className="text-pink-500 hover:text-pink-600 flex items-center gap-1"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {budgetFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-4">
                      <InputField
                        label="Item"
                        {...register(`budgetBreakdown.${index}.item`)}
                        placeholder="Budget item name"
                      />

                      <InputField
                        label="Amount (USD)"
                        type="number"
                        step="0.01"
                        {...register(`budgetBreakdown.${index}.amount`)}
                        placeholder="Amount"
                      />

                      <TextAreaField
                        label="Description"
                        {...register(`budgetBreakdown.${index}.description`)}
                        placeholder="Item description"
                        rows={2}
                      />
                    </div>

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeBudget(index)}
                        className="mt-8 text-red-500 hover:text-red-600"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Milestones */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Milestones
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    appendMilestone({
                      title: "",
                      description: "",
                      deadline: "",
                      deliverables: [""],
                    })
                  }
                  className="text-pink-500 hover:text-pink-600 flex items-center gap-1"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Add Milestone
                </button>
              </div>

              <div className="space-y-6">
                {milestoneFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 bg-gray-50 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">Milestone {index + 1}</h3>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <InputField
                      label="Title"
                      {...register(`milestones.${index}.title`)}
                      placeholder="Milestone title"
                    />

                    <TextAreaField
                      label="Description"
                      {...register(`milestones.${index}.description`)}
                      placeholder="Describe this milestone..."
                      rows={3}
                    />

                    <InputField
                      label="Deadline"
                      type="date"
                      {...register(`milestones.${index}.deadline`)}
                      defaultValue={field.deadline}
                    />
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl 
              font-bold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Project"
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
