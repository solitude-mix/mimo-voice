# Release Steps for 0.1.0-alpha.10

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.10.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.10.md)

This document is for releasing `mimo-voice-openclaw-cli@0.1.0-alpha.10`.

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
- `GITHUB_RELEASE_0.1.0-alpha.10.md`
- `.github/workflows/npm-alpha.yml`

Target version:
- `0.1.0-alpha.10`

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
cd ..
PYTHONPATH=. python3 -m unittest service.tests.test_text_processing
```

## Publish

Push:
- commit for `0.1.0-alpha.10`
- tag `v0.1.0-alpha.10`

The GitHub Actions workflow publishes the package with the `alpha` tag when `NPM_TOKEN` is configured, and then promotes the same version to the npm `latest` dist-tag.
