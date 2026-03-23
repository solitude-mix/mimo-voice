import { installCommand } from './install.js';

export async function upgradeCommand() {
  console.log(JSON.stringify({
    ok: true,
    mode: 'refresh',
    notes: [
      'Upgrade currently performs a refresh-style reinstall.',
      'It re-runs install logic to refresh service/plugin assets and re-verify health.',
      'Existing config should be preserved unless later configure is run explicitly.',
    ],
  }, null, 2));

  await installCommand();
}
