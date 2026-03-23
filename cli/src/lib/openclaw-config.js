import fs from 'node:fs';
import crypto from 'node:crypto';
import { OPENCLAW_CONFIG } from './paths.js';

export const PLUGIN_ID = 'mimo-voice-openclaw';

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function ensureJsonObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
  return value;
}

export function loadOpenClawConfig() {
  if (!fs.existsSync(OPENCLAW_CONFIG)) {
    throw new Error(`OpenClaw config not found: ${OPENCLAW_CONFIG}`);
  }
  const raw = fs.readFileSync(OPENCLAW_CONFIG, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`OpenClaw config is not valid JSON: ${err?.message || err}`);
  }
  return {
    path: OPENCLAW_CONFIG,
    raw,
    data: ensureJsonObject(parsed, 'OpenClaw config root'),
  };
}

export function ensurePluginContainers(cfg) {
  cfg.plugins ??= {};
  cfg.plugins.entries ??= {};
  cfg.plugins.installs ??= {};
  cfg.plugins.allow ??= [];
  return cfg;
}

export function setPluginEntryConfig(cfg, pluginConfig, { enabled = true } = {}) {
  ensurePluginContainers(cfg);
  cfg.plugins.entries[PLUGIN_ID] ??= {};
  cfg.plugins.entries[PLUGIN_ID].enabled = enabled;
  cfg.plugins.entries[PLUGIN_ID].config = pluginConfig;
}

export function setPluginEnabled(cfg, enabled) {
  ensurePluginContainers(cfg);
  cfg.plugins.entries[PLUGIN_ID] ??= {};
  cfg.plugins.entries[PLUGIN_ID].enabled = enabled;
}

export function setPluginAllow(cfg, enabled) {
  ensurePluginContainers(cfg);
  const allow = new Set(cfg.plugins.allow || []);
  if (enabled) allow.add(PLUGIN_ID);
  else allow.delete(PLUGIN_ID);
  cfg.plugins.allow = [...allow];
}

export function setPluginInstallRecord(cfg, record) {
  ensurePluginContainers(cfg);
  cfg.plugins.installs[PLUGIN_ID] = record;
}

export function removePluginConfigState(cfg) {
  ensurePluginContainers(cfg);
  delete cfg.plugins.entries?.[PLUGIN_ID];
  delete cfg.plugins.installs?.[PLUGIN_ID];
  setPluginAllow(cfg, false);
}

export function writeOpenClawConfig(cfg, { dryRun = false } = {}) {
  const loaded = loadOpenClawConfig();
  const nextRaw = `${JSON.stringify(cfg, null, 2)}\n`;
  const beforeHash = sha256(loaded.raw);
  const afterHash = sha256(nextRaw);
  const changed = loaded.raw !== nextRaw;
  const backupPath = `${OPENCLAW_CONFIG}.bak`;

  if (!dryRun && changed) {
    fs.copyFileSync(OPENCLAW_CONFIG, backupPath);
    const tmpPath = `${OPENCLAW_CONFIG}.tmp`;
    fs.writeFileSync(tmpPath, nextRaw, 'utf8');
    fs.renameSync(tmpPath, OPENCLAW_CONFIG);
  }

  return {
    ok: true,
    path: OPENCLAW_CONFIG,
    backupPath: dryRun || !changed ? null : backupPath,
    changed,
    dryRun,
    beforeHash,
    afterHash,
  };
}
