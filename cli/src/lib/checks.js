import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { OPENCLAW_CONFIG, PACKAGED_PLUGIN_DIR, PACKAGED_SERVICE_DIR, DEFAULT_PLUGIN_SOURCE_DIR, DEFAULT_SERVICE_DIR } from './paths.js';

const execFileAsync = promisify(execFile);

export function resolveInstallPaths() {
  const serviceDir = process.env.MIMO_VOICE_SERVICE_DIR || DEFAULT_SERVICE_DIR;
  const pluginSourceDir = process.env.MIMO_VOICE_PLUGIN_DIR || DEFAULT_PLUGIN_SOURCE_DIR;
  const venvDir = path.join(serviceDir, '.venv');
  const requirementsFile = path.join(serviceDir, 'requirements.txt');
  const startScript = path.join(serviceDir, 'scripts', 'start.sh');
  const startBgScript = path.join(serviceDir, 'scripts', 'start-bg.sh');
  const statusScript = path.join(serviceDir, 'scripts', 'status.sh');
  const healthUrl = process.env.MIMO_VOICE_HEALTH_URL || 'http://127.0.0.1:8091/health';
  return { serviceDir, pluginSourceDir, venvDir, requirementsFile, startScript, startBgScript, statusScript, healthUrl };
}

async function hasCommand(command, args = ['--version']) {
  try {
    await execFileAsync(command, args, { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

export async function checkServiceHealth() {
  const { healthUrl } = resolveInstallPaths();
  try {
    const { stdout } = await execFileAsync('curl', ['--noproxy', '*', '-fsS', healthUrl], { timeout: 10000 });
    return {
      ok: true,
      detail: stdout.trim() || 'healthy',
      url: healthUrl,
    };
  } catch (err) {
    return {
      ok: false,
      detail: String(err?.stderr || err?.stdout || err?.message || err),
      url: healthUrl,
    };
  }
}

export async function runDoctor() {
  const paths = resolveInstallPaths();
  const checks = [];

  checks.push({ name: 'openclaw_config', ok: fs.existsSync(OPENCLAW_CONFIG), detail: OPENCLAW_CONFIG });
  checks.push({ name: 'packaged_service_dir', ok: fs.existsSync(PACKAGED_SERVICE_DIR), detail: PACKAGED_SERVICE_DIR });
  checks.push({ name: 'packaged_plugin_dir', ok: fs.existsSync(PACKAGED_PLUGIN_DIR), detail: PACKAGED_PLUGIN_DIR });
  checks.push({ name: 'service_dir', ok: fs.existsSync(paths.serviceDir), detail: paths.serviceDir });
  checks.push({ name: 'plugin_source_dir', ok: fs.existsSync(paths.pluginSourceDir), detail: paths.pluginSourceDir });
  checks.push({ name: 'requirements_file', ok: fs.existsSync(paths.requirementsFile), detail: paths.requirementsFile });
  checks.push({ name: 'start_script', ok: fs.existsSync(paths.startScript), detail: paths.startScript });
  checks.push({ name: 'start_bg_script', ok: fs.existsSync(paths.startBgScript), detail: paths.startBgScript });
  checks.push({ name: 'status_script', ok: fs.existsSync(paths.statusScript), detail: paths.statusScript });
  checks.push({ name: 'python3', ok: await hasCommand('python3'), detail: 'python3 --version' });
  checks.push({ name: 'ffmpeg', ok: await hasCommand('ffmpeg', ['-version']), detail: 'ffmpeg -version' });
  checks.push({ name: 'openclaw', ok: await hasCommand('openclaw', ['--version']), detail: 'openclaw --version' });
  checks.push({ name: 'curl', ok: await hasCommand('curl', ['--version']), detail: 'curl --version' });
  checks.push({ name: 'python_venv', ok: await hasCommand('python3', ['-m', 'venv', '--help']), detail: 'python3 -m venv --help' });
  checks.push({ name: 'service_venv', ok: fs.existsSync(paths.venvDir), detail: paths.venvDir });

  const health = await checkServiceHealth();
  checks.push({ name: 'service_health', ok: health.ok, detail: health.detail || health.url });

  return { ok: checks.every((c) => c.ok), checks, paths };
}
