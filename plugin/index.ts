import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type PluginConfig = {
  enabled?: boolean;
  serviceBaseUrl?: string;
  serviceDir?: string;
  defaultChatId?: string;
  defaultChannel?: string;
  preferCli?: boolean;
};

type GenerateSpeechParams = {
  text: string;
  voice?: string;
  userPrompt?: string;
  splitLongText?: boolean;
  maxCharsPerChunk?: number;
  saveFile?: boolean;
};

type DeliverVoiceParams = {
  channel?: string;
  text: string;
  chatId?: string;
  voice?: string;
  userPrompt?: string;
  style?: string;
  emotion?: string;
  dialect?: string;
  keepFile?: boolean;
  splitLongText?: boolean;
  maxCharsPerChunk?: number;
};

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const defaultServiceDir = path.resolve(pluginDir, '..', 'service');

const mimoVoiceConfigSchema = {
  parse(value: unknown): PluginConfig {
    const raw = value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
    return {
      enabled: typeof raw.enabled === 'boolean' ? raw.enabled : true,
      serviceBaseUrl: typeof raw.serviceBaseUrl === 'string' ? raw.serviceBaseUrl : 'http://127.0.0.1:8091',
      serviceDir: typeof raw.serviceDir === 'string' ? raw.serviceDir : defaultServiceDir,
      defaultChatId: typeof raw.defaultChatId === 'string' ? raw.defaultChatId : undefined,
      defaultChannel: typeof raw.defaultChannel === 'string' ? raw.defaultChannel : 'telegram',
      preferCli: typeof raw.preferCli === 'boolean' ? raw.preferCli : false,
    };
  },
  uiHints: {
    enabled: { label: 'Enable MiMo integration' },
    serviceBaseUrl: { label: 'Service Base URL' },
    serviceDir: { label: 'Service Directory' },
    defaultChatId: { label: 'Default Telegram Chat ID' },
    defaultChannel: { label: 'Default Delivery Channel' },
    preferCli: { label: 'Prefer local CLI over HTTP' },
  },
};

function getServiceBaseUrl(cfg: PluginConfig): string {
  return (cfg.serviceBaseUrl || 'http://127.0.0.1:8091').replace(/\/$/, '');
}

function getServiceDir(cfg: PluginConfig): string {
  return cfg.serviceDir || defaultServiceDir;
}

async function postJson(url: string, payload: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || data?.detail || `HTTP ${res.status}`);
  }
  return data;
}

function runCli(serviceDir: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['scripts/cli.sh', ...args], { cwd: serviceDir });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += String(d)));
    child.stderr.on('data', (d) => (stderr += String(d)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr.trim() || stdout.trim() || `CLI exited with code ${code}`));
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        resolve({ ok: true, raw: stdout.trim() });
      }
    });
  });
}

const MimoVoiceToolSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['status', 'tts', 'generate_speech', 'send_telegram_voice', 'deliver_voice'],
      description: 'MiMo voice action to run',
    },
    channel: {
      type: 'string',
      description: 'Delivery channel. Current supported value: telegram',
    },
    text: {
      type: 'string',
      description: 'Text to synthesize or send',
    },
    chatId: {
      type: 'string',
      description: 'Telegram chat id; falls back to plugin defaultChatId when omitted',
    },
    voice: {
      type: 'string',
      description: 'MiMo voice preset',
    },
    style: {
      type: 'string',
      description: 'Style prompt inserted as <style>...</style>',
    },
    emotion: {
      type: 'string',
      description: 'Emotion alias for style',
    },
    dialect: {
      type: 'string',
      description: 'Dialect alias for style',
    },
    keepFile: {
      type: 'boolean',
      description: 'Keep generated local OGG file',
    },
  },
  required: ['action'],
  additionalProperties: false,
} as const;

const mimoVoicePlugin = {
  id: 'mimo-voice-openclaw',
  name: 'MiMo Voice OpenClaw Integration',
  description: 'Thin OpenClaw integration layer for the local MiMo voice service.',
  configSchema: mimoVoiceConfigSchema,
  register(api: any) {
    const config = mimoVoiceConfigSchema.parse(api.pluginConfig);
    const logger = api.logger ?? console;

    async function checkStatus() {
      const url = `${getServiceBaseUrl(config)}/health`;
      const res = await fetch(url);
      const text = await res.text();
      let body: any = null;
      try { body = text ? JSON.parse(text) : null; } catch {}
      return { ok: res.ok, status: res.status, body };
    }

    async function generateSpeech(params: GenerateSpeechParams) {
      const text = String(params?.text || '').trim();
      if (!text) throw new Error('text required');
      return config.preferCli
        ? await runCli(getServiceDir(config), ['tts', text, '--voice', params.voice || 'default_zh', '--save-file'])
        : await postJson(`${getServiceBaseUrl(config)}/tts`, {
            text,
            voice: params.voice || 'default_zh',
            user_prompt: params.userPrompt,
            save_file: params.saveFile ?? true,
            split_long_text: params.splitLongText ?? true,
            max_chars_per_chunk: params.maxCharsPerChunk ?? 120,
          });
    }

    async function deliverVoice(params: DeliverVoiceParams) {
      const channel = params.channel || config.defaultChannel || 'telegram';
      if (channel !== 'telegram') {
        throw new Error(`Unsupported channel: ${channel}`);
      }
      const text = String(params?.text || '').trim();
      if (!text) throw new Error('text required');
      const chatId = params.chatId || config.defaultChatId;
      if (!chatId) throw new Error('Missing chatId and no defaultChatId configured');

      return config.preferCli
        ? await runCli(getServiceDir(config), [
            'send-telegram-voice',
            text,
            '--chat-id',
            String(chatId),
            '--voice',
            params.voice || 'default_zh',
            ...(params.style ? ['--style', params.style] : []),
            ...(params.emotion ? ['--emotion', params.emotion] : []),
            ...(params.dialect ? ['--dialect', params.dialect] : []),
            ...(params.keepFile ? ['--keep-file'] : []),
          ])
        : await postJson(`${getServiceBaseUrl(config)}/telegram/send-voice`, {
            text,
            chat_id: String(chatId),
            voice: params.voice || 'default_zh',
            user_prompt: params.userPrompt,
            style: params.style,
            emotion: params.emotion,
            dialect: params.dialect,
            keep_file: params.keepFile ?? false,
            split_long_text: params.splitLongText ?? true,
            max_chars_per_chunk: params.maxCharsPerChunk ?? 120,
          });
    }

    api.registerGatewayMethod('mimoVoice.status', async ({ respond }: any) => {
      try {
        respond(true, await checkStatus());
      } catch (err: any) {
        respond(false, { ok: false, error: err?.message || String(err) });
      }
    });

    api.registerGatewayMethod('mimoVoice.generateSpeech', async ({ params, respond }: any) => {
      try {
        respond(true, await generateSpeech(params));
      } catch (err: any) {
        respond(false, { ok: false, error: err?.message || String(err) });
      }
    });

    api.registerGatewayMethod('mimoVoice.deliverVoice', async ({ params, respond }: any) => {
      try {
        respond(true, await deliverVoice(params));
      } catch (err: any) {
        respond(false, { ok: false, error: err?.message || String(err) });
      }
    });

    // Compatibility aliases for current alpha API.
    api.registerGatewayMethod('mimoVoice.tts', async ({ params, respond }: any) => {
      try {
        respond(true, await generateSpeech(params));
      } catch (err: any) {
        respond(false, { ok: false, error: err?.message || String(err) });
      }
    });

    api.registerGatewayMethod('mimoVoice.sendTelegramVoice', async ({ params, respond }: any) => {
      try {
        respond(true, await deliverVoice({ ...params, channel: 'telegram' }));
      } catch (err: any) {
        respond(false, { ok: false, error: err?.message || String(err) });
      }
    });

    api.registerCli(({ program }: any) => {
      const cmd = program.command('mimo-voice').description('Interact with the local MiMo voice service');

      cmd.command('status').action(async () => {
        try {
          console.log(JSON.stringify(await checkStatus(), null, 2));
        } catch (err: any) {
          console.log(JSON.stringify({ ok: false, error: err?.message || String(err) }, null, 2));
          process.exitCode = 1;
        }
      });

      cmd.command('tts')
        .argument('<text>')
        .option('--voice <voice>', 'Voice preset', 'default_zh')
        .action(async (text: string, options: any) => {
          const data = await generateSpeech({ text, voice: options.voice, saveFile: true });
          console.log(JSON.stringify(data, null, 2));
        });

      cmd.command('generate-speech')
        .argument('<text>')
        .option('--voice <voice>', 'Voice preset', 'default_zh')
        .action(async (text: string, options: any) => {
          const data = await generateSpeech({ text, voice: options.voice, saveFile: true });
          console.log(JSON.stringify(data, null, 2));
        });

      cmd.command('send-telegram-voice')
        .argument('<text>')
        .requiredOption('--chat-id <chatId>', 'Telegram chat id')
        .option('--voice <voice>', 'Voice preset', 'default_zh')
        .option('--style <style>', 'Style text')
        .action(async (text: string, options: any) => {
          const data = await deliverVoice({
            channel: 'telegram',
            text,
            chatId: String(options.chatId),
            voice: options.voice,
            style: options.style,
          });
          console.log(JSON.stringify(data, null, 2));
        });

      cmd.command('deliver-voice')
        .argument('<text>')
        .requiredOption('--chat-id <chatId>', 'Telegram chat id')
        .option('--channel <channel>', 'Delivery channel', config.defaultChannel || 'telegram')
        .option('--voice <voice>', 'Voice preset', 'default_zh')
        .option('--style <style>', 'Style text')
        .action(async (text: string, options: any) => {
          const data = await deliverVoice({
            channel: options.channel,
            text,
            chatId: String(options.chatId),
            voice: options.voice,
            style: options.style,
          });
          console.log(JSON.stringify(data, null, 2));
        });
    }, { commands: ['mimo-voice'] });

    api.registerCommand({
      name: 'mimo-status',
      description: 'Show MiMo voice service health',
      requireAuth: true,
      handler: async () => {
        try {
          const status = await checkStatus();
          return { text: `MiMo service: ${JSON.stringify(status.body ?? status)}` };
        } catch (err: any) {
          return { text: `MiMo service unavailable: ${err?.message || String(err)}` };
        }
      },
    });

    api.registerTool(
      {
        name: 'mimo_voice',
        label: 'MiMo Voice',
        description: 'Use the local MiMo voice service through OpenClaw to check service health, generate speech, or deliver voice messages.',
        parameters: MimoVoiceToolSchema,
        async execute(_toolCallId: string, params: any) {
          const json = (payload: unknown) => ({
            content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
            details: payload,
          });

          if (params?.action === 'status') {
            return json(await checkStatus());
          }

          if (params?.action === 'tts' || params?.action === 'generate_speech') {
            return json(await generateSpeech(params));
          }

          if (params?.action === 'send_telegram_voice') {
            return json(await deliverVoice({ ...params, channel: 'telegram' }));
          }

          if (params?.action === 'deliver_voice') {
            return json(await deliverVoice(params));
          }

          throw new Error(`unsupported action: ${String(params?.action || '')}`);
        },
      },
      { optional: true },
    );

    logger.info?.('mimo-voice-openclaw plugin registered');
  },
};

export default mimoVoicePlugin;
