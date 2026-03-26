import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const USER_SYSTEMD_DIR = path.join(os.homedir(), '.config', 'systemd', 'user');
const SERVICE_NAME = 'mimo-voice.service';
const OPENCLAW_ENV_PATH = path.join(os.homedir(), '.openclaw', '.env');
const SERVICE_ENV_BASENAME = '.env';

function safeExec(command, args, options = {}) {
  return execFileAsync(command, args, {
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 4,
    ...options,
  });
}

export function getSystemdServicePath() {
  return path.join(USER_SYSTEMD_DIR, SERVICE_NAME);
}

export function getServiceEnvPath(serviceDir) {
  return path.join(serviceDir, SERVICE_ENV_BASENAME);
}

export function renderSystemdService({ serviceDir, venvPython }) {
  const serviceEnvPath = getServiceEnvPath(serviceDir);
  return `[Unit]\nDescription=MiMo Voice service for OpenClaw\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nWorkingDirectory=${serviceDir}\nEnvironmentFile=-${OPENCLAW_ENV_PATH}\nEnvironmentFile=-${serviceEnvPath}\nExecStart=${venvPython} -m uvicorn run:app --host 127.0.0.1 --port 8091\nRestart=always\nRestartSec=3\n\n[Install]\nWantedBy=default.target\n`;
}

async function stopProcessTree(pid) {
  try {
    await safeExec('kill', ['-TERM', String(pid)]);
  } catch {}

  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      await safeExec('kill', ['-0', String(pid)]);
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch {
      return 'terminated';
    }
  }

  try {
    await safeExec('kill', ['-KILL', String(pid)]);
    return 'killed';
  } catch {
    return 'unreachable';
  }
}

export async function stopStaleServiceProcesses({ port = 8091 } = {}) {
  let stdout = '';
  try {
    ({ stdout } = await safeExec('bash', ['-lc', `ss -ltnp '( sport = :${port} )' | tail -n +2 || true`]));
  } catch {
    return { ok: true, found: [], stopped: [], detail: 'socket inspection unavailable; skipped stale port cleanup' };
  }

  const candidates = [];
  for (const line of stdout.split('\n').map((item) => item.trim()).filter(Boolean)) {
    const match = line.match(/users:\(\((?:"([^"]+)",pid=(\d+),fd=\d+)(?:,\([^)]*\))*\)\)/);
    if (!match) continue;
    const [, command, pidText] = match;
    const pid = Number(pidText);
    if (!Number.isFinite(pid)) continue;
    candidates.push({ pid, command, line });
  }

  const relevant = candidates.filter((item) => ['python', 'python3', 'uvicorn'].includes(item.command));
  const stopped = [];
  for (const item of relevant) {
    const result = await stopProcessTree(item.pid);
    stopped.push({ ...item, result });
  }

  return {
    ok: true,
    found: relevant,
    stopped,
    detail: relevant.length ? `stopped ${relevant.length} stale listener(s) on port ${port}` : `no stale listeners found on port ${port}`,
  };
}

export async function installOrUpdateUserService({ serviceDir, venvPython }) {
  const servicePath = getSystemdServicePath();
  fs.mkdirSync(USER_SYSTEMD_DIR, { recursive: true });
  fs.writeFileSync(servicePath, renderSystemdService({ serviceDir, venvPython }), 'utf8');

  await safeExec('systemctl', ['--user', 'daemon-reload']);
  await safeExec('systemctl', ['--user', 'enable', '--now', SERVICE_NAME]);
  const status = await safeExec('systemctl', ['--user', 'is-active', SERVICE_NAME]);

  return {
    ok: true,
    serviceName: SERVICE_NAME,
    servicePath,
    serviceEnvPath: getServiceEnvPath(serviceDir),
    detail: (status.stdout || status.stderr || '').trim() || 'active',
  };
}

export async function uninstallUserService() {
  const servicePath = getSystemdServicePath();
  try {
    await safeExec('systemctl', ['--user', 'disable', '--now', SERVICE_NAME]);
  } catch {}
  try {
    await safeExec('systemctl', ['--user', 'daemon-reload']);
  } catch {}
  if (fs.existsSync(servicePath)) {
    fs.rmSync(servicePath, { force: true });
  }
  try {
    await safeExec('systemctl', ['--user', 'daemon-reload']);
  } catch {}
  return { ok: true, serviceName: SERVICE_NAME, servicePath };
}
