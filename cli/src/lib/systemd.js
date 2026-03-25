import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const USER_SYSTEMD_DIR = path.join(os.homedir(), '.config', 'systemd', 'user');
const SERVICE_NAME = 'mimo-voice.service';
const ENV_PATH = path.join(os.homedir(), '.openclaw', '.env');

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

export function renderSystemdService({ serviceDir, venvPython }) {
  return `[Unit]\nDescription=MiMo Voice service for OpenClaw\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nWorkingDirectory=${serviceDir}\nEnvironmentFile=${ENV_PATH}\nExecStart=${venvPython} -m uvicorn run:app --host 127.0.0.1 --port 8091\nRestart=always\nRestartSec=3\n\n[Install]\nWantedBy=default.target\n`;
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
