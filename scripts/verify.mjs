import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

const require = createRequire(import.meta.url);
const rootDir = process.cwd();
const { loadEnvConfig } = nextEnv;

loadEnvConfig(rootDir);

const checks = [
  {
    label: "/api/health/live",
    modulePath: "./.next/server/app/api/health/live/route.js",
  },
  {
    label: "/api/health",
    modulePath: "./.next/server/app/api/health/route.js",
  },
  {
    label: "/api/health/ready",
    modulePath: "./.next/server/app/api/health/ready/route.js",
  },
];

async function run() {
  const missingBuildOutput = checks.some((check) => {
    const resolved = path.join(rootDir, check.modulePath.replace("./", ""));
    return !existsSync(resolved);
  });

  if (missingBuildOutput) {
    console.error("Build output topilmadi. Avval `npm run build` ishga tushiring.");
    process.exit(1);
  }

  let hasHardFailure = false;

  for (const check of checks) {
    const mod = require(path.join(rootDir, check.modulePath.replace("./", "")));
    const response = await mod.routeModule.userland.GET();
    const payload = await response.json();

    const summary = Array.isArray(payload?.checks)
      ? payload.checks
          .filter((item) => item && item.ready === false)
          .map((item) => item.key)
          .join(", ")
      : "";

    const suffix = summary ? ` | pending: ${summary}` : "";
    console.log(`${check.label} -> ${response.status}${suffix}`);

    if (check.label === "/api/health/live" && response.status >= 500) {
      hasHardFailure = true;
    }
  }

  if (hasHardFailure) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
