"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface Project {
  id: number;
  title: string;
  description: string;
  raised: number;
  goal: number;
  votes: number;
  progress: number;
  status: "active" | "funded" | "completed";
  deadline: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Sumatran Rhino Conservation",
    description:
      "Protecting the critically endangered Sumatran rhinos through habitat preservation and anti-poaching measures.",
    raised: 45000,
    goal: 60000,
    votes: 234,
    progress: 75,
    status: "active",
    deadline: "2024-04-01",
  },
  {
    id: 2,
    title: "Amazon Rainforest Protection",
    description:
      "Supporting indigenous communities in protecting their ancestral forests from illegal logging.",
    raised: 128000,
    goal: 150000,
    votes: 543,
    progress: 85,
    status: "active",
    deadline: "2024-03-15",
  },
  {
    id: 3,
    title: "Arctic Fox Habitat Preservation",
    description:
      "Establishing protected areas for Arctic fox breeding grounds in Iceland.",
    raised: 28000,
    goal: 50000,
    votes: 167,
    progress: 56,
    status: "active",
    deadline: "2024-05-01",
  },
];

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [userVotes, setUserVotes] = useState<{ [key: number]: number }>({});
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
  };

  const handleVote = (projectId: number) => {
    // Mock voting functionality
    setUserVotes((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || 0) + 1,
    }));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* User Stats */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">500 WLD</div>
                <div className="text-gray-600">Your Balance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">3</div>
                <div className="text-gray-600">Projects Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">25</div>
                <div className="text-gray-600">Total Votes Cast</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">$1,000</div>
                <div className="text-gray-600">Total Contributed</div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROJECTS.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-300 transition-all shadow-md"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {project.title}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>

                  <div className="space-y-4">
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-400 h-2.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ${project.raised.toLocaleString()} raised
                      </span>
                      <span className="text-gray-600">
                        Goal: ${project.goal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="text-pink-500 font-medium">
                          {project.votes}
                        </span>{" "}
                        votes
                      </div>
                      <button
                        onClick={() => handleVote(project.id)}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 
                        text-white rounded-lg text-sm font-semibold transition-all hover:from-pink-600 
                        hover:to-rose-500"
                      >
                        Vote ({userVotes[project.id] || 0})
                      </button>
                    </div>

                    <div className="text-sm text-gray-500">
                      Deadline:{" "}
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
