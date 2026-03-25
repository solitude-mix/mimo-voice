# 0.1.0-alpha.9 发布步骤

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.9.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.9.md)

本文用于发布 `mimo-voice-openclaw-cli@0.1.0-alpha.9`。

## 发布前检查

检查这些文件：
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`
- `cli/README.zh-CN.md`
- `cli/CLI.md`
- `cli/CLI.zh-CN.md`
- `ALPHA_NOTES.md`
- `ALPHA_NOTES.zh-CN.md`
- `GITHUB_RELEASE_0.1.0-alpha.9.md`

目标版本：
- `0.1.0-alpha.9`

## 本地打包检查

```bash
cd cli
npm pack --dry-run
```

## 本地验证

```bash
node src/index.js doctor
node src/index.js install
node src/index.js configure --dry-run
```

然后验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## 发布

推送：
- `0.1.0-alpha.9` 对应提交
- tag `v0.1.0-alpha.9`

若已配置 `NPM_TOKEN`，GitHub Actions 会用 `alpha` tag 发布 npm 包。
