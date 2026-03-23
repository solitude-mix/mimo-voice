# Release Steps for 0.1.0-alpha.1

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.1.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.1.md)

This document is for releasing `mimo-voice-openclaw-cli@0.1.0-alpha.1`.

## Before release

Check these files:
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`

Target version:
- `0.1.0-alpha.1`

## Local package check

```bash
cd cli
npm pack --dry-run
```

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

## After release

```bash
npm view mimo-voice-openclaw-cli versions --json
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
```
