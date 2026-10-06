import { describe, expect, it } from "vitest";
import { evaluate, summary, toMarkdown } from "../src/checks.js";

describe("checklist", () => {
  it("passes a complete org", () => {
    const results = evaluate({
      authz_tools: true,
      audit_log: true,
      pii_redaction: true,
      human_approval: true,
      secrets_env: true,
      eval_gate: true,
      model_allowlist: true,
    });
    expect(summary(results).pass).toBe(true);
  });

  it("fails when required controls are absent", () => {
    const results = evaluate({
      authz_tools: false,
      audit_log: true,
      pii_redaction: false,
      human_approval: false,
      secrets_env: true,
    });
    const s = summary(results);
    expect(s.pass).toBe(false);
    expect(s.failedRequired.length).toBeGreaterThan(0);
  });

  it("renders markdown", () => {
    const md = toMarkdown("Test", evaluate({ authz_tools: true }));
    expect(md).toContain("Secure AI checklist");
  });
});
