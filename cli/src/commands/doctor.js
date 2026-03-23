import { runDoctor } from '../lib/checks.js';

export async function doctorCommand() {
  const result = await runDoctor();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
