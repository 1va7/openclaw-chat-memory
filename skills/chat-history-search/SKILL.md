# Chat History Search Skill

**用途**: 高效搜索群聊历史记录，避免多轮推理和重复搜索。

## 触发条件

当用户提到以下关键词时使用此skill：
- "回忆一下"、"找一下"、"搜索"、"查找"
- "今天上午"、"昨天"、"上周"等时间词
- "谁说过"、"之前讨论的"
- "任务"、"布置"、"要求"

## 使用方法

### 基本用法

```bash
# 按时间范围搜索
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="2026-03-03 08:00" \
  --before="2026-03-03 20:00"

# 按关键词搜索
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --keyword="任务" \
  --keyword="布置"

# 按发送者搜索
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --sender="ou_xxx"

# 组合搜索
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="2026-03-03 00:00" \
  --keyword="任务" \
  --sender="ou_xxx"
```

### 输出格式

```json
{
  "total": 45,
  "chat_id": "oc_xxx",
  "chat_name": "示例群聊",
  "time_range": {
    "start": "2026-03-03 08:00:00",
    "end": "2026-03-03 20:00:00"
  },
  "messages": [
    {
      "timestamp": "2026-03-03 12:31:54",
      "timestamp_ms": 1772507114579,
      "sender": "ou_4f0c5425526c97a3e1c3923b8ac8496b",
      "sender_name": "用户A",
      "content": "设置一个定时任务，每天早上8点...",
      "message_id": "om_xxx"
    }
  ]
}
```

## 优势

### 相比直接用 grep/jq

| 方面 | 直接用 grep/jq | 使用此 skill |
|------|---------------|-------------|
| 推理轮数 | 2-3轮 | 1轮 |
| Token消耗 | ~50k | ~5k |
| 时间筛选 | 需要手动计算timestamp | 直接用人类可读的时间 |
| 结构化输出 | 需要手动构造jq命令 | 自动返回JSON |
| 错误处理 | 容易出错 | 内置错误处理 |

### 示例对比

**之前（手动方式）**:
```bash
# 第1步：统计消息数
grep '"timestamp":"17725' messages.jsonl | wc -l

# 第2步：提取内容
grep '"timestamp":"17725' messages.jsonl | jq -r '.timestamp + " | " + .sender + " | " + ...' | head -50

# 第3步：再次搜索最近20条
grep '"timestamp":"17725' messages.jsonl | tail -20 | jq -r '...'
```

**现在（使用skill）**:
```bash
# 一步到位
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="2026-03-03 08:00"
```

## 实现细节

脚本位置：`~/.openclaw/workspace/scripts/search-chat-history.mjs`

核心功能：
1. 自动定位 `chats/{chat_id}/archive/messages.jsonl`
2. 支持多种筛选条件（时间、关键词、发送者）
3. 返回结构化的JSON输出
4. 自动处理时间戳转换
5. 支持发送者名称映射（从context.yaml读取）

## 使用场景

### 场景1：查找今天上午的任务
```bash
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="2026-03-03 08:00" \
  --before="2026-03-03 12:00" \
  --keyword="任务"
```

### 场景2：查找某人说过的话
```bash
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --sender="ou_xxx" \
  --keyword="选题"
```

### 场景3：查找最近的讨论
```bash
node scripts/search-chat-history.mjs \
  --chat-id=oc_xxx \
  --after="24h"  # 支持相对时间
```

## 注意事项

1. **自动推断chat_id**: 如果在群聊中使用，可以省略 `--chat-id`，自动从当前环境推断
2. **时间格式**: 支持多种格式：
   - 绝对时间：`2026-03-03 12:00`
   - 相对时间：`24h`、`1d`、`1w`
   - 今天/昨天：`today`、`yesterday`
3. **关键词搜索**: 支持多个关键词，默认是 AND 关系
4. **性能**: 对于大文件（>10000条消息），建议先用时间范围缩小搜索范围

## 与其他工具的集成

可以与其他工具配合使用：
- 搜索结果可以直接传给 LLM 分析
- 可以导出为 Markdown 格式
- 可以生成摘要报告
