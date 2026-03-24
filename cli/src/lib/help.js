export const HELP_TEXT = `mimo-voice-openclaw-cli

Installer CLI for the unified MiMo Voice project.
Current release target: alpha.

Commands:
  doctor       Verify prerequisites (python3, ffmpeg, OpenClaw, service paths, health)
  install      Install or refresh service/plugin assets, then verify health
  configure    Safely write common mimo-voice-openclaw config values into OpenClaw config
  uninstall    Disable the plugin (current safe scaffold)
  upgrade      Planned upgrade flow scaffold

Common configure flags:
  --service-base-url <url>   Override MiMo service base URL
  --service-dir <path>       Override service directory
  --default-chat-id <id>     Set default Telegram chat id
  --clear-default-chat-id    Remove default Telegram chat id from plugin config
  --default-channel <name>   Set default delivery channel (current practical value: telegram)
  --clear-default-channel    Remove default delivery channel from plugin config
  --prefer-cli               Prefer local service CLI over HTTP in plugin config
  --dry-run                  Show configure result without writing the config file

Environment overrides:
  MIMO_VOICE_WORKSPACE_ROOT
  MIMO_VOICE_SERVICE_DIR
  MIMO_VOICE_PLUGIN_DIR
  MIMO_VOICE_SERVICE_BASE_URL
  MIMO_VOICE_DEFAULT_CHAT_ID
  MIMO_VOICE_DEFAULT_CHANNEL
  MIMO_VOICE_HEALTH_URL
  OPENCLAW_CONFIG_PATH
`;
