# mimo-voice-openclaw-cli

[中文说明](./README.zh-CN.md) | [English](./README.md)

Alpha installer CLI for MiMo Voice.

This CLI installs, configures, and verifies:
- the MiMo Voice Python service
- the MiMo Voice OpenClaw plugin
- the common OpenClaw settings needed to connect them

Current version:
- `0.1.0-alpha.1`

## Requirements

- Linux or WSL
- `python3`
- `ffmpeg`
- `openclaw`

If you use WSL, prefer `python3` instead of bare `python`.

## Install ffmpeg first

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg
```

macOS (Homebrew):

```bash
brew install ffmpeg
```

## Easiest way to start

If you have not installed the CLI globally, use:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 install
```

## Optional: install globally first

```bash
npm install -g mimo-voice-openclaw-cli
```

After that you can run:

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## Recommended flow

### 1. Check prerequisites

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
```

### 2. Install or refresh

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 install
```

### 3. Configure the plugin

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service
```

Preview configuration changes:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 configure --dry-run
```

Clear the default Telegram chat id:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 configure --clear-default-chat-id
```

### 4. Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and try again.

## What each command does

### `doctor`
Checks:
- `python3`
- `ffmpeg`
- `openclaw`
- service paths
- plugin paths
- service health

### `install`
Performs:
- service asset preparation
- venv check or creation
- Python dependency installation
- plugin deployment
- service health verification

### `configure`
Writes the plugin config into OpenClaw.
It supports:
- backup before write
- `--dry-run`
- `--clear-default-chat-id`

### `uninstall`
Removes:
- plugin config
- install record
- global plugin directory

It does not remove the Python service directory or virtual environment by default.

### `upgrade`
Currently refreshes the installation by running the install flow again.

## Notes for alpha users

- Verify the package in your own environment
- Restart the gateway after installation when needed
- `upgrade` is not a differential updater
- Some environments may use a local extension-directory deployment path during installation

See also:
- [Alpha notes](../ALPHA_NOTES.md)
- [中文说明](./README.zh-CN.md)
