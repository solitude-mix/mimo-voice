import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { OPENCLAW_CONFIG, OPENCLAW_HOME, PACKAGED_SERVICE_DIR } from '../lib/paths.js';
import { checkServiceHealth, resolveInstallPaths, runDoctor } from '../lib/checks.js';
import { loadOpenClawConfig, setPluginAllow, setPluginEnabled, setPluginInstallRecord, writeOpenClawConfig } from '../lib/openclaw-config.js';

const execFileAsync = promisify(execFile);
const PLUGIN_ID = 'mimo-voice-openclaw';

async function safeExec(command, args, options = {}) {
  return execFileAsync(command, args, {
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 4,
    ...options,
  });
}

function copyPackagedServiceIfNeeded(paths, steps) {
  if (fs.existsSync(paths.requirementsFile)) {
    steps.push({ step: 'service_copy', ok: true, detail: `Using existing service directory: ${paths.serviceDir}` });
    return;
  }
  if (!fs.existsSync(PACKAGED_SERVICE_DIR)) {
    throw new Error(`Packaged service assets missing: ${PACKAGED_SERVICE_DIR}`);
  }
  fs.mkdirSync(path.dirname(paths.serviceDir), { recursive: true });
  fs.cpSync(PACKAGED_SERVICE_DIR, paths.serviceDir, { recursive: true, force: true });
  steps.push({ step: 'service_copy', ok: true, detail: `Copied packaged service assets into ${paths.serviceDir}` });
}

function getInstalledPluginDir() {
  return path.join(OPENCLAW_HOME, 'extensions', PLUGIN_ID);
}

function cleanupInstalledPluginDir(steps) {
  const installedPluginDir = getInstalledPluginDir();
  if (!fs.existsSync(installedPluginDir)) {
    steps.push({ step: 'plugins_cleanup_dir', ok: true, detail: `No installed plugin directory to remove: ${installedPluginDir}` });
    return;
  }
  fs.rmSync(installedPluginDir, { recursive: true, force: true });
  steps.push({ step: 'plugins_cleanup_dir', ok: true, detail: `Removed stale installed plugin directory: ${installedPluginDir}` });
}

function deployPluginDir(paths, steps) {
  const installedPluginDir = getInstalledPluginDir();
  fs.mkdirSync(path.dirname(installedPluginDir), { recursive: true });
  fs.cpSync(paths.pluginSourceDir, installedPluginDir, { recursive: true, force: true });
  steps.push({ step: 'plugins_copy_fallback', ok: true, detail: `Copied plugin source into ${installedPluginDir}` });
  return installedPluginDir;
}

function recordPluginInstall(paths, steps, mode) {
  const loaded = loadOpenClawConfig();
  const cfg = loaded.data;
  setPluginAllow(cfg, true);
  setPluginEnabled(cfg, true);
  const installPath = getInstalledPluginDir();
  setPluginInstallRecord(cfg, {
    source: mode === 'npm' ? 'npm' : 'path',
    spec: mode === 'npm' ? paths.pluginSourceDir : installPath,
    installPath,
    version: '0.1.0',
    resolvedName: PLUGIN_ID,
    resolvedVersion: '0.1.0',
    resolvedSpec: mode === 'npm' ? paths.pluginSourceDir : `${PLUGIN_ID}@0.1.0-local`,
    installedAt: new Date().toISOString(),
  });
  const result = writeOpenClawConfig(cfg, { dryRun: false });
  steps.push({ step: 'plugins_record_install', ok: true, detail: result.changed ? `Recorded ${PLUGIN_ID} install provenance (${mode})` : `Install provenance already up to date for ${PLUGIN_ID}` });
}

export async function installCommand() {
  const doctor = await runDoctor();
  const paths = resolveInstallPaths();
  const steps = [];
  steps.push({ step: 'doctor', ok: doctor.ok, detail: doctor });

  try {
    copyPackagedServiceIfNeeded(paths, steps);
  } catch (err) {
    steps.push({ step: 'service_copy', ok: false, detail: String(err.message || err) });
    console.log(JSON.stringify({ ok: false, steps }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(paths.pluginSourceDir) || !fs.existsSync(paths.serviceDir) || !fs.existsSync(paths.requirementsFile)) {
    steps.push({ step: 'precheck', ok: false, detail: 'Missing required files for install flow.' });
    console.log(JSON.stringify({ ok: false, steps }, null, 2));
    process.exitCode = 1;
    return;
  }

  const venvPython = path.join(paths.venvDir, 'bin', 'python3');

  try {
    if (!fs.existsSync(paths.venvDir)) {
      const createVenv = await safeExec('python3', ['-m', 'venv', paths.venvDir]);
      steps.push({ step: 'venv_create', ok: true, detail: (createVenv.stdout || createVenv.stderr || '').trim() || `Created ${paths.venvDir}` });
    } else {
      steps.push({ step: 'venv_create', ok: true, detail: `Using existing venv: ${paths.venvDir}` });
    }
  } catch (err) {
    steps.push({ step: 'venv_create', ok: false, detail: String(err.stderr || err.stdout || err.message || err) });
    console.log(JSON.stringify({ ok: false, steps }, null, 2));
    process.exitCode = 1;
    return;
  }

  try {
    const pipUpgrade = await safeExec(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip'], { cwd: paths.serviceDir });
    steps.push({ step: 'pip_upgrade', ok: true, detail: (pipUpgrade.stdout || pipUpgrade.stderr || '').trim().split('\n').slice(-3).join('\n') || 'pip upgraded' });
  } catch (err) {
    steps.push({ step: 'pip_upgrade', ok: false, detail: String(err.stderr || err.stdout || err.message || err) });
    console.log(JSON.stringify({ ok: false, steps }, null, 2));
    process.exitCode = 1;
    return;
  }

  try {
    const pipInstall = await safeExec(venvPython, ['-m', 'pip', 'install', '-r', paths.requirementsFile], { cwd: paths.serviceDir });
    steps.push({ step: 'requirements_install', ok: true, detail: (pipInstall.stdout || pipInstall.stderr || '').trim().split('\n').slice(-5).join('\n') || 'requirements installed' });
  } catch (err) {
    steps.push({ step: 'requirements_install', ok: false, detail: String(err.stderr || err.stdout || err.message || err) });
    console.log(JSON.stringify({ ok: false, steps }, null, 2));
    process.exitCode = 1;
    return;
  }

  try {
    const pluginUninstall = await safeExec('openclaw', ['plugins', 'uninstall', PLUGIN_ID, '--force']);
    steps.push({ step: 'plugins_uninstall_existing', ok: true, detail: (pluginUninstall.stdout || pluginUninstall.stderr || '').trim() || `Removed existing plugin ${PLUGIN_ID}` });
  } catch (_err) {
    steps.push({ step: 'plugins_uninstall_existing', ok: true, detail: `No existing plugin cleanup needed for ${PLUGIN_ID}` });
  }

  try {
    cleanupInstalledPluginDir(steps);
  } catch (err) {
    steps.push({ step: 'plugins_cleanup_dir', ok: false, detail: String(err.message || err) });
    console.log(JSON.stringify({ ok: false, steps }, null, 2));
    process.exitCode = 1;
    return;
  }

  try {
    const pluginInstall = await safeExec('openclaw', ['plugins', 'install', paths.pluginSourceDir]);
    steps.push({ step: 'plugins_install', ok: true, detail: (pluginInstall.stdout || pluginInstall.stderr || '').trim() || `Installed plugin from ${paths.pluginSourceDir}` });
    recordPluginInstall(paths, steps, 'local');
  } catch (err) {
    const detail = String(err.stderr || err.stdout || err.message || err);
    steps.push({ step: 'plugins_install', ok: false, detail });

    try {
      deployPluginDir(paths, steps);
      const pluginEnable = await safeExec('openclaw', ['plugins', 'enable', PLUGIN_ID]);
      steps.push({ step: 'plugins_enable_fallback', ok: true, detail: (pluginEnable.stdout || pluginEnable.stderr || '').trim() || `Enabled plugin ${PLUGIN_ID} after fallback copy` });
      recordPluginInstall(paths, steps, 'local');
    } catch (fallbackErr) {
      steps.push({ step: 'plugins_enable_fallback', ok: false, detail: String(fallbackErr.stderr || fallbackErr.stdout || fallbackErr.message || fallbackErr) });
      console.log(JSON.stringify({ ok: false, steps }, null, 2));
      process.exitCode = 1;
      return;
    }
  }

  const preHealth = await checkServiceHealth();
  if (preHealth.ok) {
    steps.push({ step: 'service_health', ok: true, detail: `Service already healthy at ${paths.healthUrl}: ${preHealth.detail}` });
  } else {
    try {
      const startBg = await safeExec('bash', [paths.startBgScript], { cwd: paths.serviceDir });
      steps.push({ step: 'service_start', ok: true, detail: (startBg.stdout || startBg.stderr || '').trim() || `Started service with ${paths.startBgScript}` });
    } catch (err) {
      steps.push({ step: 'service_start', ok: false, detail: String(err.stderr || err.stdout || err.message || err) });
      console.log(JSON.stringify({ ok: false, steps }, null, 2));
      process.exitCode = 1;
      return;
    }

    let healthResult = { ok: false, detail: '', url: paths.healthUrl };
    for (let i = 0; i < 10; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      healthResult = await checkServiceHealth();
      if (healthResult.ok) break;
    }

    steps.push({
      step: 'service_health',
      ok: healthResult.ok,
      detail: healthResult.ok ? `Service healthy at ${paths.healthUrl}: ${healthResult.detail}` : healthResult.detail,
    });

    if (!healthResult.ok) {
      console.log(JSON.stringify({ ok: false, steps }, null, 2));
      process.exitCode = 1;
      return;
    }
  }

  steps.push({ step: 'next', ok: true, detail: `Review ${OPENCLAW_CONFIG} and ensure plugins.entries.mimo-voice-openclaw.config has the right serviceBaseUrl/serviceDir/defaultChatId.` });
  steps.push({ step: 'next', ok: true, detail: 'You can verify the final setup with: openclaw mimo-voice status' });
  steps.push({ step: 'next', ok: true, detail: `If needed, manual foreground start remains: bash ${paths.startScript}` });
  steps.push({ step: 'next', ok: true, detail: 'This install flow now assumes packaged service/plugin assets can ship with the npm package.' });

  console.log(JSON.stringify({ ok: true, steps }, null, 2));
}
