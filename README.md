# secure-ai-checklist

Runnable checklist for secure AI practices in tool-using systems. Outputs JSON and markdown.

## Controls

Required: tool authZ, audit logging, PII redaction, human approval for irreversible actions, secrets in the environment.

Optional: eval gates in CI, model endpoint allow lists.

## Run

```bash
npm install
npm test
npm run check -- --org fixtures/org-pass.yaml
npm run check -- --org fixtures/org-fail.yaml   # exits non-zero
```

## Status

A learning project. The example data is made up.

## Licence

MIT
