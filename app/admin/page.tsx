import { Database, RotateCcw, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminUpdateStatusAction, resetDemoDataAction } from "@/app/actions";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/project-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClassName } from "@/components/ui/field";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const statuses = ["Created", "Funded", "Submitted", "Completed", "Disputed", "Refunded"];
const stats: { label: string; valueKey: "projects" | "disputes" | "recommendations"; icon: LucideIcon }[] = [
  { label: "Projects", valueKey: "projects", icon: Database },
  { label: "Disputes", valueKey: "disputes", icon: Sparkles },
  { label: "AI recommendations", valueKey: "recommendations", icon: Sparkles },
];

export default async function AdminPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      disputes: {
        include: { aiRecommendations: { orderBy: { createdAt: "desc" } } },
      },
    },
  });
  const disputes = projects.flatMap((project) =>
    project.disputes.map((dispute) => ({ ...dispute, project })),
  );
  const recommendations = disputes.flatMap((dispute) =>
    dispute.aiRecommendations.map((recommendation) => ({
      ...recommendation,
      dispute,
    })),
  );

  return (
    <PageShell
      title="Admin and demo panel"
      subtitle="Inspect every project, dispute, AI recommendation, and simulate local status changes when the blockchain is not connected."
      actions={
        <form action={resetDemoDataAction}>
          <Button type="submit" variant="danger">
            <RotateCcw className="h-4 w-4" />
            Reset demo data
          </Button>
        </form>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, valueKey, icon: Icon }) => (
          <Card key={label} className="p-5">
            <Icon className="h-5 w-5 text-cyan-300" />
            <div className="mt-3 text-sm text-slate-400">{label}</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {
                {
                  projects: projects.length,
                  disputes: disputes.length,
                  recommendations: recommendations.length,
                }[valueKey]
              }
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="p-5">
            <ProjectCard project={project} perspective="admin" />
            <form action={adminUpdateStatusAction} className="mt-4 grid gap-3">
              <input type="hidden" name="projectId" value={project.id} />
              <select
                name="status"
                defaultValue={project.status}
                className={inputClassName}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary">
                Simulate status
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-white">Disputes</h2>
          <div className="mt-4 space-y-3">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-white">
                    {dispute.project.title}
                  </div>
                  <StatusBadge status={dispute.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{dispute.reason}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <AIRecommendationCard
              key={recommendation.id}
              recommendation={{
                recommendation: recommendation.recommendation,
                confidence: recommendation.confidence,
                summary: recommendation.summary,
                reasoning: recommendation.reasoning,
                suggestedFreelancerPercent:
                  recommendation.suggestedFreelancerPercent,
                suggestedClientRefundPercent:
                  recommendation.suggestedClientRefundPercent,
                nextSteps: parseNextSteps(recommendation.nextSteps),
              }}
              source="saved"
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function parseNextSteps(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
