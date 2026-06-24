import {
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  FileText,
  HandCoins,
  RotateCcw,
} from "lucide-react";
import { notFound } from "next/navigation";
import {
  openDisputeAction,
  respondToDisputeAction,
  resolveDisputeDemoAction,
  submitWorkAction,
  updateProjectStatusAction,
} from "@/app/actions";
import { BlockchainActions } from "@/components/blockchain-actions";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName, textareaClassName } from "@/components/ui/field";
import { prisma } from "@/lib/db";
import { formatDate, shortAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      deliverables: { orderBy: { createdAt: "desc" } },
      disputes: {
        orderBy: { createdAt: "desc" },
        include: { aiRecommendations: { orderBy: { createdAt: "desc" } } },
      },
      messages: { orderBy: { createdAt: "asc" } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    notFound();
  }

  const activeDispute = project.disputes[0];

  return (
    <PageShell
      title={project.title}
      subtitle={project.description}
      actions={<StatusBadge status={project.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Budget", `${project.budget} ETH`],
                ["Deadline", formatDate(project.deadline)],
                ["Client wallet", shortAddress(project.clientWallet)],
                ["Freelancer wallet", shortAddress(project.freelancerWallet)],
                ["Contract project ID", project.contractProjectId || "Pending"],
                ["Transaction hash", project.transactionHash || "Not recorded"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {label}
                  </div>
                  <div className="mt-2 break-all text-sm font-semibold text-white">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-white">Messages and notes</h2>
            <div className="mt-5">
              <Timeline items={project.messages} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <BlockchainActions
            projectId={project.id}
            budget={project.budget}
            freelancerWallet={project.freelancerWallet}
            contractProjectId={project.contractProjectId}
            status={project.status}
          />

          <Card className="p-5">
            <h2 className="font-semibold text-white">Client actions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <form
                action={updateProjectStatusAction.bind(
                  null,
                  project.id,
                  "Funded",
                )}
              >
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={project.status !== "Created"}
                >
                  <HandCoins className="h-4 w-4" />
                  Mark funded
                </Button>
              </form>
              <form
                action={resolveDisputeDemoAction.bind(
                  null,
                  project.id,
                  "Completed",
                )}
              >
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!["Submitted", "Disputed"].includes(project.status)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Release payment
                </Button>
              </form>
              <form
                action={resolveDisputeDemoAction.bind(
                  null,
                  project.id,
                  "Refunded",
                )}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  disabled={!["Funded", "Submitted", "Disputed"].includes(project.status)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Refund
                </Button>
              </form>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-white">Deliverables</h2>
            <div className="mt-4 space-y-3">
              {project.deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <FileText className="h-4 w-4 text-cyan-300" />
                    {deliverable.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {deliverable.notes}
                  </p>
                  {deliverable.url ? (
                    <a
                      href={deliverable.url}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open deliverable
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
            <form
              action={submitWorkAction.bind(null, project.id)}
              className="mt-5 grid gap-3"
            >
              <Field label="Delivery notes">
                <textarea
                  name="notes"
                  required
                  className={textareaClassName}
                  placeholder="What changed, where to review it, and completion notes."
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="title"
                  className={inputClassName}
                  placeholder="Deliverable title"
                />
                <input
                  name="url"
                  className={inputClassName}
                  placeholder="Demo URL"
                />
              </div>
              <Button type="submit" variant="secondary">
                Submit work
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-white">Dispute</h2>
            {activeDispute ? (
              <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-300/10 p-4">
                <div className="flex items-center gap-2 font-semibold text-rose-100">
                  <AlertOctagon className="h-4 w-4" />
                  {activeDispute.reason}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {activeDispute.clientClaim}
                </p>
                <Button
                  asChild
                  href={`/dispute/${project.id}`}
                  variant="secondary"
                  className="mt-4"
                >
                  Open AI review
                </Button>
                <form
                  action={respondToDisputeAction.bind(
                    null,
                    activeDispute.id,
                    project.id,
                  )}
                  className="mt-4 grid gap-3"
                >
                  <Field label="Freelancer response">
                    <textarea
                      name="freelancerResponse"
                      className={textareaClassName}
                      defaultValue={activeDispute.freelancerResponse || ""}
                    />
                  </Field>
                  <Button type="submit" variant="ghost">
                    Save response
                  </Button>
                </form>
              </div>
            ) : (
              <form action={openDisputeAction.bind(null, project.id)} className="mt-4 grid gap-3">
                <Field label="Reason">
                  <input
                    name="reason"
                    required
                    className={inputClassName}
                    placeholder="Late delivery, missing scope, quality issue..."
                  />
                </Field>
                <Field label="Client claim">
                  <textarea
                    name="clientClaim"
                    required
                    className={textareaClassName}
                    placeholder="Explain what went wrong and what outcome you want."
                  />
                </Field>
                <Button type="submit" variant="danger">
                  Open dispute
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-semibold text-white">Transaction history</h2>
        <div className="mt-4 grid gap-3">
          {project.transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm"
            >
              <div className="font-semibold text-white">{tx.type}</div>
              <div className="mt-1 break-all text-slate-400">{tx.hash}</div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
