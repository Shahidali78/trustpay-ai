import { Bot, Code2, Database, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";

const sections = [
  {
    icon: ShieldCheck,
    title: "Escrow contract",
    body: "TrustPayEscrow.sol keeps project funds in a local/testnet contract. It enforces client-only release, client refund, freelancer-only submission, dispute opening, and owner-mediated dispute resolution.",
  },
  {
    icon: Bot,
    title: "AI dispute assistant",
    body: "The analyzer accepts project scope, budget, deadline, delivery notes, client claim, freelancer response, and timeline messages. OPENAI_API_KEY enables live OpenAI analysis; otherwise a keyword-aware mock response keeps the demo fully runnable.",
  },
  {
    icon: Database,
    title: "Local data",
    body: "Prisma and SQLite store projects, messages, deliverables, disputes, AI recommendations, and transaction hashes. The seed command resets the portfolio demo with three realistic projects.",
  },
  {
    icon: Code2,
    title: "Demo architecture",
    body: "Next.js App Router renders the dashboards, Server Actions mutate demo state, wagmi and viem send local wallet transactions, and Hardhat provides the Solidity testnet.",
  },
];

export default function DocsPage() {
  return (
    <PageShell
      title="Docs"
      subtitle="TrustPay AI is a full-stack blockchain escrow platform for freelancers and clients. It uses Solidity smart contracts to lock and release project payments, while an AI assistant analyzes project agreements, delivery notes, and dispute messages to recommend fair resolutions."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="p-5">
            <section.icon className="h-5 w-5 text-cyan-300" />
            <h2 className="mt-4 font-semibold text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {section.body}
            </p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
