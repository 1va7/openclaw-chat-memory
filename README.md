# OpenClaw Chat Memory Manager

> 群聊记忆管理系统，让 OpenClaw agent 记住项目信息

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## 这是什么

OpenClaw agent 的 session 重启后会忘记之前的对话。这个工具把群聊记录存到文件里，让 agent 能随时查看项目历史。

**支持平台**：飞书（Feishu）

## 核心功能

- **导出群聊记录** - 把飞书群聊存成 JSONL 文件
- **分析项目信息** - 从聊天记录中提取项目目标、任务、决策
- **生成工作记忆** - 为每个项目创建 README.md，记录关键信息
- **快速搜索** - 按时间和关键词搜索历史对话
- **自动刷新** - 定时检查新消息并更新记忆

## 解决的问题

### 1. Agent 记忆丢失
Session 重启后，agent 忘记之前的对话。

**解决方法**：把聊天记录存到文件，agent 可以随时读取。

### 2. 搜索效率低
每次搜索历史需要多轮推理，浪费 tokens。

**解决方法**：提供搜索脚本，一次返回结果。实测效率提升 10 倍（从 8 轮推理降到 1 轮）。

### 3. 项目信息碎片化
项目信息散落在各个对话中，难以追溯。

**解决方法**：为每个项目创建独立的工作记忆文档，记录目标、任务、决策。

## 安装

### 前置要求

- Node.js >= 18.0.0
- OpenClaw Gateway 已安装
- 飞书应用凭证（App ID 和 App Secret）

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/1va7/openclaw-chat-memory.git
cd openclaw-chat-memory

# 2. 复制脚本
cp scripts/*.mjs ~/.openclaw/workspace/scripts/

# 3. 复制 skill
cp -r skills/chat-history-search ~/.openclaw/workspace/skills/

# 4. 配置飞书凭证
cp config/config.example.json ~/.openclaw/workspace/config.json
# 编辑 config.json 填入飞书 App ID 和 App Secret

# 5. 重启 gateway
openclaw gateway restart
```

### 获取飞书凭证

1. 访问 https://open.feishu.cn/app
2. 创建企业自建应用
3. 获取 App ID 和 App Secret
4. 添加权限：
   - `im:message:read_all` - 读取消息
   - `im:chat:read` - 读取群信息

## 使用方法

### 1. 导出群聊历史

```bash
node ~/.openclaw/workspace/scripts/export-chat-history.mjs \
  --chat-id=oc_xxx \
  --output=~/.openclaw/workspace/chats/oc_xxx/archive/messages.jsonl
```

### 2. 分析项目

```bash
node ~/.openclaw/workspace/scripts/deep-analyze-project.mjs \
  --chat-id=oc_xxx \
  --project-name=my-project \
  --keywords="关键词1,关键词2"
```

生成文件：
- `chats/oc_xxx/projects/my-project/deep-analysis.json` - 分析数据
- `chats/oc_xxx/projects/my-project/README.md` - 工作记忆文档

### 3. 搜索历史对话

```bash
node ~/.openclaw/workspace/scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --keyword="搜索词" \
  --start-date=2026-03-01 \
  --end-date=2026-03-03
```

或在 OpenClaw 中使用 `chat-history-search` skill。

### 4. 自动刷新

设置 cron 任务，每天自动检查新消息并更新记忆：

```bash
node ~/.openclaw/workspace/scripts/refresh-chat-memory.mjs
```

## 文件结构

```
~/.openclaw/workspace/
├── chats/
│   └── {chat_id}/
│       ├── context.yaml          # 群聊上下文
│       ├── analysis.json         # 群聊分析
│       ├── archive/
│       │   └── messages.jsonl    # 聊天记录
│       └── projects/
│           └── {project_name}/
│               ├── README.md     # 工作记忆
│               └── deep-analysis.json
├── scripts/
│   ├── export-chat-history.mjs
│   ├── deep-analyze-project.mjs
│   ├── search-chat-history.mjs
│   └── refresh-chat-memory.mjs
└── skills/
    └── chat-history-search/
        ├── SKILL.md
        └── scripts/
            └── search-chat-history.mjs
```

## 常见问题

### 1. 找不到飞书群 ID

在飞书群中发送消息，查看 OpenClaw 日志中的 `chat_id`。

### 2. 权限不足

确保飞书应用已添加必要权限并发布到企业。

### 3. 搜索结果为空

检查时间范围和关键词是否正确，确认 messages.jsonl 文件存在。

## 贡献

欢迎提交 issue 和 PR。

## 许可证

MIT License

## 作者

VA7
- 小红书 & 抖音：VA7
- 视频号：VA7-AI创业版
- 公众号：异璧辑
