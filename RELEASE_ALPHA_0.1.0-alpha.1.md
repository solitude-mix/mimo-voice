# MiMo Voice 0.1.0-alpha.1 发布步骤

这份文档用于实际发布 `mimo-voice-openclaw-cli@0.1.0-alpha.1`。

## 发布前检查

### 1. 确认版本

检查：

- `projects/mimo-voice/cli/package.json`
- `projects/mimo-voice/cli/CHANGELOG.md`
- `projects/mimo-voice/cli/README.md`

当前目标版本：

- `0.1.0-alpha.1`

### 2. 本地打包检查

```bash
cd projects/mimo-voice/cli
npm pack --dry-run
```

确认打包内容至少包含：
- `src/`
- `assets/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

### 3. 本地功能检查

建议至少确认：

```bash
node src/index.js doctor
node src/index.js install
node src/index.js configure --dry-run
```

并验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## 发布动作清单

### A. 提交最终代码

```bash
git status
git add .
git commit -m "release: prepare 0.1.0-alpha.1"
```

### B. 可选：打 tag

```bash
git tag v0.1.0-alpha.1
```

如果你需要推送：

```bash
git push origin master
git push origin v0.1.0-alpha.1
```

### C. 登录 npm

如果尚未登录：

```bash
npm login
```

### D. 实际发布

有两种方式：

#### 方式 1：本地手动发布

在 `projects/mimo-voice/cli` 目录执行：

```bash
npm publish --tag alpha
```

#### 方式 2：GitHub Actions 自动发布

仓库中已提供：

- `.github/workflows/npm-alpha.yml`

触发方式：

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

前提：
- GitHub 仓库已创建
- 已在 GitHub 仓库 Secrets 中设置 `NPM_TOKEN`

这样不会把这个版本作为默认稳定版发布。

## 发布后验证

### 1. 查看 npm 包

```bash
npm view mimo-voice-openclaw-cli versions --json
```

### 2. 测试安装入口

```bash
npx mimo-voice-openclaw@0.1.0-alpha.1 doctor
```

如果使用 dist-tag：

```bash
npx mimo-voice-openclaw-cli@alpha doctor
```

## 建议的 alpha 发布说明

建议用类似这段文案：

> `mimo-voice-openclaw-cli@0.1.0-alpha.1` 已发布。  
> 这是 MiMo Voice 的首个 alpha 安装版本，覆盖 doctor、install、configure、basic uninstall/upgrade、OpenClaw plugin 部署，以及 TTS / Telegram voice 主链路。  
> 当前版本仍属于 alpha，建议先在自己的环境中验证，并在安装后执行一次 gateway 重启。

## 当前已知限制

发布说明中建议明确写出：

- 这是 alpha 版本
- `upgrade` 目前是 refresh 风格
- `uninstall` 默认不会删除 Python service 目录和 venv
- 某些环境下 plugin 安装可能回退为本地扩展目录部署
- 安装或启用插件后，建议重启 gateway
