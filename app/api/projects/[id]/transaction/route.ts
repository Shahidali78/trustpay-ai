import { ProjectStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const statusByType: Record<string, ProjectStatus> = {
  create: ProjectStatus.Funded,
  fund: ProjectStatus.Funded,
  submit: ProjectStatus.Submitted,
  release: ProjectStatus.Completed,
  refund: ProjectStatus.Refunded,
  dispute: ProjectStatus.Disputed,
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    hash?: string;
    type?: string;
    chainId?: number;
  };

  if (!body.hash || !body.type) {
    return NextResponse.json({ error: "hash and type are required" }, { status: 400 });
  }

  const status = statusByType[body.type];

  await prisma.project.update({
    where: { id },
    data: {
      transactionHash: body.hash,
      ...(status ? { status } : {}),
      transactions: {
        create: {
          hash: body.hash,
          type: body.type,
          chainId: body.chainId,
        },
      },
      messages: {
        create: {
          author: "Wallet",
          role: "Blockchain",
          kind: "transaction",
          content: `Recorded ${body.type} transaction ${body.hash}.`,
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
