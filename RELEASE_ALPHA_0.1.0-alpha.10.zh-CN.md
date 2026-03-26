# 0.1.0-alpha.10 发布步骤

[中文说明](./RELEASE_ALPHA_0.1.0-alpha.10.zh-CN.md) | [English](./RELEASE_ALPHA_0.1.0-alpha.10.md)

这份文档用于发布 `mimo-voice-openclaw-cli@0.1.0-alpha.10`。

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
- `GITHUB_RELEASE_0.1.0-alpha.10.md`
- `.github/workflows/npm-alpha.yml`

目标版本：
- `0.1.0-alpha.10`

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
cd ..
PYTHONPATH=. python3 -m unittest service.tests.test_text_processing
```

## 发布

推送：
- `0.1.0-alpha.10` 对应的 commit
- tag `v0.1.0-alpha.10`

如果 GitHub Actions 中配置了 `NPM_TOKEN`，工作流会先用 `alpha` tag 发布该版本，然后再把同版本推进到 npm `latest`。
