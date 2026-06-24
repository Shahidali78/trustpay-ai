import { prisma } from "@/lib/db";

const demoWallets = {
  client: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  freelancer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  secondFreelancer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  admin: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
};

export async function resetDemoData() {
  await prisma.aIRecommendation.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        name: "Ava Chen",
        email: "ava.client@example.com",
        role: "CLIENT",
        walletAddress: demoWallets.client,
      },
      {
        name: "Marco Silva",
        email: "marco.freelancer@example.com",
        role: "FREELANCER",
        walletAddress: demoWallets.freelancer,
      },
      {
        name: "Nora Design",
        email: "nora.freelancer@example.com",
        role: "FREELANCER",
        walletAddress: demoWallets.secondFreelancer,
      },
      {
        name: "TrustPay Admin",
        email: "admin@example.com",
        role: "ADMIN",
        walletAddress: demoWallets.admin,
      },
    ],
  });

  const website = await prisma.project.create({
    data: {
      title: "Website redesign project",
      description:
        "Redesign a marketing website with a new responsive homepage, pricing page, and handoff documentation.",
      budget: "1.20",
      deadline: daysFromNow(10),
      clientWallet: demoWallets.client,
      freelancerWallet: demoWallets.freelancer,
      status: "Funded",
      contractProjectId: "1",
      transactionHash:
        "0x8cc3a6295d3d4a9dd44a93d3c02c59a55bb59710aa87ec71be8ce2c3114a8a01",
      metadataURI: "local://projects/website-redesign",
    },
  });

  const chatbot = await prisma.project.create({
    data: {
      title: "AI chatbot integration",
      description:
        "Integrate a support chatbot into a SaaS dashboard using the existing help center content.",
      budget: "2.50",
      deadline: daysFromNow(6),
      clientWallet: demoWallets.client,
      freelancerWallet: demoWallets.freelancer,
      status: "Submitted",
      contractProjectId: "2",
      transactionHash:
        "0x5d2d8f281906de20e782d79a9aabc2e401cf1b7cc1bdc2d59c78dd7a546cd130",
      metadataURI: "local://projects/ai-chatbot-integration",
      deliverables: {
        create: {
          title: "Chatbot beta handoff",
          notes:
            "Embedded the support widget, added fallback prompts, and connected the knowledge base ingestion job.",
          url: "https://demo.local/chatbot-handoff",
        },
      },
    },
  });

  const mobile = await prisma.project.create({
    data: {
      title: "Mobile app UI design",
      description:
        "Design an onboarding and wallet transfer flow for a mobile fintech MVP with Figma-ready screens.",
      budget: "0.95",
      deadline: daysFromNow(-2),
      clientWallet: demoWallets.client,
      freelancerWallet: demoWallets.secondFreelancer,
      status: "Disputed",
      contractProjectId: "3",
      transactionHash:
        "0x34debb9c7fb8c6809e08c7b48f549ff7643751965f693f4c59b347db64bf1d0d",
      metadataURI: "local://projects/mobile-ui-design",
      deliverables: {
        create: {
          title: "Initial Figma delivery",
          notes:
            "Delivered 8 primary screens and a component set. Client requested additional transfer error states.",
          url: "https://demo.local/figma-mobile-ui",
        },
      },
      disputes: {
        create: {
          reason: "Scope mismatch and late delivery",
          clientClaim:
            "The delivery is missing transfer error states and arrived two days after the deadline.",
          freelancerResponse:
            "The original agreement listed onboarding and transfer screens. Error states were discussed later and can be added as a revision.",
          status: "Open",
          aiRecommendations: {
            create: {
              recommendation: "partial",
              confidence: 0.76,
              summary:
                "The submitted work covers the main flow, but a revision or partial split is fair because late delivery and missing edge states remain unresolved.",
              reasoning:
                "The core deliverable exists and appears usable, yet the client has a credible claim about missing error states and schedule impact.",
              suggestedFreelancerPercent: 70,
              suggestedClientRefundPercent: 30,
              nextSteps: JSON.stringify([
                "Confirm whether error states were part of the signed scope.",
                "Offer a 48-hour revision window for the missing screens.",
                "Use a 70/30 split if the revision is not accepted.",
              ]),
            },
          },
        },
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        projectId: website.id,
        author: "Ava Chen",
        role: "Client",
        kind: "system",
        content: "Escrow funded on local Hardhat chain.",
      },
      {
        projectId: website.id,
        author: "Marco Silva",
        role: "Freelancer",
        content: "Wireframes approved. I am moving into responsive UI polish.",
      },
      {
        projectId: chatbot.id,
        author: "Marco Silva",
        role: "Freelancer",
        kind: "deliverable",
        content: "Submitted beta handoff with widget embed and ingestion notes.",
      },
      {
        projectId: chatbot.id,
        author: "Ava Chen",
        role: "Client",
        content: "Reviewing the handoff today. The fallback prompt looks strong.",
      },
      {
        projectId: mobile.id,
        author: "Ava Chen",
        role: "Client",
        kind: "dispute",
        content:
          "Opened dispute because the delivery missed transfer error states and arrived late.",
      },
      {
        projectId: mobile.id,
        author: "Nora Design",
        role: "Freelancer",
        content:
          "Core flow was delivered. I can add the error states as a revision.",
      },
    ],
  });

  await prisma.transaction.createMany({
    data: [
      {
        projectId: website.id,
        hash: website.transactionHash || "",
        type: "fund",
        amount: "1.20",
        chainId: 31337,
      },
      {
        projectId: chatbot.id,
        hash: chatbot.transactionHash || "",
        type: "submit",
        amount: "2.50",
        chainId: 31337,
      },
      {
        projectId: mobile.id,
        hash: mobile.transactionHash || "",
        type: "dispute",
        amount: "0.95",
        chainId: 31337,
      },
    ],
  });

  return { website, chatbot, mobile };
}

function daysFromNow(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value;
}
