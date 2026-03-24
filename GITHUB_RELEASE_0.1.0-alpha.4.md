# GitHub Release Draft — v0.1.0-alpha.4

## Title

MiMo Voice v0.1.0-alpha.4

## Release notes

`mimo-voice-openclaw-cli@0.1.0-alpha.4` is now available.

This update focuses on install and doctor polish for the current alpha line.

## Highlights

- fix a false negative in `doctor` when `service_health` is already OK but `service/.venv` is missing
- keep `doctor` strict for real prerequisites while avoiding healthy-service misreports
- clarify Ubuntu / WSL prerequisites for `python3-venv` and `python3.12-venv`
- document the missing-`pip` / `ensurepip` failure mode more clearly
- recommend global install as the most reliable usage path
- note that one-shot `npx` execution may fail on some npm / npx versions even when the package is published correctly

## Recommended usage

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## 中文说明

`mimo-voice-openclaw-cli@0.1.0-alpha.4` 已发布。

这一版主要补强了安装与诊断链路的稳定性。

### 重点更新

- 修复 `doctor` 在 `service_health` 已正常但 `service/.venv` 缺失时的误报问题
- 保持对真实前置依赖的严格检查，同时避免对健康服务误判失败
- 补充 Ubuntu / WSL 下 `python3-venv` 与 `python3.12-venv` 的前置要求说明
- 更清楚地说明缺失 `pip` / `ensurepip` 时的常见失败模式
- 调整文档，改为推荐全局安装作为最稳的使用路径
- 说明某些 npm / npx 版本下一次性 `npx` 执行可能失败，即使包本身已正确发布

### 推荐用法

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

然后验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```
