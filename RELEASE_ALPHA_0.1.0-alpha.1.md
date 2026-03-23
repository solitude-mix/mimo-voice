# Release Steps for 0.1.0-alpha.1

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.1.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.1.md)

This document is for releasing `mimo-voice-openclaw-cli@0.1.0-alpha.1`.

## Before release

Check these files:
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`

Current target version:
- `0.1.0-alpha.1`

## Local package check

```bash
cd cli
npm pack --dry-run
```

Make sure the package includes:
- `src/`
- `assets/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

## Local verification

```bash
node src/index.js doctor
node src/index.js install
node src/index.js configure --dry-run
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## Publish options

### Option 1: publish locally

```bash
cd cli
npm publish --tag alpha
```

### Option 2: publish with GitHub Actions

This repository includes:
- `.github/workflows/npm-alpha.yml`

Trigger it with:

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

Required:
- GitHub repository exists
- GitHub Actions secret `NPM_TOKEN` is configured

## After release

Check npm:

```bash
npm view mimo-voice-openclaw-cli versions --json
```

Test the package:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
```

## Suggested release note

> `mimo-voice-openclaw-cli@0.1.0-alpha.1` is now available.  
> This is the first alpha release of the MiMo Voice installer CLI. It includes doctor, install, configure, basic uninstall/upgrade, OpenClaw plugin deployment, and the main TTS / Telegram voice workflow.  
> This is still an alpha release, so please verify it in your own environment and restart the gateway after installation when needed.
