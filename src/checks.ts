export type Control = {
  id: string;
  title: string;
  required: boolean;
};

export const CONTROLS: Control[] = [
  { id: "authz_tools", title: "Tool calls require explicit authorisation scopes", required: true },
  { id: "audit_log", title: "Agent and tool actions are logged", required: true },
  { id: "pii_redaction", title: "PII is redacted before prompts leave the trust boundary", required: true },
  { id: "human_approval", title: "Irreversible actions need human approval", required: true },
  { id: "secrets_env", title: "Secrets stay in the host environment, not prompts", required: true },
  { id: "eval_gate", title: "Behavioural evals run in CI before release", required: false },
  { id: "model_allowlist", title: "Model endpoints are allow-listed", required: false },
];

export type OrgAnswers = Record<string, boolean>;

export type CheckResult = {
  id: string;
  title: string;
  required: boolean;
  present: boolean;
  status: "pass" | "fail" | "missing";
};

export function evaluate(answers: OrgAnswers): CheckResult[] {
  return CONTROLS.map((c) => {
    const present = Boolean(answers[c.id]);
    let status: CheckResult["status"];
    if (!(c.id in answers)) status = "missing";
    else if (c.required && !present) status = "fail";
    else if (!present) status = "fail";
    else status = "pass";
    return { ...c, present, status };
  });
}

export function summary(results: CheckResult[]) {
  const failedRequired = results.filter((r) => r.required && r.status !== "pass");
  return {
    pass: failedRequired.length === 0,
    failedRequired: failedRequired.map((r) => r.id),
    passed: results.filter((r) => r.status === "pass").length,
    total: results.length,
  };
}

export function toMarkdown(org: string, results: CheckResult[]): string {
  const s = summary(results);
  const lines = results.map(
    (r) => `| ${r.id} | ${r.title} | ${r.required ? "yes" : "no"} | ${r.status} |`,
  );
  return `# Secure AI checklist — ${org}

Overall: **${s.pass ? "PASS" : "FAIL"}** (${s.passed}/${s.total} controls present)

| ID | Control | Required | Status |
| --- | --- | --- | --- |
${lines.join("\n")}
`;
}
