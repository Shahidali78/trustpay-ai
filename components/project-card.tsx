import { ArrowUpRight, CalendarDays, WalletCards } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { formatDate, shortAddress } from "@/lib/utils";

type ProjectCardProps = {
  project: {
    id: string;
    title: string;
    description: string;
    budget: string;
    deadline: Date;
    status: string;
    freelancerWallet: string;
    clientWallet: string;
  };
  perspective: "client" | "freelancer" | "admin";
};

export function ProjectCard({ project, perspective }: ProjectCardProps) {
  const counterparty =
    perspective === "client" ? project.freelancerWallet : project.clientWallet;

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <StatusBadge status={project.status} />
        <Link
          href={`/projects/${project.id}`}
          className="focus-ring rounded-lg p-1 text-slate-400 transition hover:bg-white/8 hover:text-white"
          aria-label={`Open ${project.title}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{project.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
        {project.description}
      </p>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/60 p-3">
          <span className="text-slate-400">Budget</span>
          <span className="font-semibold text-white">{project.budget} ETH</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <CalendarDays className="h-4 w-4 text-cyan-300" />
          Due {formatDate(project.deadline)}
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <WalletCards className="h-4 w-4 text-emerald-300" />
          {shortAddress(counterparty)}
        </div>
      </div>
    </Card>
  );
}
