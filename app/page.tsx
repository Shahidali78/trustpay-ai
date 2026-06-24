import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  History,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: LockKeyhole,
    title: "Smart contract escrow",
    body: "Funds are held by a Solidity contract and released only through explicit project state transitions.",
  },
  {
    icon: WalletCards,
    title: "Wallet-based payments",
    body: "Local Hardhat wallets can create, fund, submit, release, refund, and dispute escrow projects.",
  },
  {
    icon: Bot,
    title: "AI dispute analysis",
    body: "The assistant reviews agreements, delivery notes, messages, and claims before recommending a resolution.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Client and freelancer dashboards",
    body: "Each side gets focused workflows for project creation, delivery, approval, and dispute response.",
  },
  {
    icon: History,
    title: "Transparent history",
    body: "Transaction hashes, timeline notes, deliverables, and AI decisions stay visible on every project.",
  },
];

export default function Home() {
  return (
    <main className="trust-grid min-h-screen overflow-hidden">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <StatusBadge status="Funded" />
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
              Local testnet and demo mode
            </span>
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
            TrustPay AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Blockchain escrow for freelance work, paired with an AI dispute
            reviewer that turns agreements, delivery notes, and messages into a
            fair resolution recommendation.
          </p>
          <div className="mt-8 grid gap-3 sm:flex">
            <Button asChild href="/dashboard/client" size="lg">
              Launch Demo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              asChild
              href="/dashboard/client"
              variant="secondary"
              size="lg"
            >
              View Client Dashboard
            </Button>
            <Button
              asChild
              href="/dashboard/freelancer"
              variant="ghost"
              size="lg"
            >
              View Freelancer Dashboard
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Demo projects", "3 seeded"],
              ["Escrow network", "Hardhat 31337"],
              ["AI mode", "Live or mock"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-l border-slate-700/70 pl-4 text-sm"
              >
                <div className="font-semibold text-white">{value}</div>
                <div className="mt-1 text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[420px]">
          <div className="absolute inset-0 rounded-[28px] border border-cyan-200/10 bg-slate-950" />
          <Image
            src="/trustpay-hero.png"
            alt="TrustPay AI dashboard showing escrow, wallet, and AI dispute panels"
            fill
            priority
            className="rounded-[28px] object-cover"
            sizes="(min-width: 1024px) 52vw, 100vw"
          />
          <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Escrow", "1.8 ETH locked"],
              ["AI review", "76% confidence"],
              ["Timeline", "8 events"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-white/12 bg-black/50 p-3 backdrop-blur"
              >
                <div className="text-xs text-slate-300">{label}</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/80 bg-slate-950/80 px-5 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/12 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-semibold text-white">
              Freelancers and clients need trust before the work starts.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              TrustPay AI combines transparent escrow mechanics with a neutral
              analysis layer for disputes. The AI never moves funds; it gives a
              structured recommendation that humans can review before resolving
              the escrow.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="p-5">
                <feature.icon className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-4 font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {[
            "Create a project with budget, deadline, and freelancer wallet.",
            "Fund escrow locally, submit work, and release payment.",
            "Open a dispute and save a structured AI recommendation.",
          ].map((item, index) => (
            <div key={item} className="flex gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-sm font-bold text-slate-950">
                {index + 1}
              </div>
              <div>
                <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-300" />
                <p className="leading-7 text-slate-300">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
