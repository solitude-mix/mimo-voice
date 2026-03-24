import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { OPENCLAW_CONFIG, PACKAGED_PLUGIN_DIR, PACKAGED_SERVICE_DIR, DEFAULT_PLUGIN_SOURCE_DIR, DEFAULT_SERVICE_DIR } from './paths.js';

const execFileAsync = promisify(execFile);
const OPENCLAW_ENV_PATH = path.join(process.env.HOME || '', '.openclaw', '.env');

export function resolveInstallPaths() {
  const serviceDir = process.env.MIMO_VOICE_SERVICE_DIR || DEFAULT_SERVICE_DIR;
  const pluginSourceDir = process.env.MIMO_VOICE_PLUGIN_DIR || DEFAULT_PLUGIN_SOURCE_DIR;
  const venvDir = path.join(serviceDir, '.venv');
  const requirementsFile = path.join(serviceDir, 'requirements.txt');
  const startScript = path.join(serviceDir, 'scripts', 'start.sh');
  const startBgScript = path.join(serviceDir, 'scripts', 'start-bg.sh');
  const statusScript = path.join(serviceDir, 'scripts', 'status.sh');
  const pidFile = path.join(serviceDir, '.runtime', 'service.pid');
  const logFile = path.join(serviceDir, '.runtime', 'service.log');
  const healthUrl = process.env.MIMO_VOICE_HEALTH_URL || 'http://127.0.0.1:8091/health';
  return { serviceDir, pluginSourceDir, venvDir, requirementsFile, startScript, startBgScript, statusScript, pidFile, logFile, healthUrl };
}

async function hasCommand(command, args = ['--version']) {
  try {
    await execFileAsync(command, args, { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

function loadEnvValue(name) {
  const direct = process.env[name];
  if (direct && String(direct).trim()) return String(direct).trim();
  if (!OPENCLAW_ENV_PATH || !fs.existsSync(OPENCLAW_ENV_PATH)) return null;
  const raw = fs.readFileSync(OPENCLAW_ENV_PATH, 'utf8');
  const match = raw.match(new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function checkRequiredEnv(name, description) {
  const value = loadEnvValue(name);
  return {
    ok: Boolean(value),
    detail: value
      ? `${name} configured (${description})`
      : `Missing ${name} (${description}); set it in env or ~/.openclaw/.env`,
  };
}

function checkOptionalEnv(name, fallback, description) {
  const value = loadEnvValue(name);
  return {
    ok: true,
    detail: value
      ? `${name}=${value} (${description})`
      : `${name} not set; using default ${fallback} (${description})`,
  };
}

function checkProviderSourceEnv() {
  const source = (loadEnvValue('MIMO_PROVIDER_SOURCE') || 'direct').trim();
  const normalized = source.toLowerCase();
  if (normalized === 'direct') {
    return { ok: true, detail: `MIMO_PROVIDER_SOURCE=${source} (direct env-based provider config)` };
  }
  if (normalized === 'mini-vico' || normalized === 'mini_vico') {
    const profile = loadEnvValue('MIMO_PROVIDER_PROFILE') || 'default';
    const configPath = loadEnvValue('MINI_VICO_CONFIG_PATH');
    return {
      ok: Boolean(configPath),
      detail: configPath
        ? `MIMO_PROVIDER_SOURCE=${source} profile=${profile} config_path=${configPath}`
        : `MIMO_PROVIDER_SOURCE=${source} but MINI_VICO_CONFIG_PATH is missing`,
    };
  }
  return {
    ok: false,
    detail: `Unsupported MIMO_PROVIDER_SOURCE=${source}. Supported values: direct, mini-vico`,
  };
}

function checkMiniVicoConfigPath() {
  const source = (loadEnvValue('MIMO_PROVIDER_SOURCE') || 'direct').trim().toLowerCase();
  if (!(source === 'mini-vico' || source === 'mini_vico')) {
    return { ok: true, detail: 'mini-vico config path check skipped (provider source is not mini-vico)' };
  }
  const configPath = loadEnvValue('MINI_VICO_CONFIG_PATH');
  if (!configPath) {
    return { ok: false, detail: 'MINI_VICO_CONFIG_PATH is required when MIMO_PROVIDER_SOURCE=mini-vico' };
  }
  const expanded = configPath.startsWith('~')
    ? path.join(process.env.HOME || '', configPath.slice(1))
    : configPath;
  return {
    ok: fs.existsSync(expanded),
    detail: fs.existsSync(expanded)
      ? `mini-vico config file found: ${expanded}`
      : `mini-vico config file not found: ${expanded}`,
  };
}

async function checkSystemEnsurePip() {
  try {
    await execFileAsync('python3', ['-m', 'ensurepip', '--version'], { timeout: 10000 });
    return {
      ok: true,
      detail: 'python3 -m ensurepip --version',
    };
  } catch (err) {
    return {
      ok: false,
      detail: String(err?.stderr || err?.stdout || err?.message || err),
    };
  }
}

async function checkVenvPip(venvDir) {
  const venvPython = path.join(venvDir, 'bin', 'python3');
  if (!fs.existsSync(venvPython)) {
    return {
      ok: false,
      detail: `Missing venv python: ${venvPython}`,
    };
  }

  try {
    await execFileAsync(venvPython, ['-m', 'pip', '--version'], { timeout: 10000 });
    return {
      ok: true,
      detail: `${venvPython} -m pip --version`,
    };
  } catch (err) {
    return {
      ok: false,
      detail: String(err?.stderr || err?.stdout || err?.message || err),
    };
  }
}

function tailFile(filePath, maxLines = 20) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  return lines.slice(-maxLines).join('\n');
}

async function checkUrlReachable(url, { method = 'GET', timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
    });
    return {
      ok: true,
      detail: `${method} ${url} -> HTTP ${res.status}`,
      status: res.status,
      url,
    };
  } catch (err) {
    return {
      ok: false,
      detail: `${method} ${url} failed: ${String(err?.message || err)}`,
      url,
    };
  } finally {
    clearTimeout(timer);
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

async function checkServiceStatusScript(statusScript, serviceDir) {
  if (!fs.existsSync(statusScript)) {
    return {
      ok: false,
      detail: `Missing status script: ${statusScript}`,
    };
  }
  try {
    const { stdout } = await execFileAsync('bash', ['scripts/status.sh'], { cwd: serviceDir, timeout: 10000 });
    return {
      ok: true,
      detail: stdout.trim() || 'service status script returned OK',
    };
  } catch (err) {
    return {
      ok: false,
      detail: String(err?.stdout || err?.stderr || err?.message || err).trim(),
    };
  }
}

function checkPidFileState(pidFile) {
  if (!fs.existsSync(pidFile)) {
    return {
      ok: false,
      detail: `pid file not found: ${pidFile}`,
      stale: false,
    };
  }
  const pid = fs.readFileSync(pidFile, 'utf8').trim();
  if (!pid) {
    return {
      ok: false,
      detail: `pid file empty: ${pidFile}`,
      stale: true,
    };
  }
  try {
    process.kill(Number(pid), 0);
    return {
      ok: true,
      detail: `pid file present and process exists: ${pid}`,
      stale: false,
    };
  } catch {
    return {
      ok: false,
      detail: `stale pid file detected: ${pid}`,
      stale: true,
    };
  }
}

function summarizeDoctorOk(checks) {
  return checks.every((check) => {
    if (check.name === 'service_venv' && check.ok === false) {
      const healthCheck = checks.find((item) => item.name === 'service_health');
      return healthCheck?.ok === true;
    }
    if (
      check.name === 'provider_api_url' ||
      check.name === 'provider_model' ||
      check.name === 'provider_default_voice' ||
      check.name === 'provider_audio_format' ||
      check.name === 'telegram_api_base' ||
      check.name === 'provider_endpoint_reachable' ||
      check.name === 'telegram_api_reachable' ||
      check.name === 'service_status_script' ||
      check.name === 'service_pid_state' ||
      check.name === 'service_log_tail'
    ) {
      return true;
    }
    return check.ok;
  });
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

  const ensurePip = await checkSystemEnsurePip();
  checks.push({ name: 'python_ensurepip', ok: ensurePip.ok, detail: ensurePip.detail });

  checks.push({ name: 'provider_source', ...checkProviderSourceEnv() });
  checks.push({ name: 'mini_vico_config_path', ...checkMiniVicoConfigPath() });
  checks.push({ name: 'provider_api_key', ...checkRequiredEnv('MIMO_API_KEY', 'provider credential (required for direct, optional if mini-vico config embeds api_key)') });
  checks.push({ name: 'provider_api_url', ...checkOptionalEnv('MIMO_API_URL', 'https://api.xiaomimimo.com/v1/chat/completions', 'provider endpoint (used directly when source=direct)') });
  checks.push({ name: 'provider_model', ...checkOptionalEnv('MIMO_MODEL', 'mimo-v2-tts', 'provider model (used directly when source=direct)') });
  checks.push({ name: 'provider_default_voice', ...checkOptionalEnv('MIMO_DEFAULT_VOICE', 'default_zh', 'provider default voice (used directly when source=direct)') });
  checks.push({ name: 'provider_audio_format', ...checkOptionalEnv('MIMO_AUDIO_FORMAT', 'wav', 'provider audio format (used directly when source=direct)') });
  checks.push({ name: 'telegram_bot_token', ...checkRequiredEnv('TELEGRAM_BOT_TOKEN', 'Telegram delivery credential') });
  checks.push({ name: 'telegram_api_base', ...checkOptionalEnv('TELEGRAM_API_BASE', 'https://api.telegram.org', 'Telegram API base') });

  const providerSource = (loadEnvValue('MIMO_PROVIDER_SOURCE') || 'direct').trim().toLowerCase();
  const providerUrl = providerSource === 'direct'
    ? (loadEnvValue('MIMO_API_URL') || 'https://api.xiaomimimo.com/v1/chat/completions')
    : null;
  const telegramApiBase = loadEnvValue('TELEGRAM_API_BASE') || 'https://api.telegram.org';
  if (providerUrl) {
    const providerReach = await checkUrlReachable(providerUrl, { method: 'POST', timeoutMs: 8000 });
    checks.push({ name: 'provider_endpoint_reachable', ok: providerReach.ok, detail: providerReach.detail });
  } else {
    checks.push({ name: 'provider_endpoint_reachable', ok: true, detail: 'provider endpoint reachability skipped (source is not direct)' });
  }
  const telegramReach = await checkUrlReachable(telegramApiBase, { method: 'GET', timeoutMs: 8000 });
  checks.push({ name: 'telegram_api_reachable', ok: telegramReach.ok, detail: telegramReach.detail });

  const serviceStatus = await checkServiceStatusScript(paths.statusScript, paths.serviceDir);
  checks.push({ name: 'service_status_script', ok: serviceStatus.ok, detail: serviceStatus.detail });

  const pidState = checkPidFileState(paths.pidFile);
  checks.push({ name: 'service_pid_state', ok: pidState.ok, detail: pidState.detail });

  const serviceVenvExists = fs.existsSync(paths.venvDir);
  checks.push({
    name: 'service_venv',
    ok: serviceVenvExists,
    detail: serviceVenvExists
      ? paths.venvDir
      : `${paths.venvDir} (missing; tolerated when service_health is already OK)`,
  });

  if (serviceVenvExists) {
    const venvPip = await checkVenvPip(paths.venvDir);
    checks.push({ name: 'service_venv_pip', ok: venvPip.ok, detail: venvPip.detail });
  }

  const health = await checkServiceHealth();
  checks.push({ name: 'service_health', ok: health.ok, detail: health.detail || health.url });

  const logTail = tailFile(paths.logFile, 20);
  checks.push({
    name: 'service_log_tail',
    ok: true,
    detail: logTail ? `Recent service log tail:\n${logTail}` : `service log not found: ${paths.logFile}`,
  });

  const hints = [];
  if (!health.ok && pidState.stale) {
    hints.push('Service health failed and pid file is stale. Clear .runtime/service.pid or run scripts/stop-bg.sh / restart the service.');
  }
  if (!health.ok && serviceStatus.ok === false) {
    hints.push('Service is not currently running according to scripts/status.sh. Check .runtime/service.log and restart with scripts/start-bg.sh.');
  }
  const providerReachCheck = checks.find((item) => item.name === 'provider_endpoint_reachable');
  if (providerReachCheck?.detail && String(providerReachCheck.detail).includes('HTTP 401')) {
    hints.push('Provider endpoint is reachable but returned HTTP 401. Re-check MIMO_API_KEY and provider auth expectations.');
  }
  if (providerSource !== 'direct') {
    hints.push('Provider source is not direct. Ensure MINI_VICO_CONFIG_PATH points to a valid config file and the selected profile contains base_url/model/(api_key or env fallback).');
  }
  if (!telegramReach.ok) {
    hints.push('Telegram API reachability probe failed. Check outbound network access, proxy rules, or Telegram connectivity from this machine.');
  }

  return { ok: summarizeDoctorOk(checks), checks, paths, hints };
}
