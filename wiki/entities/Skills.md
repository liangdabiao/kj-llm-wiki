# Skills

> OpenClaw的工具能力系统，教Agent如何使用某种能力（浏览网页、下载文件、抓取数据等）。

## 基本信息

- **类型**：扩展机制
- **本质**：操作说明文档，教Agent如何使用某种能力
- **安装方式**：`npx skills add <url> -s <skill-name>`

---

## 核心原则

### Skills不是越多越好
- ❌ 错误：一口气装几十个，工具互相干扰
- ✅ 正确：按领域装，每个领域选几个核心技能

### 层级隔离
- **公共技能**：~/.openclaw/skills/（跨Agent调用不丢包）
- **私有技能**：Agent专属skills子目录（防止工具幻觉）

---

## 安装建议（2026-04-08 更新）

围绕核心工作流，只装真正高频使用的5-8个。推荐安装顺序：

1. **安全打底**：[[Skill Vetter]]（安装前必审）
2. **基础能力**：Tavily Search、[[last30days]]、agent-browser、summarize
3. **进阶优化**：[[self-improving-agent]]、[[skill-creator]]
4. **按需选装**：[[Claude-to-IM-skill]]

> Skills不是越多越好：每个Skill吃上下文token，功能相近的会互相打架，装了不用的就是心理安慰。

---

## 推荐Skills分类

### 安全性
- **skill-security-auditor** — 检查skills安全性

### 自我提升
- **agent-self-reflection** — 周期性总结对话
- **active-maintenance** — 自动维护系统和记忆文件

### 联网搜索
- **tavily-search** — LLM专用搜索API（月1000次免费）
- **multi-search-engine** — 多搜索引擎兜底
- **Agent Reach** — 搜索小红书/X/YouTube/Reddit/B站
- **searxng** — 本地容器搜索（建议2核2G以上服务器）

### 浏览器自动化
- **agent-browser** — Vercel出品，在用户浏览器环境运行
- **browser-use** — 视觉方式操作网页
- **playwright-browser** — 传统浏览器自动化

### 跨境电商
- **amazon-sync** — 亚马逊订单与库存同步
- **listing-optimizer** — Listing标题/五点/关键词优化
- **ad-monitor** — 广告ACOS/CTR/CVR实时监控
- **competitor-tracker** — 竞品价格/上新/差评监控

### 飞书集成（8个）
- feishu-bitable — 多维表格
- feishu-calendar — 日历
- feishu-create-doc / fetch-doc / update-doc — 云文档
- feishu-im-read — IM消息读取
- feishu-task — 任务管理
- feishu-troubleshoot — 问题排查
- feishu-channel-rules — 频道规则

---

## 不同素材中的观点

### 2026-04-08 OpenClaw从新手到进阶
- skills本质是一段操作说明，教Agent如何使用某种能力
- 一个低质量skill可能会抢先执行，真正好用的工具反而调不到

### 2026-04-08 OpenClaw跨境电商必装技能
- 2026年3月更新后，插件生态重心转向ClawHub
- 强制使用注入运行时，SDK重构接口收敛

### 2026-04-08 最值得安装的8个Skill技能
- 推荐按安全→基础→进阶→按需的四阶段安装顺序
- 围绕核心工作流只装5-8个高频Skill
- 每个Skill吃上下文token，装20个和装5个差几千token
- Skill Vetter列为第一阶段必须安装（安全打底）
- self-improving-agent位列ClawHub热门榜第一（46k+ installs）
- skill-creator是Anthropic官方出品，用于创建自定义Skill

---

## 相关页面

- [[ClawHub.ai]] — 技能市场
- [[OpenClaw]] — AI智能体框架
- [[浏览器自动化]] — 浏览器类Skills
- [[Skill Vetter]] — Skill安全审查
- [[last30days]] — 社区情绪追踪
- [[self-improving-agent]] — Agent自我进化
- [[Claude-to-IM-skill]] — 远程操控
- [[skill-creator]] — 自定义Skill创建
