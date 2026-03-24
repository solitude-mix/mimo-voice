# 0.1.0-alpha.4 发布步骤

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.4.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.4.md)

这份文档用于发布 `mimo-voice-openclaw-cli@0.1.0-alpha.4`。

## 发布前检查

检查这些文件：
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`
- `ALPHA_NOTES.zh-CN.md`
- `GITHUB_RELEASE_0.1.0-alpha.4.md`

目标版本：
- `0.1.0-alpha.4`

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
- `0.1.0-alpha.4` 对应的提交
- tag `v0.1.0-alpha.4`

当仓库已配置 `NPM_TOKEN` 时，GitHub Actions workflow 会自动以 `alpha` tag 发布 npm 包。

## 发布后验证

```bash
npm view mimo-voice-openclaw-cli versions --json
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
mimo-voice-openclaw doctor
```
