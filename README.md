# OpenClaw Chat Memory Manager

> 一套完整的群聊记忆管理和项目管理系统，让 OpenClaw agent 拥有持久化的项目记忆

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-%3E%3D2026.2-blue)](https://openclaw.ai/)

## ✨ 特性

- 🗂️ **自动导出和存档群聊历史** - 支持飞书、Telegram、Discord 等平台
- 🧠 **智能分析项目和任务** - 自动识别项目、目标、任务、决策
- 📝 **生成结构化的工作记忆文档** - 清晰展示项目状态和进展
- 🔍 **高效搜索历史对话** - 一步到位，不需要多轮推理
- 🔄 **自动刷新保持记忆最新** - 定时检测新消息并更新记忆

## 🎯 解决的问题

### 问题1：Agent 记忆丢失
**现象**：Session 重启后，agent 忘记之前的对话和项目信息

**解决**：将聊天记录和项目信息持久化到文件系统，不依赖 session context

### 问题2：多轮推理浪费算力
**现象**：每次搜索历史都需要 8+ 轮推理，消耗 50k+ tokens

**解决**：提供高效的搜索 skill，一步到位返回结构化结果，**效率提升 10 倍**

### 问题3：项目信息碎片化
**现象**：项目信息散落在各个 session 中，难以追溯

**解决**：为每个项目创建独立的工作记忆文档，记录目标、任务、决策

### 问题4：跨 Session 协作困难
**现象**：不同 agent 无法共享 context，重复工作

**解决**：建立共享的项目记忆库，所有 agent 都能访问

## 📦 安装

### 方式1：通过 ClawHub（推荐）

```bash
clawhub install chat-memory-manager
```

### 方式2：从 GitHub 克隆

```bash
git clone https://github.com/va7/openclaw-chat-memory.git
cd openclaw-chat-memory
./tools/install.sh
```

### 方式3：手动安装

```bash
# 1. 复制脚本
cp scripts/*.mjs ~/.openclaw/workspace/scripts/

# 2. 复制 skill
cp -r skills/chat-history-search ~/.openclaw/workspace/skills/

# 3. 配置
cp config/config.example.json ~/.openclaw/workspace/config.json
# 编辑 config.json 填入飞书凭证

# 4. 重启 gateway
openclaw gateway restart
```

## 🚀 快速开始

### 1. 配置飞书凭证

编辑 `~/.openclaw/workspace/config.json`：

```json
{
  "feishu": {
    "appId": "YOUR_APP_ID",
    "appSecret": "YOUR_APP_SECRET"
  }
}
```

获取凭证：https://open.feishu.cn/app

### 2. 导出群聊历史

```bash
node ~/.openclaw/workspace/scripts/export-chat-history.mjs \
  --chat-id=oc_xxx \
  --output=~/.openclaw/workspace/chats/oc_xxx/archive/messages.jsonl
```

### 3. 分析项目

```bash
node ~/.openclaw/workspace/scripts/deep-analyze-project.mjs \
  --chat-id=oc_xxx \
  --project=your-project-name
```

### 4. 搜索历史

```bash
node ~/.openclaw/workspace/scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="2026-03-01" \
  --keyword="任务"
```

### 5. 设置自动刷新

在 OpenClaw 中创建 cron 任务：

```javascript
{
  "name": "刷新群聊记忆",
  "schedule": { "kind": "cron", "expr": "0 23 * * *" },
  "payload": {
    "kind": "systemEvent",
    "text": "执行群聊记忆刷新"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

## 📚 文档

- [安装指南](INSTALL.md) - 详细的安装步骤
- [使用文档](USAGE.md) - 完整的使用指南
- [架构设计](docs/architecture.md) - 系统架构和设计思路
- [API 文档](docs/api.md) - 脚本 API 参考
- [故障排查](docs/troubleshooting.md) - 常见问题解决
- [最佳实践](docs/best-practices.md) - 使用建议

## 🏗️ 架构

```
chats/
  {chat_id}/
    context.yaml          # 群聊上下文（成员、目标、规则）
    archive/
      messages.jsonl      # 聊天记录存档
      chat_info.json      # 群信息
    analysis.json         # 群聊分析报告
    projects/
      {project_name}/
        README.md         # 项目工作记忆
        deep-analysis.json # 深度分析数据
```

## 🎬 演示

### 效率对比

| 方面 | 传统方式 | 使用本系统 |
|------|---------|-----------|
| 推理轮数 | 8轮 | 1轮 |
| Token消耗 | ~50k | ~5k |
| 时间 | 需要多次尝试 | 直接返回 |
| 输出 | 需要手动解析 | 结构化JSON |

### 实际案例

**场景**：Agent 需要搜索群聊中关于"任务"的讨论

**传统方式**（8轮推理，52k tokens）：
1. 尝试从 session history 查找 → 失败
2. 意识到需要去 archive/messages.jsonl
3. 用 grep 统计消息数量
4. 用 jq 提取消息内容
5. 找到相关消息
6. 手动解析 JSON
7. 格式化输出
8. 返回结果

**使用本系统**（1轮，5k tokens）：
```bash
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --keyword="任务" \
  --limit=5
```

直接返回结构化结果！

## 🤝 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md)

### 开发

```bash
# 克隆仓库
git clone https://github.com/va7/openclaw-chat-memory.git
cd openclaw-chat-memory

# 安装依赖（如果有）
npm install

# 运行测试
npm test

# 提交 PR
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

## 📝 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [OpenClaw](https://openclaw.ai/) - 强大的 AI agent 框架
- [飞书开放平台](https://open.feishu.cn/) - 提供 API 支持

## 📧 联系

- GitHub Issues: [提交问题](https://github.com/va7/openclaw-chat-memory/issues)
- Discord: [加入社区](https://discord.com/invite/clawd)
- Twitter: [@va7](https://twitter.com/va7)

---

**Made with ❤️ by VA7**
