# 基础示例

这个示例展示如何使用 OpenClaw Chat Memory Manager 的基本功能。

## 场景

您有一个飞书群聊，讨论"影视台风"项目。您想：
1. 导出聊天历史
2. 分析项目信息
3. 搜索特定讨论
4. 设置自动刷新

## 步骤

### 1. 获取群聊 ID

在 OpenClaw 中，发送消息到群聊：

```
我的群聊 ID 是什么？
```

Agent 会回复类似：`oc_f1c3487263639889eedb076c5afd4ad3`

### 2. 导出聊天历史

```bash
node ~/.openclaw/workspace/scripts/export-chat-history.mjs \
  --chat-id=oc_f1c3487263639889eedb076c5afd4ad3
```

输出：
```
✓ 已导出 1523 条消息
✓ 保存到: ~/.openclaw/workspace/chats/oc_f1c3487263639889eedb076c5afd4ad3/archive/messages.jsonl
```

### 3. 分析项目

```bash
node ~/.openclaw/workspace/scripts/deep-analyze-project.mjs \
  --chat-id=oc_f1c3487263639889eedb076c5afd4ad3 \
  --project=yingshi-taifeng \
  --keywords="影视台风,视频生成,AI"
```

输出：
```
✓ 分析完成
✓ 识别到 5 个目标
✓ 识别到 8 个任务
✓ 识别到 12 个关键决策
✓ 生成工作记忆文档: chats/.../projects/yingshi-taifeng/README.md
```

### 4. 查看项目记忆

```bash
cat ~/.openclaw/workspace/chats/oc_f1c3487263639889eedb076c5afd4ad3/projects/yingshi-taifeng/README.md
```

您会看到结构化的项目信息：
- 核心目标
- 当前任务
- 技术栈
- 关键决策
- 最近进展
- 下一步计划

### 5. 搜索历史

搜索关于"部署"的讨论：

```bash
node ~/.openclaw/workspace/scripts/search-chat-history.mjs \
  --chat-id=oc_f1c3487263639889eedb076c5afd4ad3 \
  --keyword="部署" \
  --limit=5
```

输出：
```json
{
  "total": 5,
  "chat_id": "oc_f1c3487263639889eedb076c5afd4ad3",
  "messages": [
    {
      "timestamp": "2026-03-01 14:30:00",
      "sender": "ou_xxx",
      "content": "部署到生产环境需要注意..."
    },
    ...
  ]
}
```

### 6. 在 OpenClaw 中使用

直接告诉 agent：

```
搜索群聊中关于"部署"的讨论
```

Agent 会自动使用 `chat-history-search` skill，返回结果。

### 7. 设置自动刷新

在 OpenClaw 中：

```
创建一个定时任务，每天晚上 11 点刷新群聊记忆
```

Agent 会创建 cron 任务，自动检测新消息并更新项目记忆。

## 结果

现在您有了：
- ✅ 完整的聊天历史存档
- ✅ 结构化的项目记忆文档
- ✅ 高效的搜索能力
- ✅ 自动更新机制

## 下一步

- 查看 [USAGE.md](../USAGE.md) 了解更多功能
- 尝试 [多 Agent 协作示例](multi-agent/)
- 探索 [自定义分析规则](custom-analysis/)
