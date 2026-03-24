# mimo-voice-openclaw-cli

[中文说明](./README.zh-CN.md) | [English](./README.md)

Alpha installer CLI for MiMo Voice.

This CLI installs, configures, and verifies:
- the MiMo Voice Python service
- the MiMo Voice OpenClaw plugin
- the common OpenClaw settings needed to connect them

Current version:
- `0.1.0-alpha.2`

## Requirements

- Linux or WSL
- `python3`
- `ffmpeg`
- `openclaw`
- a working Python `venv` / `pip` environment

If you use WSL, prefer `python3` instead of bare `python`.

## Install system dependencies first

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

If your system Python is 3.12, also install:

```bash
sudo apt install -y python3.12-venv
```

macOS (Homebrew):

```bash
brew install ffmpeg
```

> Note: `python3 -m venv --help` succeeding does not guarantee that a newly created virtual environment will contain a working `pip`.
> On some Ubuntu / WSL environments, a partial `venv` / `ensurepip` setup can create `.venv` successfully while still leaving it without usable `pip`.

## Easiest way to start

If you have not installed the CLI globally, use:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
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
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
```

`doctor` checks:
- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service paths
- plugin paths
- whether an existing `.venv` already has a working `pip`
- service health

### 2. Install or refresh

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

The install flow will:
- prepare service assets
- check or create the venv
- automatically try to repair an existing `.venv` if it is missing `pip`
- install Python dependencies
- deploy the plugin
- verify service health

### 3. Configure the plugin

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service
```

Preview configuration changes:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure --dry-run
```

Clear the default Telegram chat id:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure --clear-default-chat-id
```

### 4. Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and try again.

## FAQ

### Do I need to install ffmpeg myself?
Yes.

This package depends on `ffmpeg` for audio conversion.

### Can I use it without global installation?
Yes.

Use `npx` for the first run.

### When can I use `mimo-voice-openclaw ...` directly?
Only after running:

```bash
npm install -g mimo-voice-openclaw-cli
```

### Why can `doctor` fail on `service_health` the first time?
Usually because the service is not running yet.
Run `install` first, then run `doctor` again.

### Why does `install` fail with `No module named pip`?
This usually means the current machine does not have a complete Python virtual-environment setup, or that an old `.venv` is broken.

Typical error:

```bash
/home/xxx/.venv/bin/python3: No module named pip
```

Recommended fix:

1. Install the system packages first (Ubuntu / WSL):

```bash
sudo apt update
sudo apt install -y python3-venv
```

If your system uses Python 3.12, also run:

```bash
sudo apt install -y python3.12-venv
```

2. Remove the old virtual environment:

```bash
rm -rf /home/zhouts/.openclaw/mimo-voice-openclaw/service/.venv
```

3. Run install again:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

The install flow reuses an existing `.venv` when it finds one.
If that `.venv` is missing `pip`, the later install steps fail.

### Why restart the gateway?
After plugin installation, OpenClaw may need a restart before commands appear consistently.

## What each command does

### `doctor`
Checks:
- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service paths
- plugin paths
- pip availability inside an existing `.venv`
- service health

### `install`
Performs:
- service asset preparation
- venv check or creation
- automatic repair for an existing `.venv` missing `pip`
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
