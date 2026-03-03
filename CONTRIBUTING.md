# 贡献指南

感谢您对 OpenClaw Chat Memory Manager 的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

如果您发现了 bug，请：

1. 检查 [Issues](https://github.com/va7/openclaw-chat-memory/issues) 是否已有相同问题
2. 如果没有，创建新 Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（OpenClaw 版本、Node.js 版本、操作系统）
   - 错误日志（如果有）

### 提出新功能

如果您有新功能建议：

1. 先创建 Issue 讨论
2. 说明：
   - 功能描述
   - 使用场景
   - 为什么需要这个功能
   - 可能的实现方案

### 提交代码

1. **Fork 仓库**
   ```bash
   # 在 GitHub 上点击 Fork 按钮
   git clone https://github.com/YOUR_USERNAME/openclaw-chat-memory.git
   cd openclaw-chat-memory
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **编写代码**
   - 遵循现有代码风格
   - 添加必要的注释
   - 更新相关文档

4. **测试**
   ```bash
   # 运行测试（如果有）
   npm test
   
   # 手动测试
   node scripts/your-script.mjs --help
   ```

5. **提交**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   # 或
   git commit -m "fix: fix your bug"
   ```

   **Commit 消息规范**：
   - `feat:` - 新功能
   - `fix:` - Bug 修复
   - `docs:` - 文档更新
   - `style:` - 代码格式（不影响功能）
   - `refactor:` - 重构
   - `test:` - 测试相关
   - `chore:` - 构建/工具相关

6. **推送**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待 review

## 代码规范

### JavaScript 风格

- 使用 ES6+ 语法
- 使用 2 空格缩进
- 使用单引号
- 函数和变量使用驼峰命名
- 常量使用大写下划线

```javascript
// Good
const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';

async function fetchChatHistory(chatId, options = {}) {
  const { limit = 100, after } = options;
  // ...
}

// Bad
const feishu_api_base = "https://open.feishu.cn/open-apis"

function fetch_chat_history(chat_id, options) {
  var limit = options.limit || 100
  // ...
}
```

### 文档规范

- 使用 Markdown 格式
- 代码块指定语言
- 添加必要的示例
- 保持简洁清晰

### 注释规范

```javascript
/**
 * 导出群聊历史
 * @param {string} chatId - 群聊 ID
 * @param {Object} options - 选项
 * @param {number} options.limit - 限制数量
 * @param {string} options.after - 开始时间
 * @returns {Promise<Array>} 消息列表
 */
async function exportChatHistory(chatId, options = {}) {
  // 实现
}
```

## 开发环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/va7/openclaw-chat-memory.git
cd openclaw-chat-memory
```

### 2. 安装依赖

```bash
# 如果有 package.json
npm install
```

### 3. 配置

```bash
cp config/config.example.json config/config.json
# 编辑 config.json 填入测试凭证
```

### 4. 测试

```bash
# 运行单个脚本
node scripts/export-chat-history.mjs --help

# 运行测试（如果有）
npm test
```

## 项目结构

```
openclaw-chat-memory/
├── scripts/           # 核心脚本
├── skills/            # OpenClaw Skills
├── templates/         # 模板文件
├── config/            # 配置文件
├── docs/              # 文档
├── examples/          # 示例
├── tests/             # 测试
└── tools/             # 工具脚本
```

## 测试

### 单元测试

```bash
npm test
```

### 集成测试

```bash
# 测试导出
node scripts/export-chat-history.mjs --chat-id=test_chat_id

# 测试分析
node scripts/deep-analyze-project.mjs --chat-id=test_chat_id --project=test

# 测试搜索
node scripts/search-chat-history.mjs --chat-id=test_chat_id --keyword=test
```

## 发布流程

（仅限维护者）

1. **更新版本号**
   ```bash
   # 编辑 package.json（如果有）
   npm version patch  # 或 minor, major
   ```

2. **更新 CHANGELOG**
   ```bash
   # 编辑 CHANGELOG.md
   ```

3. **创建 Tag**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

4. **创建 Release**
   ```bash
   gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"
   ```

5. **发布到 ClawHub**
   ```bash
   clawhub publish ./skills/chat-memory-manager
   ```

## 社区

- **GitHub Issues**: [提问和讨论](https://github.com/va7/openclaw-chat-memory/issues)
- **Discord**: [加入社区](https://discord.com/invite/clawd)
- **Twitter**: [@va7](https://twitter.com/va7)

## 行为准则

- 尊重他人
- 保持友善和专业
- 接受建设性批评
- 关注对项目最有利的事情

## 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下发布。

## 感谢

感谢所有贡献者！您的贡献让这个项目变得更好。

---

如有任何问题，请随时在 [Issues](https://github.com/va7/openclaw-chat-memory/issues) 中提问。
