import { describe, expect, it } from "vitest";
import { mockRecommendation } from "@/lib/ai/dispute";

const baseInput = {
  projectDescription: "Design a mobile wallet flow.",
  budget: "1.0",
  deadline: new Date().toISOString(),
  deliveryNotes: "Delivered onboarding and transfer screens.",
  clientDisputeReason: "",
  freelancerResponse: "",
  timeline: ["Client: project created", "Freelancer: delivered work"],
};

describe("mockRecommendation", () => {
  it("recommends refund for non-delivery language", () => {
    const result = mockRecommendation({
      ...baseInput,
      clientDisputeReason: "The freelancer ghosted and nothing was delivered.",
    });

    expect(result.recommendation).toBe("refund");
    expect(result.suggestedClientRefundPercent).toBeGreaterThan(80);
  });

  it("recommends release for completed work language", () => {
    const result = mockRecommendation({
      ...baseInput,
      clientDisputeReason: "Work is complete with only minor polish left.",
    });

    expect(result.recommendation).toBe("release");
    expect(result.suggestedFreelancerPercent).toBeGreaterThan(80);
  });
});
