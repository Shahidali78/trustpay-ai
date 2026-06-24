import { Plus, ShieldCheck } from "lucide-react";
import { createProjectAction, updateProjectStatusAction } from "@/app/actions";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/project-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName, textareaClassName } from "@/components/ui/field";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const demoClientWallet = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const demoFreelancerWallet = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

export default async function ClientDashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
  const active = projects.filter((project) =>
    ["Created", "Funded", "Submitted", "Disputed"].includes(project.status),
  );
  const totalEscrow = projects
    .filter((project) => ["Funded", "Submitted", "Disputed"].includes(project.status))
    .reduce((sum, project) => sum + Number(project.budget), 0);

  return (
    <PageShell
      title="Client dashboard"
      subtitle="Create projects, fund escrow, approve deliverables, release payment, and open disputes from one focused workspace."
      actions={
        <form action={updateProjectStatusAction.bind(null, projects[0]?.id || "", "Funded")}>
          <Button type="submit" variant="secondary" disabled={!projects[0]}>
            Simulate funding
          </Button>
        </form>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Create project</h2>
              <p className="text-sm text-slate-400">
                The database record can be paired with an on-chain escrow later.
              </p>
            </div>
          </div>
          <form action={createProjectAction} className="mt-6 grid gap-4">
            <Field label="Title">
              <input
                name="title"
                required
                className={inputClassName}
                placeholder="Brand launch landing page"
              />
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                required
                className={textareaClassName}
                placeholder="Scope, milestones, acceptance criteria..."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Budget in ETH">
                <input
                  name="budget"
                  required
                  inputMode="decimal"
                  className={inputClassName}
                  defaultValue="1.00"
                />
              </Field>
              <Field label="Deadline">
                <input
                  name="deadline"
                  required
                  type="date"
                  className={inputClassName}
                />
              </Field>
            </div>
            <Field label="Client wallet">
              <input
                name="clientWallet"
                required
                className={inputClassName}
                defaultValue={demoClientWallet}
              />
            </Field>
            <Field label="Freelancer wallet">
              <input
                name="freelancerWallet"
                required
                className={inputClassName}
                defaultValue={demoFreelancerWallet}
              />
            </Field>
            <Button type="submit" className="w-full">
              Create project
            </Button>
          </form>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {[
            ["Active projects", active.length.toString(), "Created to disputed"],
            ["Escrow locked", `${totalEscrow.toFixed(2)} ETH`, "Demo ledger"],
            ["Client wallet", "Hardhat #1", "Local test account"],
          ].map(([label, value, detail]) => (
            <Card key={label} className="p-5">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {value}
              </div>
              <div className="mt-2 text-xs text-slate-500">{detail}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            perspective="client"
          />
        ))}
      </div>

      <Card className="mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              Escrow lifecycle
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Client actions move projects from created to funded, submitted,
              completed, disputed, or refunded.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Created", "Funded", "Submitted", "Completed", "Disputed", "Refunded"].map(
              (status) => (
                <StatusBadge key={status} status={status} />
              ),
            )}
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
