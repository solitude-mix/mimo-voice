# mimo-voice-openclaw-cli

[中文说明](./README.zh-CN.md) | [English](./README.md)

This is the alpha install-and-integration CLI for MiMo Voice.

Its job is not to generate speech by itself. Its job is to install, wire, and verify the pieces around that flow:

- the MiMo Voice Python service
- the MiMo Voice OpenClaw plugin
- the common OpenClaw settings required to connect them

If you are new to this project, this document should be your first operational guide.

Current version:

- `0.1.0-alpha.4`

---

## First: what does this CLI actually do?

It mainly solves three problems:

1. **Environment checks**
   - whether your machine has `python3`, `ffmpeg`, and `openclaw`
   - whether Python `venv` / `pip` work correctly

2. **Install and repair**
   - prepare the service directory
   - create or repair `.venv`
   - install Python dependencies
   - deploy the OpenClaw plugin

3. **OpenClaw-side configuration**
   - tell OpenClaw which service to call
   - tell the plugin how to connect with sane defaults

That means:

- it helps you install the **OpenClaw integration path**
- **it does not magically provide a TTS model service**
- you still need your own model API / provider configuration

---

## What do you need before starting?

### Required environment

- Linux or WSL
- `python3`
- `ffmpeg`
- `openclaw`
- `node` / `npm`
- a working Python `venv` / `pip` environment

If you use WSL, prefer explicit `python3` instead of bare `python`.

### Required business-side config

This is where earlier docs were not newcomer-friendly enough, so here is the plain version:

If your end goal is “OpenClaw sends voice messages in Telegram”, you still need to prepare:

- a working **TTS model / API service**
- its:
  - `base_url`
  - `api_key` if required
  - `model` name
  - default `voice` / output format parameters
- a working **Telegram bot token**
- a target **chat id** if you want a default destination

In other words, this CLI solves the install-and-wire part.
**You still need to know which model API you are calling and how it should be configured.**

---

## Shortest successful path

### Step 1: install system dependencies

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

> Note: `python3 -m venv --help` working does not guarantee that a newly created virtual environment will contain a usable `pip`.
> Some Ubuntu / WSL environments can create `.venv` successfully while still leaving it without working `pip` support.

---

### Step 2: install the CLI globally

The most reliable path right now is a global install:

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
```

After that, you can run:

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

### Step 3: run `doctor`

```bash
mimo-voice-openclaw doctor
```

`doctor` checks:

- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service paths
- plugin paths
- provider config presence (`MIMO_API_KEY`)
- provider config overrides / defaults (`MIMO_API_URL`, `MIMO_MODEL`, `MIMO_DEFAULT_VOICE`, `MIMO_AUDIO_FORMAT`)
- Telegram config presence (`TELEGRAM_BOT_TOKEN`)
- Telegram API override / default (`TELEGRAM_API_BASE`)
- provider endpoint reachability
- Telegram API reachability
- service status script output
- whether an existing `.venv` already has working `pip`
- service health

If `service_health` is already OK, a missing `service/.venv` is treated as tolerated instead of a hard failure.

---

### Step 4: install

```bash
mimo-voice-openclaw install
```

The install flow will:

- prepare service assets
- check or create the venv
- try to repair an existing `.venv` if it is missing `pip`
- install Python dependencies
- deploy the plugin
- verify service health

---

### Step 5: write OpenClaw config

Basic configure example:

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service
```

If you only want to preview the changes:

```bash
mimo-voice-openclaw configure --dry-run
```

If you want to clear the default Telegram chat id:

```bash
mimo-voice-openclaw configure --clear-default-chat-id
```

---

### Step 6: verify the integration

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If the commands do not show up immediately, restart the gateway and check again.

---

## The place beginners get stuck most often: model and API config

This part is critical.

Even if the CLI install succeeds, that does not automatically mean your voice-generation path is configured correctly.

### Questions you need to answer

#### 1. Is your TTS service actually running?

Confirm:

- the service is started
- the address is reachable
- the port is correct

#### 2. Do you know your `base_url`?

This is the API endpoint for your model service, for example:

```text
http://127.0.0.1:8000/v1
```

#### 3. Do you know what to put in `model`?

That value is not invented by the CLI.
It is the actual model name exposed by your backend service.

#### 4. Do you know where `api_key` belongs?

If your model service requires authentication, you need an API key.
By design, that belongs in **provider config**, not Telegram config, and not the OpenClaw plugin config itself.

#### 5. Is your Telegram side ready?

At minimum, you usually need:

- a bot token
- a target chat id, if you want a default send destination

---

## A useful way to think about config layers

The current alpha still has room to improve config entry points, but the cleanest mental model is:

### A. provider config
Responsible for:

- `base_url`
- `api_key`
- `model`
- `voice`
- default output-format settings

### B. channel config
Responsible for:

- Telegram bot token
- default chat id
- channel delivery parameters

### C. OpenClaw integration config
Responsible for:

- `service_base_url`
- `default_channel`
- how OpenClaw calls the service
- how the plugin is wired into commands and tools

Once you think about it this way, it becomes much easier not to mix model settings with Telegram delivery settings.

---

## About `npx`

Some npm / npx versions do not reliably expose the package bin for one-shot remote execution.
Because of that, this style may fail on some machines:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.4 doctor
```

If you want a stable and reproducible path, prefer global install:

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
```

---

## FAQ

### Do I need to install ffmpeg myself?
Yes.

This project depends on `ffmpeg` for audio conversion.

### Can I use it without global installation?
Yes, but global install is still the most reliable path right now.

If you are working in a development checkout, you can also run the local source directly:

```bash
node src/index.js doctor
node src/index.js install
```

### Why can the first `doctor` report `service_health` failure?
Usually because the service is not running yet.
Run `install` first, then run `doctor` again.

### Why does `install` fail with `No module named pip`?
That usually means either:

- the system is missing complete Python venv / ensurepip support
- or an old `.venv` is already broken

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

If your system uses Python 3.12:

```bash
sudo apt install -y python3.12-venv
```

2. Remove the old virtual environment:

```bash
rm -rf /home/zhouts/.openclaw/mimo-voice-openclaw/service/.venv
```

3. Run install again:

```bash
mimo-voice-openclaw install
```

### Why restart the gateway after install?
Because OpenClaw sometimes needs one restart after plugin installation before commands and plugin state appear consistently.

---

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
- provider env presence and defaults
- Telegram env presence and defaults
- provider endpoint reachability
- Telegram API reachability
- service status script output
- pid-file state (including stale pid detection)
- recent service log tail
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
Writes plugin config into OpenClaw.
Supports:

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

---

## What should you read next?

Once the CLI path is running, continue with:

- [Quick start](../docs/quickstart.md)
- [Project overview README](../README.md)
- [Configuration guide](../docs/configuration.md)
- [OpenClaw integration guide](../docs/openclaw-integration.md)
- [Service details](../service/SERVICE.md)
- [Plugin details](../plugin/PLUGIN.md)
- [Alpha notes](../ALPHA_NOTES.md)

---

## A realistic note for alpha users

The CLI is already useful for installation, repair, and integration, but the overall project still has work to do around normalized model config and cleaner multi-channel architecture.

So the most realistic path today is:

- get the install flow working
- confirm your model API really works
- get Telegram + OpenClaw working first
- then evolve toward a fuller config model and multi-channel design
penClaw working first
- then evolve toward a fuller config model and multi-channel design
nel design
nClaw working first
- then evolve toward a fuller config model and multi-channel design
