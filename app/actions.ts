"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyzeDispute, type DisputeRecommendation } from "@/lib/ai/dispute";
import { resetDemoData } from "@/lib/demo-seed";
import { prisma } from "@/lib/db";

export async function createProjectAction(formData: FormData) {
  const project = await prisma.project.create({
    data: {
      title: required(formData, "title"),
      description: required(formData, "description"),
      budget: required(formData, "budget"),
      deadline: new Date(required(formData, "deadline")),
      clientWallet: required(formData, "clientWallet"),
      freelancerWallet: required(formData, "freelancerWallet"),
      status: "Created",
      metadataURI: `local://projects/${crypto.randomUUID()}`,
      messages: {
        create: {
          author: "Client",
          role: "Client",
          kind: "system",
          content: "Project created in demo database.",
        },
      },
    },
  });

  redirect(`/projects/${project.id}`);
}

export async function updateProjectStatusAction(
  projectId: string,
  status: "Created" | "Funded" | "Submitted" | "Completed" | "Disputed" | "Refunded",
) {
  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  await prisma.message.create({
    data: {
      projectId,
      author: "Demo Admin",
      role: "Admin",
      kind: "system",
      content: `Project status simulated as ${status}.`,
    },
  });

  revalidateProject(projectId);
}

export async function submitWorkAction(projectId: string, formData: FormData) {
  const notes = required(formData, "notes");
  const title = stringValue(formData, "title") || "Project deliverable";
  const url = stringValue(formData, "url") || null;

  await prisma.deliverable.create({
    data: {
      projectId,
      title,
      notes,
      url,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "Submitted" },
  });

  await prisma.message.create({
    data: {
      projectId,
      author: "Freelancer",
      role: "Freelancer",
      kind: "deliverable",
      content: notes,
    },
  });

  revalidateProject(projectId);
}

export async function openDisputeAction(projectId: string, formData: FormData) {
  const dispute = await prisma.dispute.create({
    data: {
      projectId,
      reason: required(formData, "reason"),
      clientClaim: required(formData, "clientClaim"),
      status: "Open",
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "Disputed" },
  });

  await prisma.message.create({
    data: {
      projectId,
      author: "Client",
      role: "Client",
      kind: "dispute",
      content: dispute.clientClaim,
    },
  });

  redirect(`/dispute/${projectId}`);
}

export async function respondToDisputeAction(
  disputeId: string,
  projectId: string,
  formData: FormData,
) {
  const response = required(formData, "freelancerResponse");

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { freelancerResponse: response },
  });

  await prisma.message.create({
    data: {
      projectId,
      author: "Freelancer",
      role: "Freelancer",
      kind: "dispute-response",
      content: response,
    },
  });

  revalidateProject(projectId);
}

export async function generateAndSaveRecommendationAction(
  disputeId: string,
  projectId: string,
) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      deliverables: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      disputes: { where: { id: disputeId } },
    },
  });
  const dispute = project.disputes[0];

  const recommendation = await analyzeDispute({
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
  });

  await saveRecommendation(disputeId, recommendation);
  revalidateProject(projectId);
}

export async function saveRecommendationAction(
  disputeId: string,
  projectId: string,
  encodedRecommendation: string,
) {
  const recommendation = JSON.parse(
    encodedRecommendation,
  ) as DisputeRecommendation;

  await saveRecommendation(disputeId, recommendation);
  revalidateProject(projectId);
}

export async function resolveDisputeDemoAction(
  projectId: string,
  outcome: "Completed" | "Refunded",
) {
  const status = outcome === "Completed" ? "Completed" : "Refunded";

  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  await prisma.dispute.updateMany({
    where: { projectId },
    data: { status: "Resolved" },
  });

  await prisma.message.create({
    data: {
      projectId,
      author: "Demo Admin",
      role: "Admin",
      kind: "resolution",
      content:
        status === "Completed"
          ? "Demo resolution released payment to the freelancer."
          : "Demo resolution refunded the client.",
    },
  });

  revalidateProject(projectId);
}

export async function adminUpdateStatusAction(formData: FormData) {
  const projectId = required(formData, "projectId");
  const status = required(formData, "status") as Parameters<
    typeof updateProjectStatusAction
  >[1];

  await updateProjectStatusAction(projectId, status);
}

export async function resetDemoDataAction() {
  await resetDemoData();
  revalidatePath("/");
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/freelancer");
  revalidatePath("/admin");
}

async function saveRecommendation(
  disputeId: string,
  recommendation: DisputeRecommendation,
) {
  await prisma.aIRecommendation.create({
    data: {
      disputeId,
      recommendation: recommendation.recommendation,
      confidence: recommendation.confidence,
      summary: recommendation.summary,
      reasoning: recommendation.reasoning,
      suggestedFreelancerPercent: recommendation.suggestedFreelancerPercent,
      suggestedClientRefundPercent:
        recommendation.suggestedClientRefundPercent,
      nextSteps: JSON.stringify(recommendation.nextSteps),
    },
  });
}

function required(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateProject(projectId: string) {
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/freelancer");
  revalidatePath("/admin");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/dispute/${projectId}`);
}
