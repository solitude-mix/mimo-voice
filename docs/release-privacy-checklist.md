# Release Privacy Checklist

Use this checklist before publishing MiMo Voice to GitHub or npm.

---

## 1. Secrets and personal identifiers

Verify none of these appear in tracked files:

- real bot tokens
- real API keys
- real Telegram chat ids
- real allowlists such as `telegram:<real-id>`
- personal usernames / bot usernames
- personal absolute paths
- private webhook URLs

Check especially:

- `README*`
- `docs/*`
- `examples/*`
- `plugin/example-config.jsonc`
- `service/.env.example`
- release notes / changelogs

---

## 2. Local runtime artifacts

Verify none of these are tracked or included in release artifacts:

- `.runtime/`
- `.venv/`
- `service/data/`
- `service/app/data/`
- `__pycache__/`
- generated logs
- pid files
- temporary files

---

## 3. OpenClaw / local machine state

Do not publish:

- live `openclaw.json` fragments with personal values
- `allowFrom` values copied from a real deployment
- local extension install paths that reveal private environment details unless intentionally documented as generic examples

---

## 4. Final pre-release checks

Recommended commands before release:

```bash
git status --short
git diff --stat
```

Search for likely sensitive markers:

```bash
grep -R "telegram:" .
grep -R "botToken" .
grep -R "chat_id\|defaultChatId" .
grep -R "/home/" .
```

For npm CLI packaging, inspect the published file set:

```bash
cd cli
npm pack --dry-run
```

---

## 5. Release rule

If a value came from a real user, real device, real bot, or real deployment, assume it must be replaced with a placeholder before publishing.
