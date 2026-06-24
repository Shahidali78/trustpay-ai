import OpenAI from "openai";

export type DisputeRecommendation = {
  recommendation: "release" | "refund" | "partial" | "revise";
  confidence: number;
  summary: string;
  reasoning: string;
  suggestedFreelancerPercent: number;
  suggestedClientRefundPercent: number;
  nextSteps: string[];
};

export type DisputeInput = {
  projectDescription: string;
  budget: string;
  deadline: string;
  deliveryNotes: string;
  clientDisputeReason: string;
  freelancerResponse: string;
  timeline: string[];
};

const fallback: DisputeRecommendation = {
  recommendation: "partial",
  confidence: 0.72,
  summary:
    "The delivery appears to address the core scope, but there are enough unresolved quality or timeline concerns to justify a split resolution.",
  reasoning:
    "The available notes show completed work and active communication, while the dispute language indicates unmet expectations. A partial split keeps incentives aligned without letting either side absorb the full loss.",
  suggestedFreelancerPercent: 70,
  suggestedClientRefundPercent: 30,
  nextSteps: [
    "Ask the freelancer to document completed scope against the original agreement.",
    "Have the client identify the exact acceptance criteria that remain unmet.",
    "Use the split as a settlement baseline if no material breach is proven.",
  ],
};

export async function analyzeDispute(
  input: DisputeInput,
): Promise<DisputeRecommendation> {
  const key = process.env.OPENAI_API_KEY;

  if (key?.startsWith("sk-")) {
    try {
      return await analyzeWithOpenAI(input, key);
    } catch {
      return mockRecommendation(input);
    }
  }

  return mockRecommendation(input);
}

async function analyzeWithOpenAI(input: DisputeInput, apiKey: string) {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a neutral escrow dispute analyst. Return only valid JSON with recommendation, confidence, summary, reasoning, suggestedFreelancerPercent, suggestedClientRefundPercent, and nextSteps. Never instruct the app to move money automatically.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return fallback;
  }

  return normalizeRecommendation(JSON.parse(raw));
}

export function mockRecommendation(input: DisputeInput): DisputeRecommendation {
  const text = [
    input.projectDescription,
    input.deliveryNotes,
    input.clientDisputeReason,
    input.freelancerResponse,
    input.timeline.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  if (/(fraud|not delivered|no delivery|ghosted|nothing|unusable)/.test(text)) {
    return {
      recommendation: "refund",
      confidence: 0.81,
      summary:
        "The dispute language suggests the client may not have received a usable deliverable.",
      reasoning:
        "The strongest signals are non-delivery or unusable output. In a demo escrow review, this points toward refunding the client unless the freelancer can provide verifiable delivery evidence.",
      suggestedFreelancerPercent: 10,
      suggestedClientRefundPercent: 90,
      nextSteps: [
        "Request proof of delivery from the freelancer.",
        "Compare the submitted work against the project acceptance criteria.",
        "Refund if no evidence of usable delivery is provided.",
      ],
    };
  }

  if (/(complete|approved|accepted|minor|polish|small fix)/.test(text)) {
    return {
      recommendation: "release",
      confidence: 0.78,
      summary:
        "Most evidence points to completed work with only minor acceptance concerns.",
      reasoning:
        "The timeline indicates delivery and limited remaining issues. A release is reasonable if the client cannot tie the dispute to a material scope breach.",
      suggestedFreelancerPercent: 90,
      suggestedClientRefundPercent: 10,
      nextSteps: [
        "Confirm that the final deliverable is accessible.",
        "Ask the client to approve or list one concrete blocker.",
        "Release payment after any minor polish note is closed.",
      ],
    };
  }

  if (/(revision|revise|changes requested|not aligned|scope mismatch)/.test(text)) {
    return {
      recommendation: "revise",
      confidence: 0.69,
      summary:
        "The project likely needs a focused revision cycle before funds are resolved.",
      reasoning:
        "The evidence points to a delivery that exists, but it may not fully match the agreed scope. A short revision window is fairer than immediate release or refund.",
      suggestedFreelancerPercent: 60,
      suggestedClientRefundPercent: 40,
      nextSteps: [
        "Write a short punch list with measurable acceptance criteria.",
        "Give the freelancer a final revision deadline.",
        "Escalate to a partial split if the revision is not completed.",
      ],
    };
  }

  return fallback;
}

function normalizeRecommendation(value: unknown): DisputeRecommendation {
  const data = value as Partial<DisputeRecommendation>;
  const recommendation = isRecommendation(data.recommendation)
    ? data.recommendation
    : fallback.recommendation;

  const freelancer = clampPercent(data.suggestedFreelancerPercent ?? 70);
  const client = clampPercent(data.suggestedClientRefundPercent ?? 100 - freelancer);

  return {
    recommendation,
    confidence: Math.min(Math.max(Number(data.confidence ?? 0.7), 0), 1),
    summary: data.summary || fallback.summary,
    reasoning: data.reasoning || fallback.reasoning,
    suggestedFreelancerPercent: freelancer,
    suggestedClientRefundPercent: client,
    nextSteps: Array.isArray(data.nextSteps)
      ? data.nextSteps.map(String).slice(0, 5)
      : fallback.nextSteps,
  };
}

function clampPercent(value: number) {
  return Math.min(Math.max(Math.round(Number(value) || 0), 0), 100);
}

function isRecommendation(
  value: unknown,
): value is DisputeRecommendation["recommendation"] {
  return (
    value === "release" ||
    value === "refund" ||
    value === "partial" ||
    value === "revise"
  );
}
