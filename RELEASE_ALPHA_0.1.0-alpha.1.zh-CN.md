# 0.1.0-alpha.1 发布步骤

这份文档用于发布 `mimo-voice-openclaw-cli@0.1.0-alpha.1`。

## 发布前检查

检查这些文件：
- `cli/package.json`
- `cli/CHANGELOG.md`
- `cli/README.md`

当前目标版本：
- `0.1.0-alpha.1`

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

## 发布方式

### 方式 1：本地手动发布

```bash
cd cli
npm publish --tag alpha
```

### 方式 2：GitHub Actions 自动发布

仓库中已提供：
- `.github/workflows/npm-alpha.yml`

触发方式：

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

前提：
- GitHub 仓库已创建
- GitHub Actions secret `NPM_TOKEN` 已配置

## 发布后验证

```bash
npm view mimo-voice-openclaw-cli versions --json
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
```
