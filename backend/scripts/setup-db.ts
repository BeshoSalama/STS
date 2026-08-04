import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function databaseExists() {
  try {
    await db.user.findFirst({ select: { id: true } });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await databaseExists()) {
    console.log("Database already exists. Skipping schema creation.");
    return;
  }

  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(
    npx,
    ["prisma", "db", "execute", "--file", "prisma/migrations/20260804165000_init/migration.sql", "--schema", "prisma/schema.prisma"],
    { stdio: "inherit" }
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
