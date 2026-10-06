#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { evaluate, summary, toMarkdown, type OrgAnswers } from "./checks.js";

function usage(): never {
  console.log(`Usage: secure-ai-checklist --org <fixture.yaml> [--out-dir reports]`);
  process.exit(1);
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
}

async function main() {
  const args = process.argv.slice(2);
  const orgPath = argValue(args, "--org");
  if (!orgPath) usage();
  const outDir = argValue(args, "--out-dir") ?? "reports";

  const raw = await readFile(path.resolve(orgPath), "utf8");
  const data = parseYaml(raw) as { name: string; controls: OrgAnswers };
  const results = evaluate(data.controls ?? {});
  const sum = summary(results);

  await mkdir(path.resolve(outDir), { recursive: true });
  const base = path.join(outDir, data.name.replace(/\s+/g, "-").toLowerCase());
  await writeFile(`${base}.json`, JSON.stringify({ org: data.name, summary: sum, results }, null, 2) + "\n");
  await writeFile(`${base}.md`, toMarkdown(data.name, results));

  console.log(`${data.name}: ${sum.pass ? "PASS" : "FAIL"} (${sum.passed}/${sum.total})`);
  if (!sum.pass) {
    console.log(`Failed required: ${sum.failedRequired.join(", ")}`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
