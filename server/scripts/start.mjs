#!/usr/bin/env node

import { execSync } from "node:child_process";

async function start() {
  try {
    console.log("Running Prisma migrations...");
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env },
    });

    console.log("Migrations finished.");
    console.log("Starting Next.js server...\n");

    execSync("next start", {
      stdio: "inherit",
      env: { ...process.env },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Startup failed:", message);
    process.exit(1);
  }
}

start();
