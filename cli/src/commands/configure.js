import { configureOpenClaw, DEFAULTS } from '../lib/configure.js';

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function readFlag(name, fallback) {
  const key = `--${name}`;
  const idx = process.argv.indexOf(key);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function readBoolFlag(name, fallback) {
  if (!hasFlag(name)) return fallback;
  return true;
}

export async function configureCommand() {
  const result = configureOpenClaw({
    serviceBaseUrl: readFlag('service-base-url', DEFAULTS.serviceBaseUrl),
    serviceDir: readFlag('service-dir', DEFAULTS.serviceDir),
    defaultChatId: readFlag('default-chat-id', DEFAULTS.defaultChatId),
    preferCli: readBoolFlag('prefer-cli', DEFAULTS.preferCli),
    clearDefaultChatId: hasFlag('clear-default-chat-id'),
    dryRun: hasFlag('dry-run'),
  });

  console.log(JSON.stringify(result, null, 2));
}
