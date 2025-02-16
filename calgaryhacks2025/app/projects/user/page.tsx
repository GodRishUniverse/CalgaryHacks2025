"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: string;
  proposal_id: string;
  funding_required: number;
  created_at: string;
  blockchain_status: string;
  validation_status: string;
}

export default function UserProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProposals();
  }, []);

  const fetchUserProposals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'awaiting review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Proposals</h1>
              <button
                onClick={() => router.push('/projects/submit')}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 
                text-white rounded-lg font-semibold transition-all hover:scale-105"
              >
                Submit New Proposal
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your proposals...</p>
              </div>
            ) : proposals.length > 0 ? (
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:border-pink-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          {proposal.title}
                        </h2>
                        <p className="text-sm text-gray-500 font-mono mb-2">
                          Proposal ID: {proposal.proposal_id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(proposal.validation_status)}`}>
                          {proposal.validation_status}
                        </span>
                        {proposal.blockchain_status && (
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(proposal.blockchain_status)}`}>
                            {proposal.blockchain_status}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{proposal.description}</p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-pink-500 font-medium">
                        ${proposal.funding_required.toLocaleString()} Requested
                      </span>
                      <span className="text-gray-500">
                        Submitted on {new Date(proposal.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/projects/${proposal.id}`)}
                      className="mt-4 w-full px-4 py-2 text-pink-500 border border-pink-500 
                      rounded-lg font-semibold transition-all hover:bg-pink-50 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Proposals Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your conservation journey by submitting your first proposal.
                </p>
                <button
                  onClick={() => router.push('/projects/submit')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 
                  text-white rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Submit Your First Proposal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 