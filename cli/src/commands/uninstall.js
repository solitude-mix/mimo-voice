import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { OPENCLAW_HOME } from '../lib/paths.js';
import { TOOL_NAME, loadOpenClawConfig, removePluginConfigState, setPluginEnabled, writeOpenClawConfig } from '../lib/openclaw-config.js';
import { uninstallUserService } from '../lib/systemd.js';

const execFileAsync = promisify(execFile);
const PLUGIN_ID = 'mimo-voice-openclaw';

async function safeExec(command, args, options = {}) {
  return execFileAsync(command, args, {
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 4,
    ...options,
  });
}

function installedPluginDir() {
  return path.join(OPENCLAW_HOME, 'extensions', PLUGIN_ID);
}

export async function uninstallCommand() {
  const steps = [];

  try {
    const pluginDisable = await safeExec('openclaw', ['plugins', 'disable', PLUGIN_ID]);
    steps.push({ step: 'plugins_disable', ok: true, detail: (pluginDisable.stdout || pluginDisable.stderr || '').trim() || `${PLUGIN_ID} disabled` });
  } catch (err) {
    steps.push({ step: 'plugins_disable', ok: true, detail: `${PLUGIN_ID} already disabled or disable skipped` });
  }

  try {
    const loaded = loadOpenClawConfig();
    const cfg = loaded.data;
    setPluginEnabled(cfg, false);
    removePluginConfigState(cfg);
    const writeResult = writeOpenClawConfig(cfg, { dryRun: false });
    steps.push({ step: 'config_cleanup', ok: true, detail: writeResult.changed ? `Removed config/install state for ${PLUGIN_ID} and removed ${TOOL_NAME} from tools.allow` : `No config cleanup needed for ${PLUGIN_ID}` });
  } catch (err) {
    steps.push({ step: 'config_cleanup', ok: false, detail: String(err?.message || err) });
  }

  try {
    const pluginUninstall = await safeExec('openclaw', ['plugins', 'uninstall', PLUGIN_ID, '--force']);
    steps.push({ step: 'plugins_uninstall', ok: true, detail: (pluginUninstall.stdout || pluginUninstall.stderr || '').trim() || `Uninstalled ${PLUGIN_ID}` });
  } catch (err) {
    steps.push({ step: 'plugins_uninstall', ok: true, detail: `${PLUGIN_ID} install record already absent or uninstall skipped` });
  }

  try {
    const dir = installedPluginDir();
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      steps.push({ step: 'plugin_dir_cleanup', ok: true, detail: `Removed ${dir}` });
    } else {
      steps.push({ step: 'plugin_dir_cleanup', ok: true, detail: `No installed plugin directory to remove: ${dir}` });
    }
  } catch (err) {
    steps.push({ step: 'plugin_dir_cleanup', ok: false, detail: String(err?.message || err) });
  }

  try {
    const systemd = await uninstallUserService();
    steps.push({ step: 'systemd_user_service_cleanup', ok: true, detail: `Stopped/removed ${systemd.serviceName} (${systemd.servicePath})` });
  } catch (err) {
    steps.push({ step: 'systemd_user_service_cleanup', ok: false, detail: String(err?.message || err) });
  }

  steps.push({ step: 'note', ok: true, detail: 'Python service directory and virtual environment are intentionally kept for safety; remove them manually if you want a full purge.' });
  const ok = steps.every((s) => s.ok);
  console.log(JSON.stringify({ ok, steps }, null, 2));
  process.exitCode = ok ? 0 : 1;
}
