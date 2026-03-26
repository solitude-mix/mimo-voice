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

type AutoVoiceIntent = {
  prefix: string;
  text: string;
  style?: string;
  emotion?: string;
  dialect?: string;
};

type GenerateSpeechParams = {
  text: string;
  voice?: string;
  userPrompt?: string;
  style?: string;
  emotion?: string;
  dialect?: string;
  noStyleTag?: boolean;
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
  noStyleTag?: boolean;
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

const AUTO_VOICE_PREFIXES = [
  '语音:', '语音：',
  'tts:', 'tts：',
  '发语音:', '发语音：',
  '发个语音:', '发个语音：',
  '用语音说:', '用语音说：',
  '朗读:', '朗读：',
  '念一下:', '念一下：',
  '转语音:', '转语音：',
] as const;

const NATURAL_VOICE_TRIGGER_RE = /^(?:请|麻烦|帮我|可以|能不能|可不可以|请你|麻烦你)?(?:用|以)?(?:语音|声音|音频)(?:回复|回我|发我|说|讲|念|朗读|播报|发送)?/;
const VOICE_REQUEST_HINT_RE = /(?:语音|声音|音频).{0,10}(?:回复|回我|发我|说|讲|念|朗读|播报|发送)|(?:回复|回我|发我).{0,6}(?:语音|声音|音频)|(?:用|以).{0,8}(?:语音|声音|音频)/;

function normalizeAutoVoiceText(text: string): string {
  return text
    .replace(/^[:：,，\s]+/, '')
    .replace(/[。！!\s]+$/u, '')
    .trim();
}

function extractQuotedOrColonText(raw: string): string | null {
  const colonMatch = raw.match(/[：:](.+)$/s);
  if (colonMatch?.[1]?.trim()) return normalizeAutoVoiceText(colonMatch[1]);

  const quoted = raw.match(/[“"『「](.+?)[”"』」]/s);
  if (quoted?.[1]?.trim()) return normalizeAutoVoiceText(quoted[1]);
  return null;
}

function detectDialect(raw: string): string | undefined {
  if (/(?:粤语|广东话|白话)/.test(raw)) return '粤语';
  if (/(?:四川话|川话)/.test(raw)) return '四川话';
  if (/(?:东北话)/.test(raw)) return '东北话';
  if (/(?:上海话|沪语)/.test(raw)) return '上海话';
  if (/(?:闽南话|台语|臺語)/.test(raw)) return '闽南话';
  return undefined;
}

function detectEmotion(raw: string): string | undefined {
  if (/(?:开心|高兴|活泼|欢快|歡快)/.test(raw)) return '开心';
  if (/(?:难过|伤心|悲伤|忧伤)/.test(raw)) return '难过';
  if (/(?:温柔|温柔一点|柔和)/.test(raw)) return '温柔';
  if (/(?:严肃|正式|认真)/.test(raw)) return '严肃';
  if (/(?:紧张)/.test(raw)) return '紧张';
  return undefined;
}

function detectStyle(raw: string): string | undefined {
  const matched: string[] = [];
  if (/(?:可爱)/.test(raw)) matched.push('可爱');
  if (/(?:小声|轻声|悄悄|低声)/.test(raw)) matched.push('小声');
  if (/(?:慢一点|慢速|慢慢说)/.test(raw)) matched.push('慢速');
  if (/(?:快一点|快点|快速)/.test(raw)) matched.push('快速');
  if (/(?:男声)/.test(raw)) matched.push('男声');
  if (/(?:女声)/.test(raw)) matched.push('女声');
  return matched.length ? matched.join(' ') : undefined;
}

function stripRequestFraming(raw: string): string {
  return normalizeAutoVoiceText(
    raw
      .replace(NATURAL_VOICE_TRIGGER_RE, '')
      .replace(/^(?:请|麻烦|帮我|可以|能不能|可不可以|请你|麻烦你)/, '')
      .replace(/^(?:用|以)(?:[^，。,：:]{0,12})(?:语音|声音|音频)(?:的方式)?/, '')
      .replace(/^(?:回复|回我|发我|说|讲|念|朗读|播报|发送)(?:一段|一句|一下|给我|给我一句|给我一段)?/, '')
      .replace(/^(?:内容是|内容为|这句|这段)/, '')
  );
}

function parseAutoVoiceIntent(input: unknown): AutoVoiceIntent | null {
  const raw = String(input || '').trim();
  if (!raw) return null;
  for (const prefix of AUTO_VOICE_PREFIXES) {
    if (raw.startsWith(prefix)) {
      const text = normalizeAutoVoiceText(raw.slice(prefix.length).trim());
      if (!text) return null;
      return {
        prefix,
        text,
        style: detectStyle(raw),
        emotion: detectEmotion(raw),
        dialect: detectDialect(raw),
      };
    }
  }

  if (!VOICE_REQUEST_HINT_RE.test(raw) && !NATURAL_VOICE_TRIGGER_RE.test(raw)) {
    return null;
  }

  const explicitText = extractQuotedOrColonText(raw);
  const text = explicitText || stripRequestFraming(raw);
  if (!text) return null;

  return {
    prefix: 'natural-language',
    text,
    style: detectStyle(raw),
    emotion: detectEmotion(raw),
    dialect: detectDialect(raw),
  };
}

function makeConversationKey(channelId?: string, conversationId?: string, accountId?: string): string | null {
  if (!channelId || !conversationId) return null;
  return `${channelId}:${accountId || 'default'}:${conversationId}`;
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
    const suppressedOutbound = new Map<string, number>();
    const SUPPRESS_WINDOW_MS = 15000;

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
            style: params.style,
            emotion: params.emotion,
            dialect: params.dialect,
            no_style_tag: params.noStyleTag ?? false,
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
            ...(params.noStyleTag ? ['--no-style-tag'] : []),
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
            no_style_tag: params.noStyleTag ?? false,
            keep_file: params.keepFile ?? false,
            split_long_text: params.splitLongText ?? true,
            max_chars_per_chunk: params.maxCharsPerChunk ?? 120,
          });
    }

    async function tryAutoVoiceFromInbound(event: any) {
      const ctx = event?.context || {};
      const channelId = String(ctx.channelId || '').trim();
      if (channelId !== 'telegram') return;
      if (ctx.isGroup || ctx.groupId) return;

      const content = String(ctx.bodyForAgent || ctx.content || ctx.body || '').trim();
      const intent = parseAutoVoiceIntent(content);
      if (!intent) return;

      const conversationId = String(ctx.conversationId || '').trim();
      const chatId = conversationId || config.defaultChatId;
      if (!chatId) {
        logger.warn?.('[mimo-voice-openclaw] auto voice trigger matched but no chat id was available');
        return;
      }

      await deliverVoice({
        channel: 'telegram',
        chatId: String(chatId),
        text: intent.text,
        style: intent.style,
        emotion: intent.emotion,
        dialect: intent.dialect,
      });

      const key = makeConversationKey(channelId, conversationId || String(chatId), ctx.accountId ? String(ctx.accountId) : undefined);
      if (key) suppressedOutbound.set(key, Date.now() + SUPPRESS_WINDOW_MS);
      logger.info?.(`[mimo-voice-openclaw] auto voice delivered via trigger '${intent.prefix}' to chat ${chatId} (dialect=${intent.dialect || '-'} emotion=${intent.emotion || '-'} style=${intent.style || '-'})`);
    }

    api.registerHook(['message:received', 'message:preprocessed'], async (event: any) => {
      try {
        await tryAutoVoiceFromInbound(event);
      } catch (err: any) {
        logger.warn?.(`[mimo-voice-openclaw] auto voice hook failed: ${err?.message || String(err)}`);
      }
    }, { name: 'mimo-auto-voice-inbound' });

    api.on('message_sending', (event: any, ctx: any) => {
      const key = makeConversationKey(ctx?.channelId, ctx?.conversationId, ctx?.accountId);
      if (!key) return;
      const until = suppressedOutbound.get(key);
      if (!until) return;
      if (Date.now() > until) {
        suppressedOutbound.delete(key);
        return;
      }
      suppressedOutbound.delete(key);
      logger.info?.(`[mimo-voice-openclaw] suppressed normal outbound text after auto voice delivery for ${key}`);
      return { cancel: true };
    });

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
