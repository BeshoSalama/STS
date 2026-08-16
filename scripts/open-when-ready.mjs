import { spawnSync } from "node:child_process";

const [, , url, ...args] = process.argv;

if (!url) {
  console.error("Usage: node scripts/open-when-ready.mjs <url> [--timeout ms] [--interval ms]");
  process.exit(1);
}

const options = parseOptions(args);
const deadline = Date.now() + options.timeout;

while (Date.now() < deadline) {
  if (await isReady(url)) {
    openBrowser(url);
    process.exit(0);
  }

  await sleep(options.interval);
}

console.error(`Timed out waiting for ${url}`);
process.exit(1);

function parseOptions(rawArgs) {
  const parsed = {
    timeout: 120_000,
    interval: 750,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    const value = Number(rawArgs[index + 1]);

    if (arg === "--timeout" && Number.isFinite(value)) {
      parsed.timeout = value;
      index += 1;
    }

    if (arg === "--interval" && Number.isFinite(value)) {
      parsed.interval = value;
      index += 1;
    }
  }

  return parsed;
}

async function isReady(targetUrl) {
  try {
    const response = await fetch(targetUrl, { redirect: "manual" });
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

function openBrowser(targetUrl) {
  const command =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", targetUrl]]
      : process.platform === "darwin"
        ? ["open", [targetUrl]]
        : ["xdg-open", [targetUrl]];

  spawnSync(command[0], command[1], {
    stdio: "ignore",
  });
  console.log(`Opened ${targetUrl}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
