# 2026-04-08 OpenClaw构建自我迭代AI助手

> 深度体验OpenClaw，构建可自我迭代的银行客户经理助手，验证通用智能体框架。

## 基本信息

- **素材类型**：网页文章
- **来源**：网络整理
- **日期**：2026-04-08
- **原始文件**：[raw/articles/OpenClaw构建自我迭代AI助手笔记.md](../../raw/articles/OpenClaw构建自我迭代AI助手笔记.md)

---

## 核心观点

1. **通用智能体的迭代优化，本质是在模型能力基础上对Context能力的强优化**
2. **核心文件**：SOUL.md（身份）/ AGENTS.md（规则）/ USER.md（用户）/ MEMORY.md（记忆）/ HEARTBEAT.md（心跳）
3. **自我反思与迭代系统**：Heartbeat（实时收集30分钟）→ Memory（存储）→ Cron（每日反思22:00）
4. **反馈处理机制**：反馈收集 → 判断类型 → 立即处理 → 写入memory/feedback/
5. **AgentToAgent通信**：OpenClaw限制A2A pingpong最多5轮
6. **OpenClaw vs Claude Code**：OpenClaw是养成系AI助手，Claude Code是工具系AI牛马
7. **记忆系统对比**：OpenClaw + QMD ≈ "极简Markdown + 强大的本地混合检索引擎"

---

## 关键概念

- [[AgentToAgent]] — Agent间自主通信
- [[agent-eval skill]] — Agent评估能力
- [[规划文件]] — planning-with-files技能
- [[OpenViking]] — 字节开源的记忆框架

---

## Heartbeat vs Cron 区别

| 维度 | Heartbeat | Cron |
|------|-----------|------|
| 触发方式 | 固定间隔30m+主动唤醒 | cron表达式/固定间隔 |
| 任务来源 | HEARTBEAT.md文件 | 配置中的job定义 |
| 执行模式 | 总是运行在主会话 | main或isolated会话 |
| 使用场景 | 运维检查、状态监控 | 定时任务、批处理 |

---

## 与其他素材的关联

- 与 [[OpenClaw从新手到进阶]] 互补，都是进阶实践
- 与 [[SOUL.md]] 配置相关
- 与 [[Memory]] 记忆系统相关

---

## 原文精彩摘录

> "你不是聊天机器人，你正在成为某个人"

> "通用智能体的迭代优化，本质是在模型能力基础上，针对Context能力的强优化"
