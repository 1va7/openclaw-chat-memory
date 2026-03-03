# 使用文档

本文档介绍如何使用 OpenClaw Chat Memory Manager 的各项功能。

## 目录

- [基础用法](#基础用法)
  - [导出群聊历史](#导出群聊历史)
  - [分析项目](#分析项目)
  - [搜索历史](#搜索历史)
  - [自动刷新](#自动刷新)
- [高级用法](#高级用法)
  - [自定义分析规则](#自定义分析规则)
  - [多 Agent 协作](#多-agent-协作)
  - [集成到 Workflow](#集成到-workflow)
- [最佳实践](#最佳实践)

## 基础用法

### 导出群聊历史

导出群聊历史是第一步，它会将飞书群聊的所有消息保存到本地。

#### 命令行方式

```bash
node ~/.openclaw/workspace/scripts/export-chat-history.mjs \
  --chat-id=oc_xxx \
  --output=~/.openclaw/workspace/chats/oc_xxx/archive/messages.jsonl
```

**参数说明**：
- `--chat-id` - 飞书群聊 ID（必需）
- `--output` - 输出文件路径（可选，默认为 `chats/{chat_id}/archive/messages.jsonl`）
- `--limit` - 限制导出的消息数量（可选，默认全部）
- `--after` - 只导出指定时间之后的消息（可选，格式：`YYYY-MM-DD`）

**示例**：

```bash
# 导出所有消息
node scripts/export-chat-history.mjs --chat-id=oc_f1c3487263639889eedb076c5afd4ad3

# 只导出最近 1000 条消息
node scripts/export-chat-history.mjs --chat-id=oc_xxx --limit=1000

# 只导出 2026-03-01 之后的消息
node scripts/export-chat-history.mjs --chat-id=oc_xxx --after=2026-03-01
```

#### 在 OpenClaw 中使用

直接告诉 agent：

```
导出 AI影视台风开发群 的聊天记录
```

Agent 会自动：
1. 查找群聊 ID
2. 调用导出脚本
3. 保存到正确的位置

### 分析项目

导出聊天记录后，可以分析其中的项目信息。

#### 命令行方式

```bash
node ~/.openclaw/workspace/scripts/deep-analyze-project.mjs \
  --chat-id=oc_xxx \
  --project=your-project-name
```

**参数说明**：
- `--chat-id` - 群聊 ID（必需）
- `--project` - 项目名称（必需）
- `--keywords` - 项目关键词，用逗号分隔（可选）

**示例**：

```bash
# 分析"影视台风"项目
node scripts/deep-analyze-project.mjs \
  --chat-id=oc_f1c3487263639889eedb076c5afd4ad3 \
  --project=yingshi-taifeng \
  --keywords="影视台风,视频生成,AI,剪辑"
```

**输出**：
- `chats/{chat_id}/projects/{project_name}/deep-analysis.json` - 深度分析数据
- `chats/{chat_id}/projects/{project_name}/README.md` - 项目工作记忆文档

#### 在 OpenClaw 中使用

```
分析 AI影视台风开发群 中的"影视台风"项目
```

### 搜索历史

高效搜索群聊历史，支持时间范围和关键词过滤。

#### 命令行方式

```bash
node ~/.openclaw/workspace/scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --keyword="任务" \
  --after="2026-03-01" \
  --limit=10
```

**参数说明**：
- `--chat-id` - 群聊 ID（必需）
- `--keyword` - 搜索关键词（可选）
- `--after` - 开始时间（可选，格式：`YYYY-MM-DD` 或 `YYYY-MM-DD HH:MM`）
- `--before` - 结束时间（可选）
- `--limit` - 返回结果数量（可选，默认 10）
- `--json` - 输出 JSON 格式（可选）

**示例**：

```bash
# 搜索包含"任务"的消息
node scripts/search-chat-history.mjs --chat-id=oc_xxx --keyword="任务"

# 搜索 3月1日之后的消息
node scripts/search-chat-history.mjs --chat-id=oc_xxx --after="2026-03-01"

# 搜索特定时间范围
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="2026-03-01 08:00" \
  --before="2026-03-01 18:00"

# 输出 JSON 格式
node scripts/search-chat-history.mjs --chat-id=oc_xxx --keyword="任务" --json
```

#### 在 OpenClaw 中使用

Agent 会自动使用 `chat-history-search` skill：

```
搜索群聊中关于"任务"的讨论
```

```
查找昨天关于"部署"的消息
```

```
找出 3月1日 CC 说了什么
```

### 自动刷新

设置定时任务，自动检测新消息并更新项目记忆。

#### 创建 Cron 任务

在 OpenClaw 中：

```javascript
// 使用 cron tool
{
  "action": "add",
  "job": {
    "name": "刷新群聊记忆",
    "schedule": {
      "kind": "cron",
      "expr": "0 23 * * *",  // 每天 23:00
      "tz": "Asia/Shanghai"
    },
    "payload": {
      "kind": "systemEvent",
      "text": "执行群聊记忆刷新"
    },
    "sessionTarget": "main",
    "enabled": true
  }
}
```

或者直接告诉 agent：

```
创建一个定时任务，每天晚上 11 点刷新群聊记忆
```

#### 手动刷新

```bash
node ~/.openclaw/workspace/scripts/refresh-chat-memory.mjs
```

脚本会：
1. 扫描所有群聊项目
2. 检查是否有新消息（>50 条）或距离上次更新超过 7 天
3. 自动重新导出、分析、更新 README.md

## 高级用法

### 自定义分析规则

编辑 `~/.openclaw/workspace/config.json`，添加项目关键词：

```json
{
  "analysis": {
    "projectKeywords": {
      "yingshi-taifeng": [
        "影视台风",
        "视频生成",
        "AI剪辑",
        "自动化",
        "workflow"
      ],
      "amz-listing": [
        "亚马逊",
        "listing",
        "产品描述",
        "SEO",
        "关键词"
      ]
    }
  }
}
```

这样分析时会更准确地识别相关消息。

### 多 Agent 协作

不同 agent 可以共享同一个项目记忆库。

#### 场景1：内容创作 Agent 读取项目信息

```
# 蛋扣（content agent）
读取"影视台风"项目的最新进展，写一篇技术博客
```

蛋扣会：
1. 读取 `chats/oc_xxx/projects/yingshi-taifeng/README.md`
2. 了解项目目标、技术栈、最近进展
3. 基于这些信息创作内容

#### 场景2：商务 Agent 更新项目状态

```
# ML（business agent）
更新"影视台风"项目：已完成客户演示，下一步是签合同
```

ML 会：
1. 读取项目 README.md
2. 在"最近进展"部分添加新条目
3. 更新"下一步计划"

#### 场景3：主 Agent 协调任务

```
# Macini（main agent）
检查所有项目的进度，找出需要关注的任务
```

Macini 会：
1. 扫描所有 `chats/*/projects/*/README.md`
2. 提取"当前任务"部分
3. 汇总需要关注的任务

### 集成到 Workflow

#### 示例1：每日项目报告

创建一个 cron 任务，每天早上生成项目报告：

```javascript
{
  "name": "每日项目报告",
  "schedule": {
    "kind": "cron",
    "expr": "0 9 * * *",  // 每天 9:00
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "生成所有项目的每日报告，发送到飞书"
  },
  "sessionTarget": "isolated",
  "enabled": true
}
```

#### 示例2：新消息提醒

当群聊有新消息时，自动提醒相关 agent：

```javascript
{
  "name": "新消息提醒",
  "schedule": {
    "kind": "every",
    "everyMs": 3600000  // 每小时
  },
  "payload": {
    "kind": "systemEvent",
    "text": "检查群聊新消息，如果有重要讨论，提醒相关 agent"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

#### 示例3：自动归档

每周自动归档旧消息：

```javascript
{
  "name": "自动归档",
  "schedule": {
    "kind": "cron",
    "expr": "0 2 * * 0",  // 每周日 2:00
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "systemEvent",
    "text": "归档 30 天前的聊天记录"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

## 最佳实践

### 1. 定期导出

建议每天导出一次聊天记录，避免一次性导出太多消息导致超时。

```bash
# 每天只导出新消息
node scripts/export-chat-history.mjs \
  --chat-id=oc_xxx \
  --after=$(date -v-1d +%Y-%m-%d)
```

### 2. 合理设置刷新阈值

根据群聊活跃度调整刷新阈值：

```json
{
  "refresh": {
    "messageThreshold": 50,  // 活跃群：50，不活跃群：20
    "daysThreshold": 7       // 活跃群：3，不活跃群：14
  }
}
```

### 3. 使用项目关键词

为每个项目定义清晰的关键词，提高分析准确性：

```json
{
  "analysis": {
    "projectKeywords": {
      "your-project": [
        "核心关键词",
        "技术栈关键词",
        "业务关键词"
      ]
    }
  }
}
```

### 4. 定期清理

定期清理旧的分析数据，避免占用太多空间：

```bash
# 删除 90 天前的 deep-analysis.json
find ~/.openclaw/workspace/chats -name "deep-analysis.json" -mtime +90 -delete
```

### 5. 备份重要数据

定期备份 `chats/` 目录：

```bash
# 使用 rsync 备份
rsync -av ~/.openclaw/workspace/chats/ ~/backups/openclaw-chats/

# 或使用 tar 压缩
tar -czf ~/backups/openclaw-chats-$(date +%Y%m%d).tar.gz \
  ~/.openclaw/workspace/chats/
```

### 6. 监控脚本执行

在 cron 任务中添加日志：

```javascript
{
  "payload": {
    "kind": "systemEvent",
    "text": "执行群聊记忆刷新 >> ~/logs/refresh.log 2>&1"
  }
}
```

### 7. 使用 Git 版本控制

将项目记忆纳入版本控制：

```bash
cd ~/.openclaw/workspace/chats
git init
git add .
git commit -m "Initial commit"

# 每次更新后提交
git add .
git commit -m "Update project memories"
```

### 8. 分离敏感信息

不要在项目记忆中存储敏感信息（密码、API key 等）。如果需要，使用环境变量或加密存储。

### 9. 优化搜索性能

对于大型群聊（>10000 条消息），考虑：
- 使用更精确的时间范围
- 限制返回结果数量
- 定期归档旧消息

### 10. 团队协作规范

如果多个 agent 共享项目记忆，建立规范：
- 更新 README.md 时注明更新人和时间
- 重要决策要记录在"关键决策"部分
- 任务状态变更要及时更新

## 常见问题

### Q: 如何获取群聊 ID？

A: 在飞书群聊中，agent 会自动识别。或者查看 `~/.openclaw/sessions/` 目录中的 session 文件。

### Q: 导出很慢怎么办？

A: 使用 `--limit` 参数限制数量，或使用 `--after` 只导出新消息。

### Q: 如何删除某个项目的记忆？

A: 直接删除对应目录：
```bash
rm -rf ~/.openclaw/workspace/chats/oc_xxx/projects/project-name
```

### Q: 可以导出私聊吗？

A: 可以，使用相同的脚本，只需提供私聊的 chat_id。

### Q: 如何迁移到新机器？

A: 复制整个 `chats/` 目录和配置文件：
```bash
rsync -av ~/.openclaw/workspace/chats/ new-machine:~/.openclaw/workspace/chats/
rsync -av ~/.openclaw/workspace/config.json new-machine:~/.openclaw/workspace/
```

## 下一步

- 查看 [架构设计](docs/architecture.md) 了解系统原理
- 查看 [API 文档](docs/api.md) 了解脚本接口
- 查看 [故障排查](docs/troubleshooting.md) 解决问题
- 加入 [Discord 社区](https://discord.com/invite/clawd) 交流经验
