# sessions_send

> OpenClaw的跨Agent通信协议，让大总管能在后台发号施令的"唯一数据总线"。

## 基本信息

- **类型**：通信协议
- **作用**：实现Agent之间的异步消息传递
- **限制**：OpenClaw限制A2A pingpong最多5轮

---

## 核心作用

### 跨域分发
大总管通过 sessions_send 将任务分发到不同的专业Agent：
- 指令发给 voc-analyst → VOC洞察
- 指令发给 geo-optimizer → 内容撰写
- 指令发给 reddit-spec → 社区营销
- 指令发给 tiktok-director → 视频生成

### 异步穿透
全部流程在底层通过 sessions_send 异步穿透，人类只需在飞书上审批。

---

## 配置要求

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["lead", "geo-optimizer", "reddit-spec", "tiktok-director"]
    }
  }
}
```

必须在 tools.agentToAgent 中开启白名单，这是让大总管能在后台发号施令的唯一数据总线。

---

## 不同素材中的观点

### 2026-04-08 用OpenClaw搭跨境电商团队
- 大总管负责使用 sessions_send 跨域分发任务
- 严禁大总管自己执行底层任务，必须委派
- 对不同成员并发调用 sessions_send

### 2026-04-08 OpenClaw构建自我迭代AI助手
- 使用session_send（非session_spawn）来触发通信
- 发送到对方的main session

---

## 相关页面

- [[多Agent协作]] — 多Agent架构
- [[AgentToAgent]] — A2A通信
