"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const TOP_PROJECTS = [
  {
    title: "Sumatran Rhino Conservation",
    raised: "45,000",
    goal: "60,000",
    votes: 234,
    icon: "🦏",
    progress: 75,
  },
  {
    title: "Amazon Rainforest Protection",
    raised: "128,000",
    goal: "150,000",
    votes: 543,
    icon: "🌳",
    progress: 85,
  },
  {
    title: "Arctic Fox Habitat Preservation",
    raised: "28,000",
    goal: "50,000",
    votes: 167,
    icon: "🦊",
    progress: 56,
  },
];

const FAQ_ITEMS = [
  {
    question: "How does quadratic voting work?",
    answer:
      "Quadratic voting ensures fair governance by making each additional vote cost more than the previous one. For example, 1 vote costs 1 token, 2 votes cost 4 tokens, 3 votes cost 9 tokens, and so on. This prevents wealthy donors from having disproportionate influence.",
  },
  {
    question: "What happens after I donate?",
    answer:
      "When you donate, you receive WildlifeDAO Tokens (WLD) proportional to your contribution. These tokens give you voting power to influence which conservation projects receive funding. All transactions are recorded on the blockchain for complete transparency.",
  },
  {
    question: "How are projects validated?",
    answer:
      "Each project undergoes a rigorous two-phase validation process. First, it must receive approval from at least two authorized validators. Then, it moves to community voting where token holders can participate in funding decisions.",
  },
];

const STATISTICS = [
  { number: "1.2M", label: "Total Donations" },
  { number: "156", label: "Projects Funded" },
  { number: "45K", label: "Active Donors" },
  { number: "92%", label: "Success Rate" },
];

const HOW_IT_WORKS_STEPS = [
  {
    title: "Make a Donation",
    description:
      "Contribute to wildlife conservation using traditional payment methods or cryptocurrency.",
    icon: "💰",
  },
  {
    title: "Receive WLD Tokens",
    description:
      "Get governance tokens proportional to your donation (1 USD = 100 WLD).",
    icon: "🎫",
  },
  {
    title: "Vote on Projects",
    description:
      "Use your tokens to support conservation projects through quadratic voting.",
    icon: "✋",
  },
  {
    title: "Track Impact",
    description:
      "Monitor project progress and see your contribution's direct impact.",
    icon: "📊",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
            WildlifeDAO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            A decentralized governance system empowering donors to
            democratically fund wildlife conservation projects.
          </p>
          <Link
            href="/donate"
            className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-full font-bold text-lg 
            hover:from-pink-600 hover:to-rose-500 transform hover:scale-105 transition-all shadow-lg 
            animate-pulse hover:animate-none"
          >
            Donate Now
          </Link>
        </div>
      </div>

      {/* New Mission Section */}
      <div className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            Revolutionizing Wildlife Conservation
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            WildlifeDAO combines blockchain technology with democratic
            governance to create a transparent, efficient, and fair system for
            funding conservation projects. Through quadratic voting, we ensure
            that every donor's voice matters, regardless of contribution size.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {STATISTICS.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-pink-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section (Enhanced) */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={index} className="relative">
              <div
                className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm 
                            hover:border-pink-300 transition-all text-center"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <span className="text-pink-500 text-2xl">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Projects Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Top Conservation Projects
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {TOP_PROJECTS.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-300 
              transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="h-48 w-full flex items-center justify-center bg-gray-50 text-6xl">
                {project.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {project.title}
                </h3>
                <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-400 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${project.raised} raised</span>
                    <span>Goal: ${project.goal}</span>
                  </div>
                  <div className="text-sm text-pink-500">
                    {project.votes} votes
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Technology Section */}
      <div className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Powered by Blockchain Technology
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our platform leverages Ethereum L2 solutions for fast,
              cost-effective, and environmentally friendly transactions. Smart
              contracts ensure complete transparency and automated fund
              distribution.
            </p>
            <ul className="space-y-4">
              {[
                "ERC-20Votes tokens for governance",
                "Quadratic voting for fair decision making",
                "Automated treasury management",
                "Real-time transaction tracking",
              ].map((item, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="text-pink-500 mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-96">
            <Image
              src="/blockchain-graphic.png"
              alt="Blockchain Technology"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Quadratic Voting"
            description="Fair governance through diminishing returns on voting power"
            icon="🗳️"
          />
          <FeatureCard
            title="Transparent Funding"
            description="All votes and fund disbursements recorded on-chain"
            icon="🔗"
          />
          <FeatureCard
            title="Secure Authentication"
            description="MetaMask integration with one-wallet-per-user policy"
            icon="🔒"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            >
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-semibold text-gray-800">
                  {item.question}
                </span>
                <span className="text-2xl text-pink-500">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-gray-600">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of conservation-minded donors and help shape the
            future of wildlife preservation.
          </p>
          <Link
            href="/login"
            className="inline-block px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-400 
                     text-white rounded-full font-bold text-lg hover:from-pink-600 
                     hover:to-rose-500 transform hover:scale-105 transition-all shadow-lg"
          >
            Start Contributing
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div
      className="p-6 rounded-xl bg-white border border-gray-200 hover:border-pink-300 
    transition-all shadow-sm hover:shadow-md"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
