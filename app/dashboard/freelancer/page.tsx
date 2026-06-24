import { UploadCloud } from "lucide-react";
import { submitWorkAction } from "@/app/actions";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClassName, textareaClassName } from "@/components/ui/field";
import { prisma } from "@/lib/db";
import { shortAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FreelancerDashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { deliverables: true, disputes: true },
  });
  const nextProject = projects.find((project) =>
    ["Funded", "Created"].includes(project.status),
  );
  const submitted = projects.filter((project) => project.status === "Submitted");
  const disputed = projects.filter((project) => project.status === "Disputed");

  return (
    <PageShell
      title="Freelancer dashboard"
      subtitle="Track assigned work, see escrow status, submit deliverables, request release, and respond to disputes."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Assigned", projects.length.toString()],
            ["Awaiting approval", submitted.length.toString()],
            ["In dispute", disputed.length.toString()],
          ].map(([label, value]) => (
            <Card key={label} className="p-5">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {value}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-300 text-slate-950">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Submit work</h2>
              <p className="text-sm text-slate-400">
                {nextProject
                  ? `Target: ${nextProject.title}`
                  : "No funded project is waiting for delivery."}
              </p>
            </div>
          </div>
          {nextProject ? (
            <form
              action={submitWorkAction.bind(null, nextProject.id)}
              className="mt-5 grid gap-4"
            >
              <Field label="Deliverable title">
                <input
                  name="title"
                  className={inputClassName}
                  defaultValue={`${nextProject.title} delivery`}
                />
              </Field>
              <Field label="Delivery notes">
                <textarea
                  name="notes"
                  required
                  className={textareaClassName}
                  placeholder="Summarize what was delivered, links, and testing notes."
                />
              </Field>
              <Field label="Demo URL">
                <input
                  name="url"
                  className={inputClassName}
                  placeholder="https://demo.local/deliverable"
                />
              </Field>
              <Button type="submit">Submit deliverable</Button>
            </form>
          ) : null}
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            perspective="freelancer"
          />
        ))}
      </div>

      <Card className="mt-8 p-5">
        <h2 className="font-semibold text-white">Demo freelancer wallets</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {Array.from(new Set(projects.map((project) => project.freelancerWallet))).map(
            (wallet) => (
              <div
                key={wallet}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-slate-300"
              >
                {shortAddress(wallet)}
              </div>
            ),
          )}
        </div>
      </Card>
    </PageShell>
  );
}
