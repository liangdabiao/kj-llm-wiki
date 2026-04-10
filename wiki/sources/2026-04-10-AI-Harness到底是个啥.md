---
tags: [素材, 微信, AI, Harness, Agent, 编程]
created: 2026-04-10
updated: 2026-04-10
source_url: https://mp.weixin.qq.com/s/_2WQuf1CiBPboHLHDTbKFw
---

# AI Harness 到底是个啥？6 张图给你讲明白

> 基于 Sebastian Raschka 博士原文解读，系统拆解 AI Harness 的六大核心组件：实时上下文、提示词缓存、工具、上下文管理、会话记忆、子智能体。

## 基本信息

- **来源**：微信公众号「dingtingli」（上海）
- **原作者**：Sebastian Raschka 博士
- **原文链接**：https://magazine.sebastianraschka.com/p/components-of-a-coding-agent
- **类型**：技术科普
- **提取方式**：agent-browser

---

## 核心观点

1. **LLM ≠ Agent ≠ Harness** —— LLM 是发动机，Agent 是自动驾驶循环，Harness 是底盘和方向盘。三者协作才能让 AI 从"聊天玩具"变成"生产力工具"
2. **Harness 的六大核心组件** —— 实时上下文（自动扫描项目）、提示词缓存（干湿分离）、工具（预设工具箱+安全检查）、上下文管理（裁剪+去重摘要）、会话记忆（双轨：完整日志+工作记忆）、子智能体（老板-小弟模式+权限沙箱）
3. **提示词缓存是成本控制的关键** —— 稳定前缀（人设/系统指令/工具列表）被缓存复用，每次只重新计算动态状态（聊天记录+当前指令），大幅降低 API 成本
4. **上下文膨胀是体验杀手** —— 长文件、冗长日志、重复读取会撑爆窗口，必须通过裁剪和摘要控制
5. **子智能体需要严格权限控制** —— 继承部分上下文但锁死权限（只读/沙箱），防止边缘任务破坏核心代码或无限套娃

---

## 关键概念

- [[AI Harness]] — AI 智能体外围的软件框架系统
- [[多Agent协作]] — 主Agent与子智能体的分工协作
- [[CLAUDE.md]] — Harness 中"实时上下文"的实践（Agent 人设/系统指令配置）
- [[Memory]] — Harness 中"会话记忆"的实践（双轨记忆结构）

---

## 与其他素材的关联

- [[CLAUDE.md]] — 该实体描述的"岗位说明书"正是 Harness"实时上下文"的落地形式，定义了 Agent 的人设和系统指令
- [[多Agent协作]] — 该实体描述的多 Agent 分工正是"子智能体"模式的实践
- [[Memory]] — 该实体描述的长期记忆系统对应 Harness 的"会话记忆"
- [[OpenClaw]] — OpenClaw 本身就是一个 Harness 系统，Claude Code 也是

---

## 原文精彩摘录

> 大模型再聪明，如果被关在网页聊天框里，它也看不见你本地电脑里的项目结构。

> Harness 不仅给了 AI 手脚，还给它戴上了"紧箍咒"。

> 老大负责运筹帷幄把控主线，小弟负责跑腿死磕支线细节。
