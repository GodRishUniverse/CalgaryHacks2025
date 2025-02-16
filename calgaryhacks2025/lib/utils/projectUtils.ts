export const createAIAnalysisString = (project: {
  title: string;
  description: string;
  funding_required: number;
  location: string | null;
  timeline: string | null;
  technical_requirements: string | null;
  impact_metrics: string | null;
  team_background: string | null;
  budget_breakdown: Array<{ item: string; amount: number }> | null;
  milestones: Array<{ title: string; description: string; deadline: string }> | null;
}) => {
  const sections = [
    `Project Title: ${project.title}`,
    `Description: ${project.description}`,
    `Funding Required: $${project.funding_required.toLocaleString()}`,
    project.location && `Location: ${project.location}`,
    project.timeline && `Timeline: ${project.timeline}`,
    project.technical_requirements && `Technical Requirements: ${project.technical_requirements}`,
    project.impact_metrics && `Impact Metrics: ${project.impact_metrics}`,
    project.team_background && `Team Background: ${project.team_background}`,
  ];

  // Add budget breakdown if exists
  if (project.budget_breakdown?.length) {
    const budgetString = project.budget_breakdown
      .map(item => `${item.item}: $${item.amount.toLocaleString()}`)
      .join('; ');
    sections.push(`Budget Breakdown: ${budgetString}`);
  }

  // Add milestones if exists
  if (project.milestones?.length) {
    const milestonesString = project.milestones
      .map(m => `${m.title} (${m.deadline}): ${m.description}`)
      .join('; ');
    sections.push(`Milestones: ${milestonesString}`);
  }

  // Filter out null/undefined values and join with newlines
  return sections.filter(Boolean).join('\n');
}; 