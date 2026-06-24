import { notFound } from "next/navigation";
import {
  generateAndSaveRecommendationAction,
  resolveDisputeDemoAction,
  saveRecommendationAction,
} from "@/app/actions";
import { AIRecommendationCard } from "@/components/ai-recommendation-card";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { analyzeDispute, type DisputeRecommendation } from "@/lib/ai/dispute";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DisputePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      deliverables: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      disputes: {
        orderBy: { createdAt: "desc" },
        include: { aiRecommendations: { orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!project || !project.disputes.length) {
    notFound();
  }

  const dispute = project.disputes[0];
  const saved = dispute.aiRecommendations[0];
  const preview =
    savedRecommendationToOutput(saved) ||
    (await analyzeDispute({
      projectDescription: project.description,
      budget: project.budget,
      deadline: project.deadline.toISOString(),
      deliveryNotes:
        project.deliverables.map((deliverable) => deliverable.notes).join("\n") ||
        "No deliverables submitted yet.",
      clientDisputeReason: `${dispute.reason}\n${dispute.clientClaim}`,
      freelancerResponse: dispute.freelancerResponse || "No response yet.",
      timeline: project.messages.map(
        (message) => `${message.role}: ${message.content}`,
      ),
    }));

  return (
    <PageShell
      title="AI dispute review"
      subtitle={`${project.title} / ${dispute.reason}`}
      actions={<StatusBadge status={dispute.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-white">Dispute details</h2>
            <div className="mt-4 grid gap-3">
              {[
                ["Budget", `${project.budget} ETH`],
                ["Deadline", formatDate(project.deadline)],
                ["Project status", project.status],
                ["Client claim", dispute.clientClaim],
                [
                  "Freelancer response",
                  dispute.freelancerResponse || "No response submitted yet.",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {label}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-white">Evidence timeline</h2>
            <div className="mt-5">
              <Timeline items={project.messages} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <AIRecommendationCard
            recommendation={preview}
            source={saved ? "saved" : "preview"}
          />
          <Card className="p-5">
            <h2 className="font-semibold text-white">Human confirmation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The AI recommendation is advisory only. Demo actions below update
              local project status; on-chain resolution must be confirmed by an
              authorized wallet or admin.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {saved ? (
                <form
                  action={generateAndSaveRecommendationAction.bind(
                    null,
                    dispute.id,
                    project.id,
                  )}
                >
                  <Button type="submit" variant="secondary">
                    Generate another recommendation
                  </Button>
                </form>
              ) : (
                <form
                  action={saveRecommendationAction.bind(
                    null,
                    dispute.id,
                    project.id,
                    JSON.stringify(preview),
                  )}
                >
                  <Button type="submit">Save recommendation</Button>
                </form>
              )}
              <form
                action={resolveDisputeDemoAction.bind(
                  null,
                  project.id,
                  "Completed",
                )}
              >
                <Button type="submit" variant="secondary">
                  Release in demo
                </Button>
              </form>
              <form
                action={resolveDisputeDemoAction.bind(
                  null,
                  project.id,
                  "Refunded",
                )}
              >
                <Button type="submit" variant="ghost">
                  Refund in demo
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function savedRecommendationToOutput(
  saved:
    | {
        recommendation: string;
        confidence: number;
        summary: string;
        reasoning: string;
        suggestedFreelancerPercent: number;
        suggestedClientRefundPercent: number;
        nextSteps: string;
      }
    | undefined,
): DisputeRecommendation | null {
  if (!saved) {
    return null;
  }

  return {
    recommendation: saved.recommendation as DisputeRecommendation["recommendation"],
    confidence: saved.confidence,
    summary: saved.summary,
    reasoning: saved.reasoning,
    suggestedFreelancerPercent: saved.suggestedFreelancerPercent,
    suggestedClientRefundPercent: saved.suggestedClientRefundPercent,
    nextSteps: parseNextSteps(saved.nextSteps),
  };
}

function parseNextSteps(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map(String)
      : ["Review the saved recommendation record."];
  } catch {
    return ["Review the saved recommendation record."];
  }
}
