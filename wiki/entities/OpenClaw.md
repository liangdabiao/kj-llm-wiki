# OpenClaw

> 开源、本地优先的AI智能体网关框架，能将大模型的语言理解能力转化为实际执行能力。

## 基本信息

- **类型**：开源AI Agent框架
- **别名**：龙虾、Clawdbot
- **核心特点**：本地优先、插件化技能体系、多渠道接入、持久记忆
- **默认模型**：GPT-5.4（2026年3月后）

---

## 核心能力

### 1. 文件操作
- 读写本地文件
- 管理目录结构
- 生成文档和报告

### 2. 浏览器自动化
- 通过Playwright/browser-use等操作网页
- 抓取数据、填写表单、截图
- 支持反爬穿透（Stealth/Firecrawl）

### 3. 流程编排
- Cron定时任务
- Heartbeat心跳检查
- 多Agent协作

### 4. 多渠道接入
- 飞书、企业微信、WhatsApp、Telegram、Discord等30+渠道
- 一个知识库服务所有平台

### 5. 记忆系统
- SOUL.md（人格）、USER.md（用户偏好）、MEMORY.md（长期记忆）
- 支持QMD混合检索（BM25+向量+重排）

---

## 核心文件

| 文件 | 职责 |
|------|------|
| SOUL.md | AI人格、语气、规则 |
| USER.md | 用户信息和偏好 |
| AGENTS.md | 工作区规则 |
| MEMORY.md | 长期记忆 |
| HEARTBEAT.md | 心跳检查清单 |
| openclaw.json | 系统运行配置 |

---

## 技能生态

### 基础必装
- tavily-search — AI联网搜索
- self-improving-agent — 自主学习能力
- n8n-workflow — 跨系统联动
- summarize — 数据浓缩

### 浏览器自动化
- agent-browser — Vercel出品，27.2k star
- playwright-npx — 传统方案
- stealth-browser — 过Cloudflare
- Firecrawl — 远程沙盒

### 跨境电商
- amazon-sync / temu-sync / shopee-sync — 店铺同步
- listing-optimizer — Listing优化
- ad-monitor — 广告监控
- competitor-tracker — 竞品追踪

### 飞书集成（8个）
- feishu-bitable — 多维表格
- feishu-calendar — 日历
- feishu-create-doc — 创建云文档
- feishu-fetch-doc — 获取云文档
- feishu-im-read — IM消息读取
- feishu-task — 任务管理
- feishu-update-doc — 更新云文档
- feishu-troubleshoot — 问题排查

---

## 不同素材中的观点

### 2026-04-08 OpenClaw从新手到进阶
- OpenClaw本质不是聊天机器人，而是可持续运行的AI Agent
- 需要配置好SOUL和USER才值得继续培养
- skills不是越多越好，按领域装即可

### 2026-04-08 用OpenClaw搭跨境电商团队
- 多Agent架构采用"异步状态机"逻辑
- 模型分级策略：决策层用顶级模型，执行层用高性价比模型
- 5个AI员工可跑通跨境电商全平台矩阵

### 2026-04-08 OpenClaw构建自我迭代AI助手
- 通用智能体的迭代优化，本质是对Context能力的强优化
- 自我反思与迭代系统：Heartbeat → Memory → Cron
- OpenClaw是养成系AI助手，Claude Code是工具系AI牛马

### 2026-04-08 跨境电商龙虾版
- 文件系统本身就是集成层和记忆护城河
- 40天养成，8个子智能体协同工作
- 三层架构：身份层 → 操作层 → 知识层

---

## 相关页面

- [[SOUL.md]] — 人格配置
- [[AGENTS.md]] — 工作区规则
- [[Memory]] — 记忆系统
- [[多Agent协作]] — 多Agent架构
- [[飞书系列 Skills]] — 飞书集成
- [[ClawHub.ai]] — 技能市场
