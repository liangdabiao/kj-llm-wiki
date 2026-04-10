# 多Agent协作

> 多个AI Agent按流程分工协作，实现复杂任务的自动化处理。

## 基本信息

- **类型**：架构模式
- **核心协议**：AgentToAgent (A2A)
- **作用**：将复杂业务拆解为流水线作业，每个Agent专注一类任务

---

## 核心原则

### 按流程拆，不按渠道拆
- ❌ 错误：推特Bot、小红书Bot、公众号Bot（每个都重复研究和写作）
- ✅ 正确：研究Agent、写作Agent、编辑Agent、分发Agent（每个只做一件事）

### 模型分级策略
- **决策层**（Lead/Strategist）：顶级模型（Claude 4.6），处理复杂调度
- **执行层**（Researcher/Formatter）：高性价比模型（Gemini 3 Flash），处理数据清洗

### Skill层级隔离
- **公共技能**：~/.openclaw/skills/（生图、搜图），跨Agent调用不丢包
- **私有技能**：Agent专属skills子目录，防止工具幻觉

---

## 协作架构

### 飞书多Agent配置
```
飞书是前台 → Gateway是总机 → Agent是不同岗位员工
```

1. **工作区物理隔离**：每个Agent独立Workspace
2. **多账号长连接路由**：飞书开放平台建多个独立应用
3. **A2A底层通信协议**：tools.agentToAgent开启白名单

### sessions_send 通信
- 使用session_send（非session_spawn）触发通信
- OpenClaw限制A2A pingpong最多5轮

---

## 实战案例：5个AI员工跨境电商

| Agent | 职责 |
|-------|------|
| 大总管(lead) | 需求拆解、sessions_send跨节点分发 |
| VOC市场分析师 | 全网抓取评价数据，提炼用户痛点 |
| GEO内容优化师 | 亚马逊和独立站内容撰写 |
| Reddit营销专家 | 5周养号SOP，精准版块互动 |
| TikTok爆款编导 | 分析爆款逻辑，生成UGC视频 |

---

## 不同素材中的观点

### 2026-04-08 OpenClaw从新手到进阶
- 当任务开始变复杂，一只Agent很难兼顾所有事情
- 按流程拆成研究、写作、编辑、分发，每个Agent只处理一类任务
- 一群Agent开始在群里协作，像一支小团队

### 2026-04-08 用OpenClaw搭跨境电商团队
- 采用"异步状态机"逻辑，将复杂跨境业务拆解成流水线作业
- 大总管通过sessions_send异步穿透，人类只需在飞书上审批
- 功能导向（Role-based）优于平台导向

### 2026-04-08 OpenClaw构建自我迭代AI助手
- AgentToAgent配置需开启enabled和allow白名单
- 测试用例尽量在5轮内结束（OpenClaw限制）

### 2026-04-10 AI Harness 到底是个啥
- Harness 的"子智能体"模式：主 Agent 动态召唤子智能体处理边缘问题，子智能体继承部分上下文但权限严格限制（只读/沙箱）
- 与 OpenClaw 的 sessions_send 通信异曲同工：都是主从架构，但 Harness 更强调权限沙箱防止无限套娃
- 子智能体的核心价值：老大运筹帷幄把控主线，小弟跑腿死磕支线细节

---

## 常见问题

### Q: 什么时候适合拆分为多Agent？
A: 当任务开始变复杂，一只Agent很难兼顾所有事情的时候。

### Q: Agent设计按平台还是按职能？
A: 功能导向（Role-based）优于平台导向。

### Q: 飞书群里@Agent为什么无效？
A: 飞书有Bot-to-Bot Loop Prevention机制，需用sessions_send走底层"暗线"交换数据。

---

## 相关页面

- [[AI Harness]] — Harness 中的子智能体组件
- [[OpenClaw]] — AI智能体框架
- [[sessions_send]] — 跨Agent通信协议
- [[workspace]] — 工作区隔离
