# MiMo Voice 架构方案（A 草案）

> 目标：把 MiMo Voice 从“当前可工作的 Telegram + OpenClaw alpha 组合”整理成一个 **可扩展的语音生成与发送项目**，为后续接入 mini-vico 配置复用、飞书、微信等渠道留出干净边界。

---

## 1. 先说结论

你现在这个仓库的主要问题，不是“代码不能跑”，而是**抽象层级错位**。

当前仓库把内容按交付形态拆成了：

- `service/`
- `plugin/`
- `cli/`

这在 alpha 初期很合理，因为它方便把东西先发布出来；但它不适合长期演进。

因为你真正的产品问题不是“有几个发布物”，而是：

1. **怎么调用模型生成语音**
2. **怎么把语音发到不同渠道**
3. **怎么和 OpenClaw 对接**
4. **怎么统一配置和安装**

也就是说，项目现在是按“怎么发包”组织的，而未来应该按“能力边界”组织。

---

## 2. 你真正要做的产品是什么

MiMo Voice 不应该再被理解成：

- 一个 MiMo TTS 脚本
- 一个 Telegram 发送器
- 一个 OpenClaw 插件安装包

它更准确的产品定义应该是：

> **MiMo Voice 是一个面向 OpenClaw 生态的语音能力层。**
> 
> 它负责：
> - 读取 provider 配置
> - 调用 TTS 模型 / API 生成音频
> - 根据 channel adapter 把音频发送到 Telegram / 飞书 / 微信等渠道
> - 向 OpenClaw 暴露统一的语音调用接口

在这个定义下：

- `MiMo` 只是当前首个 provider / 能力来源
- `Telegram` 只是当前首个 channel adapter
- `OpenClaw plugin` 只是当前首个 integration entrypoint
- `CLI` 只是当前首个安装与维护入口

这几个东西都很重要，但它们都不应该占据“项目主抽象”的位置。

---

## 3. 当前结构为什么会越来越别扭

### 当前结构

```text
mimo-voice/
  service/
  plugin/
  cli/
```

这个结构的问题，不是错，而是**随着需求上升会越来越容易缠在一起**。

### 问题 1：service 里同时承担了太多责任

从当前 `service/app` 看，里面已经同时包含：

- `config.py`
- `mimo.py`
- `audio.py`
- `telegram.py`
- `service.py`
- `api/`
- `cli.py`

这意味着 service 里已经混着：

- provider 调用逻辑
- 音频后处理逻辑
- channel 发送逻辑
- HTTP API
- 本地 CLI
- 配置与错误处理

这在功能少的时候没问题，但后面一旦加：

- mini-vico 配置复用
- 第二种 provider
- 飞书 sender
- 微信 sender
- 更多 OpenClaw 接入方式

就会变成一个“大而粘”的 service 层。

---

### 问题 2：channel 和 provider 没有被明确分层

当前 `mimo.py` 和 `telegram.py` 是按实现文件拆开的，但从产品层面看，你真正需要的是：

- **provider 层**：负责“生成音频”
- **channel 层**：负责“发送音频”

如果这两个边界不先立起来，后续最常见的问题就是：

- Telegram 特有参数混进 TTS 逻辑
- provider 的字段名污染发送层
- OpenClaw 插件需要知道太多底层细节

最后每个地方都在碰配置，谁也说不清配置到底归谁管。

---

### 问题 3：plugin 现在过早绑定 Telegram 语义

当前 plugin 暴露的是：

- `mimoVoice.status`
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

这在现在是够用的，但如果以后要加飞书 / 微信，你很快就会遇到接口命名问题：

- 继续加 `sendFeishuVoice`？
- 再加 `sendWechatVoice`？
- 每个渠道都变成一个新接口？

这种设计会让 plugin 接口越来越碎。

更长期的方向应该是：

- `generateSpeech`
- `sendVoice`
- `deliverVoice`

其中 `channel` 作为参数传入，而不是把渠道名字写死在方法名里。

---

### 问题 4：CLI 现在是“安装器”，但以后需要变成“入口层”

当前 CLI 主要负责：

- doctor
- install
- configure
- uninstall
- upgrade

这没问题，但如果以后用户要做这些事：

- 查看当前 provider 配置来源
- 校验 mini-vico 配置是否已映射
- 测试 provider 连通性
- 测试某个 channel 发送能力
- 导出最小配置模板

那么 CLI 迟早要从单纯安装器进化成“诊断 + 配置 + 测试 + 集成入口”。

如果现在不提前定义边界，CLI 后面会一边长安装逻辑，一边长业务逻辑，也会越来越难看。

---

## 4. 目标架构：按能力边界，而不是按发布物拆

我建议未来的目标结构是这样的：

```text
mimo-voice/
  README.md
  README.zh-CN.md

  docs/
    architecture.md
    configuration.md
    quickstart.md
    openclaw-integration.md
    telegram.md
    roadmap.md

  examples/
    config.example.yaml
    openclaw.example.json
    telegram.example.env

  packages/
    core/
    provider-mimo/
    channel-telegram/
    integration-openclaw/
    cli/

  service/
  plugin/
  tests/
  scripts/
```

这里最关键的是：

- **`packages/` 才是长期核心**
- `service/` / `plugin/` 可以逐步变成组装层或兼容层

也就是说，未来真正可复用的逻辑应该沉到 `packages/` 里，而不是继续堆在 `service/app` 里。

---

## 5. 推荐的模块边界

---

### 5.1 `packages/core/`

这是整个项目最重要的一层。

它应该放：

- 配置加载与合并
- schema 校验
- 错误类型
- 日志
- 音频文件抽象
- provider / channel 的公共接口
- 任务编排（generate -> convert -> deliver）

它不应该直接依赖 Telegram 或某个具体 provider。

#### 核心接口建议

```ts
interface SpeechProvider {
  generate(input: SpeechRequest): Promise<GeneratedAudio>
}

interface VoiceChannel {
  send(input: VoiceDeliveryRequest): Promise<DeliveryResult>
}
```

然后上层再组合：

```ts
generateSpeech(request, providerConfig) -> audio
sendVoice(audio, channelConfig) -> result
```

这样加新 provider / 新 channel 的成本会显著下降。

---

### 5.2 `packages/provider-mimo/`

专门负责 MiMo / mini-vico 一类 provider 接入。

职责：

- 请求拼装
- API 调用
- provider 返回解析
- provider 级错误映射
- provider 特有配置项处理

它不应该直接知道 Telegram 或 OpenClaw 的配置细节。

如果以后 mini-vico 配置真的跟 MiMo 配置格式接近，可以这样做：

- `provider-mimo/` 负责实际 provider client
- `core/config/sources/mini-vico` 负责从 mini-vico 现有配置中提取 provider 参数

也就是说：

**“复用 mini-vico 配置”应该是配置来源问题，不是 provider 逻辑问题。**

这是很关键的设计点。

---

### 5.3 `packages/channel-telegram/`

专门负责 Telegram voice 发送。

职责：

- 上传音频
- 发送 voice message
- Telegram 特有参数处理
- Telegram API 错误映射

它不应该碰 provider 细节，只接收“已经生成好的音频”和“发送所需 metadata”。

以后飞书 / 微信也按同样方式做：

- `packages/channel-feishu/`
- `packages/channel-wechat/`

这样不会把 Telegram 的特殊逻辑散落到整个项目里。

---

### 5.4 `packages/integration-openclaw/`

专门负责 OpenClaw 集成。

职责：

- 暴露 OpenClaw 的 gateway methods / tool 接口
- 把 OpenClaw 请求转成 core 的统一调用
- 处理 OpenClaw 配置映射
- 处理向后兼容逻辑

这层非常重要，因为它是“外部接入面”，但它不应该持有业务核心逻辑。

它应该像一个 translator：

- OpenClaw 世界的输入
- 翻译成 core 世界的请求
- 调用 provider + channel
- 再翻译回 OpenClaw 世界的输出

---

### 5.5 `packages/cli/`

CLI 不应该直接深埋在“某个 service 目录的配套安装器”里。

它应该逐步进化成一个统一入口：

#### 安装类命令
- `doctor`
- `install`
- `configure`
- `upgrade`
- `uninstall`

#### 测试类命令
- `test-provider`
- `test-channel`
- `test-openclaw`

#### 配置类命令
- `config init`
- `config validate`
- `config show-effective`
- `config explain`

这种设计比单纯安装器更适合长期产品化。

---

## 6. 推荐的配置架构

你这个项目后面能不能顺，**80% 取决于配置能不能立住**。

我建议从现在开始就明确：配置至少分成 4 层。

---

### 6.1 provider 配置

负责：怎么生成音频

建议字段：

```yaml
provider:
  kind: mimo
  base_url: http://127.0.0.1:8000/v1
  api_key: your_api_key
  model: your_tts_model
  voice: default
  extra:
    style: calm
```

---

### 6.2 audio 配置

负责：输出音频格式

```yaml
audio:
  format: ogg_opus
  sample_rate: 24000
  save_intermediate: false
```

---

### 6.3 channel 配置

负责：怎么发到外部渠道

```yaml
channel:
  kind: telegram
  telegram:
    bot_token: 123456:abc
    default_chat_id: 123456789
```

未来可以并行支持：

```yaml
channel:
  kind: feishu
  feishu:
    app_id: xxx
    app_secret: yyy
```

---

### 6.4 integration 配置

负责：怎么接外部系统

```yaml
integration:
  openclaw:
    service_base_url: http://127.0.0.1:8091
    prefer_cli: false
    default_channel: telegram
```

---

## 7. mini-vico 配置复用应该怎么设计

这是你提的核心需求之一，我建议单独处理。

### 错误做法

错误方向是：

- 在 Telegram sender 里直接读 mini-vico 配置
- 在 plugin 里偷偷解析 mini-vico 配置
- 在 provider 调用代码里混入“如果是 mini-vico 就从别处读配置”

这样会导致配置来源分散，后面谁都改不明白。

---

### 正确做法

把“读取 mini-vico 配置”视为**配置来源适配器**。

也就是：

```text
config sources:
- file
- env
- openclaw config
- mini-vico config
```

最后统一合并成一份标准 provider config：

```yaml
provider:
  kind: mimo
  base_url: ...
  api_key: ...
  model: ...
```

所以建议加一个配置来源模块，例如：

```text
packages/core/config/sources/
  file.ts
  env.ts
  openclaw.ts
  mini-vico.ts
```

这样以后用户可以选择：

- 自己直接写 provider 配置
- 或者声明“从 mini-vico 导入 provider 配置”

例如：

```yaml
provider:
  source: mini-vico
  profile: default
```

底层再解析成标准字段。

这个设计的好处是：

- provider 逻辑保持干净
- channel 逻辑不用关心配置来源
- OpenClaw integration 只处理映射，不侵入业务核心

---

## 8. OpenClaw 插件接口怎么改更合理

当前接口：

- `mimoVoice.status`
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

建议未来逐步改成：

- `mimoVoice.status`
- `mimoVoice.generateSpeech`
- `mimoVoice.sendVoice`
- `mimoVoice.deliverVoice`

### 含义

#### `generateSpeech`
只生成音频，不发送

#### `sendVoice`
发送已存在音频

#### `deliverVoice`
从文本直接走完整链路：生成 + 发送

这样以后加渠道时，不需要继续扩：

- `sendTelegramVoice`
- `sendFeishuVoice`
- `sendWechatVoice`

而是统一走：

```json
{
  "channel": "telegram",
  "text": "你好",
  "chatId": "..."
}
```

---

## 9. 建议的目录演进路线

我不建议你现在就一次性把所有目录推翻重来。

正确方式应该是**渐进重构**。

---

### Phase 1：先补文档与配置模型

你已经在做 README 重构了，接下来这一步应该是：

- 明确 provider / audio / channel / integration 四层配置
- 补 `examples/config.example.yaml`
- 补 `docs/configuration.md`
- 补 `docs/openclaw-integration.md`

这一步主要是“概念统一”。

---

### Phase 2：把 service/app 里的逻辑拆出边界

目标不是大迁移，而是先按职责整理：

当前：

- `mimo.py`
- `telegram.py`
- `audio.py`
- `service.py`

建议过渡成：

```text
service/app/
  core/
  providers/
  channels/
  integrations/
  api/
```

哪怕先只是移动文件，也比继续把所有逻辑平铺在 `app/` 根下强。

这是最小可行重构。

---

### Phase 3：抽公共能力到 `packages/`

当 Python service、plugin、CLI 都开始共享同一套边界后，再把真正稳定的公共能力抽出去。

此时可以逐步形成：

- `packages/core`
- `packages/provider-mimo`
- `packages/channel-telegram`
- `packages/integration-openclaw`
- `packages/cli`

这一步更适合在产品定义稳定后做。

---

### Phase 4：新增渠道

当 channel 边界稳定后，再加：

- `channel-feishu`
- `channel-wechat`

这样不会把 Telegram 时代留下的写死逻辑扩散到全局。

---

## 10. 你现在立刻最该做的 6 件事

如果按投入产出比排，我建议顺序是：

### P0
补这几个文档：

- `examples/config.example.yaml`
- `docs/configuration.md`
- `docs/openclaw-integration.md`

### P1
在代码层先建立命名边界：

- `providers/`
- `channels/`
- `integrations/`
- `core/`

### P2
把 Telegram 写死接口，逐步收敛成通用 `deliverVoice` 思路

### P3
把 mini-vico 配置读取设计成 config source，而不是 provider 特判

### P4
让 CLI 增加配置诊断能力，而不是只做安装

### P5
在目录稳定后，再做 packages 化

---

## 11. 一版更现实的近期目录建议

如果你现在不想大改仓库顶层，我建议先走这版“近中期兼容结构”：

```text
mimo-voice/
  README.md
  README.zh-CN.md
  ARCHITECTURE_PLAN.zh-CN.md

  docs/
    configuration.md
    openclaw-integration.md
    quickstart.md

  examples/
    config.example.yaml

  cli/
  plugin/
  service/

  service/app/
    core/
      config.py
      errors.py
      logging_utils.py
      response_utils.py
    providers/
      mimo.py
    channels/
      telegram.py
    integrations/
      openclaw.py
    api/
    audio/
      audio.py
    app.py
```

这版的好处是：

- 不需要一次性推翻当前仓库
- 先把代码边界整理出来
- 文档能先和未来方向对齐
- 后续再决定是否 packages 化

这是我认为最适合你当前阶段的路线。

---

## 12. 最后给一句最直白的话

你现在这个项目最需要的，不是立刻“重写全部代码”，而是先把这三件事固定下来：

1. **配置到底分哪几层**
2. **provider / channel / integration 边界怎么切**
3. **OpenClaw 接口从 Telegram 特化，逐步走向通用 deliver 接口**

只要这三件事立住了：

- README 才会真正好写
- 新手才会真的知道该怎么配
- 后面加飞书 / 微信才不会继续变形

如果这三件事不先立住，后面你每加一个渠道、每复用一套配置，都会再疼一次。
