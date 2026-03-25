# Release Steps for 0.1.0-alpha.9

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.9.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.9.md)

This document is for releasing `mimo-voice-openclaw-cli@0.1.0-alpha.9`.

## Before release

Check these files:
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`
- `cli/README.zh-CN.md`
- `cli/CLI.md`
- `cli/CLI.zh-CN.md`
- `ALPHA_NOTES.md`
- `ALPHA_NOTES.zh-CN.md`
- `GITHUB_RELEASE_0.1.0-alpha.9.md`

Target version:
- `0.1.0-alpha.9`

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

## Publish

Push:
- commit for `0.1.0-alpha.9`
- tag `v0.1.0-alpha.9`

The GitHub Actions workflow publishes the package with the `alpha` tag when `NPM_TOKEN` is configured.
