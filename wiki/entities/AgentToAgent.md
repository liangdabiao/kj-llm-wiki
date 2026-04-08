# AgentToAgent

> OpenClaw的Agent间自主通信机制，支持多Agent协作。

## 基本信息

- **类型**：系统功能
- **配置**：tools.agentToAgent 开启白名单
- **限制**：pingpong最多5轮，防止无限循环

---

## 配置方式

```json
{
  "agentToAgent": {
    "enabled": true,
    "allow": [
      "main",
      "ai-expert",
      "bank-manager"
    ]
  }
}
```

---

## 通信方式

### session_send vs session_spawn
- **session_send**：用于触发Agent间通信，发送到对方的main session
- **session_spawn**：创建新的临时会话

### 测试用例
由于限制最多5轮，测试用例尽量在5轮内结束。

---

## 不同素材中的观点

### 2026-04-08 OpenClaw构建自我迭代AI助手
- AgentToAgent权限开启是跨Agent自主通信的前提
- 测试用例尽量在5轮内结束

### 2026-04-08 用OpenClaw搭跨境电商团队
- A2A底层通信协议是让大总管发号施令的唯一数据总线
- 飞书有Bot-to-Bot Loop Prevention机制，需用sessions_send走底层"暗线"

---

## 相关页面

- [[多Agent协作]] — 多Agent架构
- [[sessions_send]] — 通信协议
