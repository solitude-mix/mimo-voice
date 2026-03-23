import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
export const OPENCLAW_HOME = path.join(os.homedir(), '.openclaw');
export const OPENCLAW_CONFIG = process.env.OPENCLAW_CONFIG_PATH || path.join(OPENCLAW_HOME, 'openclaw.json');

export const PACKAGED_SERVICE_DIR = path.join(PACKAGE_ROOT, 'assets', 'service');
export const PACKAGED_PLUGIN_DIR = path.join(PACKAGE_ROOT, 'assets', 'plugin');
export const INSTALL_BASE_DIR = process.env.MIMO_VOICE_INSTALL_BASE || path.join(OPENCLAW_HOME, 'mimo-voice-openclaw');

function findWorkspaceRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  while (true) {
    const newServiceDir = path.join(current, 'projects', 'mimo-voice', 'service');
    const newPluginDir = path.join(current, 'projects', 'mimo-voice', 'plugin');
    const legacyServiceDir = path.join(current, 'services', 'mimo-voice-service');
    const legacyPluginDir = path.join(current, '.openclaw', 'extensions', 'mimo-voice-openclaw');

    if (
      fs.existsSync(newServiceDir) ||
      fs.existsSync(newPluginDir) ||
      fs.existsSync(legacyServiceDir) ||
      fs.existsSync(legacyPluginDir)
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return startDir;
    current = parent;
  }
}

const fallbackWorkspaceRoot = findWorkspaceRoot();
export const DEFAULT_WORKSPACE_ROOT = process.env.MIMO_VOICE_WORKSPACE_ROOT || fallbackWorkspaceRoot;

function resolveWorkspaceServiceDir(root) {
  const newDir = path.join(root, 'projects', 'mimo-voice', 'service');
  if (fs.existsSync(newDir)) return newDir;
  return path.join(root, 'services', 'mimo-voice-service');
}

function resolveWorkspacePluginDir(root) {
  const newDir = path.join(root, 'projects', 'mimo-voice', 'plugin');
  if (fs.existsSync(newDir)) return newDir;
  return path.join(root, '.openclaw', 'extensions', 'mimo-voice-openclaw');
}

const SOURCE_SERVICE_DIR = path.resolve(PACKAGE_ROOT, '..', 'service');
const SOURCE_PLUGIN_DIR = path.resolve(PACKAGE_ROOT, '..', 'plugin');
const hasSiblingSourceTree = fs.existsSync(SOURCE_SERVICE_DIR) && fs.existsSync(SOURCE_PLUGIN_DIR);

function defaultServiceDir() {
  if (process.env.MIMO_VOICE_SERVICE_DIR) return process.env.MIMO_VOICE_SERVICE_DIR;
  if (hasSiblingSourceTree) return SOURCE_SERVICE_DIR;
  if (fs.existsSync(PACKAGED_SERVICE_DIR)) return path.join(INSTALL_BASE_DIR, 'service');
  return resolveWorkspaceServiceDir(DEFAULT_WORKSPACE_ROOT);
}

function defaultPluginDir() {
  if (process.env.MIMO_VOICE_PLUGIN_DIR) return process.env.MIMO_VOICE_PLUGIN_DIR;
  if (hasSiblingSourceTree) return SOURCE_PLUGIN_DIR;
  if (fs.existsSync(PACKAGED_PLUGIN_DIR)) return PACKAGED_PLUGIN_DIR;
  return resolveWorkspacePluginDir(DEFAULT_WORKSPACE_ROOT);
}

export const DEFAULT_SERVICE_DIR = defaultServiceDir();
export const DEFAULT_PLUGIN_SOURCE_DIR = defaultPluginDir();

export function rel(p) {
  return path.relative(process.cwd(), p) || '.';
}
