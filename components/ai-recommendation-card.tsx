import { Bot, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DisputeRecommendation } from "@/lib/ai/dispute";

export function AIRecommendationCard({
  recommendation,
  source,
}: Readonly<{
  recommendation: DisputeRecommendation;
  source: "saved" | "preview";
}>) {
  const confidence = Math.round(recommendation.confidence * 100);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <Bot className="h-4 w-4" />
            AI recommendation
          </div>
          <h3 className="mt-3 text-2xl font-semibold capitalize text-white">
            {recommendation.recommendation}
          </h3>
        </div>
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">
          {confidence}% confidence
        </div>
      </div>
      <p className="mt-4 leading-7 text-slate-300">{recommendation.summary}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Scale className="h-4 w-4 text-cyan-300" />
            Suggested split
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="rounded bg-emerald-300/12 px-2 py-1 text-emerald-100">
              Freelancer {recommendation.suggestedFreelancerPercent}%
            </span>
            <span className="rounded bg-amber-300/12 px-2 py-1 text-amber-100">
              Client {recommendation.suggestedClientRefundPercent}%
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-slate-950/70 p-4">
          <div className="text-sm font-semibold text-white">Source</div>
          <p className="mt-2 text-sm text-slate-400">
            {source === "saved"
              ? "Saved to the dispute record."
              : "Generated from current project context."}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <div className="text-sm font-semibold text-white">Reasoning</div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {recommendation.reasoning}
        </p>
      </div>
      <div className="mt-5">
        <div className="text-sm font-semibold text-white">Next steps</div>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
          {recommendation.nextSteps.map((step) => (
            <li key={step} className="rounded-lg bg-slate-950/60 px-3 py-2">
              {step}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
