import { DEFAULT_SERVICE_DIR } from './paths.js';
import { PLUGIN_ID, TOOL_NAME, loadOpenClawConfig, setPluginAllow, setPluginEntryConfig, setToolAllow, writeOpenClawConfig } from './openclaw-config.js';

export const DEFAULTS = {
  serviceBaseUrl: process.env.MIMO_VOICE_SERVICE_BASE_URL || 'http://127.0.0.1:8091',
  serviceDir: process.env.MIMO_VOICE_SERVICE_DIR || DEFAULT_SERVICE_DIR,
  defaultChatId: process.env.MIMO_VOICE_DEFAULT_CHAT_ID || '',
  defaultChannel: process.env.MIMO_VOICE_DEFAULT_CHANNEL || 'telegram',
  preferCli: false,
};

export function configureOpenClaw({
  serviceBaseUrl = DEFAULTS.serviceBaseUrl,
  serviceDir = DEFAULTS.serviceDir,
  defaultChatId = DEFAULTS.defaultChatId,
  defaultChannel = DEFAULTS.defaultChannel,
  preferCli = DEFAULTS.preferCli,
  clearDefaultChatId = false,
  clearDefaultChannel = false,
  dryRun = false,
} = {}) {
  const nextPluginConfig = {
    serviceBaseUrl,
    serviceDir,
    ...(clearDefaultChatId ? {} : (defaultChatId ? { defaultChatId } : {})),
    ...(clearDefaultChannel ? {} : (defaultChannel ? { defaultChannel } : {})),
    preferCli,
  };

  const loaded = loadOpenClawConfig();
  const cfg = loaded.data;
  setPluginEntryConfig(cfg, nextPluginConfig, { enabled: true });
  setPluginAllow(cfg, true);
  setToolAllow(cfg, true, TOOL_NAME);

  const result = writeOpenClawConfig(cfg, { dryRun });
  return {
    ...result,
    config: nextPluginConfig,
    pluginId: PLUGIN_ID,
    notes: [
      result.changed ? 'plugin config updated' : 'no config changes were necessary',
      dryRun ? 'dry-run only; file not written' : 'backup created before write when changes were applied',
      clearDefaultChatId ? 'defaultChatId cleared from plugin config' : 'defaultChatId preserved/set when provided',
      clearDefaultChannel ? 'defaultChannel cleared from plugin config' : 'defaultChannel preserved/set when provided',
      'plugin added to plugins.allow to avoid allowlist drift',
      `tool '${TOOL_NAME}' added to tools.allow for stricter OpenClaw tool policies`,
    ],
  };
}
