# 0.1.0-alpha.2 发布步骤

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.2.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.2.md)

这份文档用于发布 `mimo-voice-openclaw-cli@0.1.0-alpha.2`。

## 发布前检查

检查这些文件：
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`

当前目标版本：
- `0.1.0-alpha.2`

## 本地打包检查

```bash
cd cli
npm pack --dry-run
```

确认至少包含：
- `src/`
- `assets/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

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

## 发布后验证

```bash
npm view mimo-voice-openclaw-cli versions --json
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
```
