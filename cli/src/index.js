#!/usr/bin/env node
import { installCommand } from './commands/install.js';
import { doctorCommand } from './commands/doctor.js';
import { configureCommand } from './commands/configure.js';
import { uninstallCommand } from './commands/uninstall.js';
import { upgradeCommand } from './commands/upgrade.js';
import { HELP_TEXT } from './lib/help.js';

const command = process.argv[2] || 'help';

async function main() {
  if (command === 'install') {
    await installCommand();
    return;
  }
  if (command === 'doctor') {
    await doctorCommand();
    return;
  }
  if (command === 'configure') {
    await configureCommand();
    return;
  }
  if (command === 'uninstall') {
    await uninstallCommand();
    return;
  }
  if (command === 'upgrade') {
    await upgradeCommand();
    return;
  }
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP_TEXT);
    return;
  }

  console.error(JSON.stringify({ ok: false, error: `Unknown command: ${command}` }, null, 2));
  console.log('\n' + HELP_TEXT);
  process.exit(1);
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2));
  process.exit(1);
});
