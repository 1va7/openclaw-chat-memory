# 安装指南

本文档提供详细的安装步骤和配置说明。

## 前置要求

### 必需
- **OpenClaw** >= 2026.2.x
- **Node.js** >= 18.x
- **飞书插件** (@m1heng-clawd/feishu 或 @openclaw/feishu)

### 可选
- **Git** - 用于从 GitHub 克隆
- **clawhub CLI** - 用于通过 ClawHub 安装

## 检查前置要求

```bash
# 检查 Node.js 版本
node -v  # 应该 >= v18.0.0

# 检查 OpenClaw
openclaw --version

# 检查 OpenClaw workspace
ls ~/.openclaw/workspace
```

## 安装方式

### 方式1：通过 ClawHub（推荐给普通用户）

这是最简单的安装方式，会自动处理所有配置。

```bash
# 1. 安装
clawhub install chat-memory-manager

# 2. 配置飞书凭证
nano ~/.openclaw/workspace/config.json

# 3. 重启 gateway
openclaw gateway restart
```

**优点**：
- 一键安装
- 自动配置
- 自动更新

### 方式2：从 GitHub 克隆（推荐给开发者）

适合需要自定义或贡献代码的用户。

```bash
# 1. 克隆仓库
git clone https://github.com/va7/openclaw-chat-memory.git
cd openclaw-chat-memory

# 2. 运行安装脚本
./tools/install.sh

# 3. 配置飞书凭证
nano ~/.openclaw/workspace/config.json

# 4. 重启 gateway
openclaw gateway restart
```

**优点**：
- 完整的代码和文档
- 可以自定义修改
- 可以贡献代码

### 方式3：手动安装（高级用户）

完全手动控制安装过程。

```bash
# 1. 下载项目
wget https://github.com/va7/openclaw-chat-memory/archive/refs/heads/main.zip
unzip main.zip
cd openclaw-chat-memory-main

# 2. 复制脚本
cp scripts/*.mjs ~/.openclaw/workspace/scripts/

# 3. 复制 skill
mkdir -p ~/.openclaw/workspace/skills/chat-history-search/scripts
cp skills/chat-history-search/SKILL.md ~/.openclaw/workspace/skills/chat-history-search/
cp skills/chat-history-search/scripts/*.mjs ~/.openclaw/workspace/skills/chat-history-search/scripts/

# 4. 复制模板
mkdir -p ~/.openclaw/workspace/templates
cp templates/*.template ~/.openclaw/workspace/templates/

# 5. 创建配置文件
cp config/config.example.json ~/.openclaw/workspace/config.json

# 6. 编辑配置
nano ~/.openclaw/workspace/config.json

# 7. 创建 chats 目录
mkdir -p ~/.openclaw/workspace/chats

# 8. 重启 gateway
openclaw gateway restart
```

## 配置

### 1. 获取飞书凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建或选择一个应用
3. 在"凭证与基础信息"页面找到：
   - **App ID** (cli_xxx)
   - **App Secret** (xxx)

### 2. 配置权限

在飞书应用管理后台，确保应用有以下权限：

**必需权限**：
- `im:message` - 获取与发送单聊、群组消息
- `im:message.group_msg` - 获取群组消息
- `im:chat` - 获取群组信息
- `im:chat:readonly` - 获取群组信息（只读）

**可选权限**（用于高级功能）：
- `im:message.file` - 获取消息中的文件
- `im:message.image` - 获取消息中的图片

### 3. 编辑配置文件

编辑 `~/.openclaw/workspace/config.json`：

```json
{
  "feishu": {
    "appId": "cli_a9f59de34db89bef",
    "appSecret": "4osIcfx6UeKGgyPLfwVv6gmcOGGaD51b"
  },
  "workspace": {
    "chatsDir": "~/.openclaw/workspace/chats"
  },
  "refresh": {
    "messageThreshold": 50,
    "daysThreshold": 7
  }
}
```

**配置说明**：
- `feishu.appId` - 飞书 App ID
- `feishu.appSecret` - 飞书 App Secret
- `workspace.chatsDir` - 聊天记录存储目录
- `refresh.messageThreshold` - 触发刷新的新消息数量阈值
- `refresh.daysThreshold` - 触发刷新的天数阈值

### 4. 更新 AGENTS.md（可选）

如果您想让 agent 自动使用搜索 skill，在 `~/.openclaw/workspace/AGENTS.md` 中添加：

```markdown
## 🛑 任务执行前检查（每次任务必做！）

收到任务时，在回复之前：

1. **STOP** — 不要立刻回复，先思考
2. **SEARCH** — 用 grep/find 搜索 workspace 中的相关文件
   - `grep -r "关键词" ~/.openclaw/workspace/`
   - **搜索群聊历史**：用 `chat-history-search` skill（不要手动grep JSONL）
   - 检查 `temp/`、`contracts/` 等目录
3. **RECORD** — 立即记录到 `memory/YYYY-MM-DD.md`
4. **THEN ACT** — 找到 context 后再执行任务
```

## 验证安装

### 1. 检查文件

```bash
# 检查脚本
ls ~/.openclaw/workspace/scripts/*.mjs

# 检查 skill
ls ~/.openclaw/workspace/skills/chat-history-search/

# 检查配置
cat ~/.openclaw/workspace/config.json
```

### 2. 测试脚本

```bash
# 测试导出脚本
node ~/.openclaw/workspace/scripts/export-chat-history.mjs --help

# 测试搜索脚本
node ~/.openclaw/workspace/scripts/search-chat-history.mjs --help
```

### 3. 测试 Skill

在 OpenClaw 中发送消息：

```
搜索群聊历史中关于"任务"的讨论
```

Agent 应该自动使用 `chat-history-search` skill。

## 故障排查

### 问题1：找不到配置文件

**错误**：`Error: Cannot find config.json`

**解决**：
```bash
cp ~/.openclaw/workspace/openclaw-chat-memory/config/config.example.json ~/.openclaw/workspace/config.json
nano ~/.openclaw/workspace/config.json
```

### 问题2：飞书 API 401 错误

**错误**：`401 Unauthorized`

**原因**：App ID 或 App Secret 错误

**解决**：
1. 检查配置文件中的凭证
2. 确认凭证是否正确
3. 确认应用是否已启用

### 问题3：Skill 未加载

**现象**：Agent 不使用 `chat-history-search` skill

**解决**：
```bash
# 重启 gateway
openclaw gateway restart

# 检查 skill 是否存在
ls ~/.openclaw/workspace/skills/chat-history-search/SKILL.md
```

### 问题4：权限不足

**错误**：`403 Forbidden` 或 `99991663`

**原因**：飞书应用缺少必要权限

**解决**：
1. 访问飞书开放平台
2. 进入应用管理 → 权限管理
3. 添加必需权限（见上方"配置权限"章节）
4. 重新获取 token

### 问题5：Node.js 版本过低

**错误**：`SyntaxError: Unexpected token`

**原因**：Node.js 版本 < 18.x

**解决**：
```bash
# 使用 nvm 升级 Node.js
nvm install 18
nvm use 18

# 或使用 Homebrew（macOS）
brew install node@18
```

## 卸载

如果需要卸载：

```bash
# 删除脚本
rm ~/.openclaw/workspace/scripts/export-chat-history.mjs
rm ~/.openclaw/workspace/scripts/deep-analyze-project.mjs
rm ~/.openclaw/workspace/scripts/refresh-chat-memory.mjs
rm ~/.openclaw/workspace/scripts/search-chat-history.mjs

# 删除 skill
rm -rf ~/.openclaw/workspace/skills/chat-history-search

# 删除配置（可选）
rm ~/.openclaw/workspace/config.json

# 删除数据（可选，会丢失所有聊天记录）
rm -rf ~/.openclaw/workspace/chats

# 重启 gateway
openclaw gateway restart
```

## 下一步

安装完成后，请阅读 [使用文档](USAGE.md) 了解如何使用。

## 获取帮助

如果遇到问题：

1. 查看 [故障排查文档](docs/troubleshooting.md)
2. 搜索 [GitHub Issues](https://github.com/va7/openclaw-chat-memory/issues)
3. 在 [Discord](https://discord.com/invite/clawd) 提问
4. 提交新的 [Issue](https://github.com/va7/openclaw-chat-memory/issues/new)
