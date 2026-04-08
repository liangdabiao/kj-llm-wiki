# Memory 记忆系统

> OpenClaw的长期记忆机制，将聊天记录整理为持久化知识。

## 基本信息

- **类型**：系统机制
- **核心文件**：MEMORY.md + memory/**/*.md
- **作用**：让Agent持续学习，而非每次对话重新开始

---

## 核心架构

### 两级记忆
1. **每日记忆**：memory/YYYY-MM-DD.md
   - 记录当天的重要事件和决策
   
2. **长期记忆**：MEMORY.md
   - 存储用户偏好、重要教训、学习总结

### 存储范式
- Markdown文件是唯一真相来源（source of truth）
- 所有记忆直接写成 .md 文件
- 人类可读、极致透明

### 检索方式
- 默认：SQLite + sqlite-vec + FTS5
- QMD模式：BM25 + 向量 + reranking 混合检索
- 分块粒度：~400 token块 + 80 token overlap

---

## 记忆写入规范

### 何时写入
- 用户说"记住这个"或"这是血泪教训"
- 重要决策和行动项
- 用户反馈和偏好变更

### 存储位置
- **长期偏好**：MEMORY.md、USER.md
- **人设变更**：SOUL.md
- **流程优化**：HEARTBEAT.md、agents/prompts/
- **反馈日志**：memory/feedback/YYYY-MM-DD-feedback.md

---

## 自我反思与迭代

### 三位一体架构
```
Heartbeat（实时收集30分钟）→ Memory（存储）→ Cron（每日反思22:00）
```

### 每日反思必查
- 今天用户有什么反馈或建议？
- 这些反馈是否已存储到长期记忆？
- 是否已更新人设或流程？

---

## 与 OpenViking 对比

| 维度 | OpenClaw + QMD | OpenViking |
|------|---------------|------------|
| 核心存储 | 纯Markdown，人类可读 | 分层组织（L0/L1/L2） |
| 检索 | BM25+向量+重排混合 | 目录递归+语义搜索 |
| 自我迭代 | 依赖Agent主动写文件 | 内置memory self-iteration loops |
| 适用场景 | 本地优先、极致透明 | 省token、分层确定性 |

---

## 不同素材中的观点

### 2026-04-08 OpenClaw从新手到进阶
- Memory把聊天记录整理成长期记忆，Agent可持续学习
- 可设置每日反思更新SOUL和USER文件

### 2026-04-08 OpenClaw构建自我迭代AI助手
- 中短期召回问题不大，只要不开新session没有明显遗忘
- QMD属于实验功能，search纯BM25，reranker受chunk大小影响
- 目前的记忆系统都还未解决遗忘、图谱、时序等问题

---

## 相关页面

- [[SOUL.md]] — 人格配置
- [[USER.md]] — 用户偏好
- [[Cron]] — 定时反思任务
- [[HEARTBEAT.md]] — 心跳检查
