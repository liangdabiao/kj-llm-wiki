# 操作日志

> 记录知识库的所有变更历史

---

## 2026-04-08 — 初始化

- **操作**：创建知识库
- **主题**：AI 技术学习笔记

---

## 2026-04-08 digest | Skills

- **综合素材**：15+ 篇
- **新增页面**：wiki/synthesis/Skills深度报告.md
- **覆盖内容**：Skill 概念定义、安装策略（四阶段）、安全审查、跨境电商七大领域 Skills、飞书 8 个内置 Skill、自我进化类 Skills、浏览器自动化对比、联网搜索对比、尚待解决问题

---

## 2026-04-08 digest | 跨境电商使用OpenClaw

- **综合素材**：25+ 篇
- **新增页面**：wiki/synthesis/跨境电商使用OpenClaw深度报告.md
- **覆盖内容**：六大痛点与 AI 解决方案、三层架构、多 Agent 协作（5/28 Agent）、四大自动化场景（选品/客服/运营/营销）效果量化、选品方法论对比（六步法 vs 七步法）、客服方案对比、必装 Skills 七大领域、从零到部署完整路径
- **状态**：完成

---

## 2026-04-08 ingest | QBotClaw 浏览器龙虾

- **素材**：国内首个浏览器"龙虾"上线（智东西）
- **提取方式**：agent-browser
- **状态**：完成

**新增**：5个页面（1素材+4实体）

---

## 2026-04-08 batch-ingest | raw/articles 批量消化（27篇）

- **素材**：OpenClaw、跨境电商、智能客服、选品营销、飞书AI等
- **状态**：完成

**新增素材摘要**：27篇
**新增实体页**：1篇（OpenClaw）
**更新**：index.md、log.md、overview.md

---

## 2026-04-08 补救 | 批量创建关键实体页（15个）

- **原因**：首批批量消化时仅创建1个实体页，严重不足
- **状态**：完成

**新增实体页**：
SOUL.md / AGENTS.md / Memory / 多Agent协作 / RAG / 智能客服 / 选品SOP / 浏览器自动化 / ClawHub.ai / HEARTBEAT.md / Skills / Cron / 飞书多维表格 / AI选品 / WhatsApp客服

---

## 2026-04-08 全面检查与修复

- **操作**：按llm-wiki SKILL.md规范系统性检查
- **状态**：完成

### 修复内容

**1. 命名不一致修复（21个文件）**
- `[[OpenClaw 从新手到进阶]]` → `[[OpenClaw从新手到进阶]]`
- `[[OpenClaw+跨境电商必装技能]]` → `[[OpenClaw跨境电商必装技能]]`
- `[[OpenClaw构建自我迭代AI助手笔记]]` → `[[OpenClaw构建自我迭代AI助手]]`
- `[[群「蹲」需求]]` → `[[群蹲需求]]`
- `[[WhatsApp 智能客服机器人]]` → `[[WhatsApp智能客服机器人]]`
- `[[基于cc的浏览器自动化选型推荐]]` → `[[基于CC的浏览器自动化选型推荐]]`
- `[[跨境电商工作]]` → `[[跨境卖家六大痛点]]`
- `[[13个AI助手]]` → `[[2026-04-08-13个AI助手]]`
- `[[15款跨境电商运营工具]]` → `[[2026-04-08-15款跨境电商运营工具]]`
- `[[9格]]` → `[[2026-04-08-9格分镜法]]`

**2. 新增实体页（10个）**
- CLAUDE.md — AI助手岗位说明书
- 飞书AI系统 — 飞书+Claude运营系统
- GEO — 生成引擎优化
- sessions_send — 跨Agent通信协议
- AgentToAgent — Agent间自主通信
- NotebookLM — Google知识库工具
- VOC分析 — 用户声音分析
- agent-eval skill — Agent评估能力
- OpenViking — 字节记忆框架
- workspace — Agent工作区

**3. 新增主题页（4个）**
- 跨境电商AI自动化 — 全链路自动化
- 智能客服体系 — 7×24小时客服
- AI选品方法论 — 系统化选品流程
- OpenClaw生态 — 配置/技能/多Agent

### 最终统计

| 类型 | 数量 |
|------|------|
| 素材摘要 | 28 |
| 实体页 | 26 |
| 主题页 | 4 |
| Wiki页面总数 | 57 |

---

## 2026-04-08 ingest | 最值得安装的8个Skill技能

- **素材**：顾小北（小北的梦呓）— 8个实用Skills推荐
- **原文链接**：https://mp.weixin.qq.com/s/qvSMqhUBglohMqjlxGGeaw
- **提取方式**：agent-browser（wechat-article-to-markdown失败后备用）
- **状态**：完成

**新增**：6个页面（1素材+5实体）
- wiki/sources/2026-04-08-最值得安装的8个Skill技能.md
- wiki/entities/Skill Vetter.md
- wiki/entities/last30days.md
- wiki/entities/self-improving-agent.md
- wiki/entities/Claude-to-IM-skill.md
- wiki/entities/skill-creator.md

**更新**：3个页面
- [[Skills]] — 追加安装建议和观点
- [[ClawHub.ai]] — 追加10,000+ Skill规模和安全事件
- [[浏览器自动化]] — 追加agent-browser观点

---

## 2026-04-08 ingest | 深圳OpenClaw大会

- **素材**：跨境Ai视界（知无不言）— 深圳跨境电商OpenClaw线下大会推广
- **原文链接**：https://mp.weixin.qq.com/s/cHjfESsJ-e5eeOLWpKsprQ
- **提取方式**：Playwright MCP browser（wechat-article-to-markdown失败后备用）
- **图片**：6张长图海报已通过vision API提取，5/6成功（1张重复、1张被其他图片覆盖）
- **状态**：完成

**新增**：5个页面（1素材+2实体）
- wiki/sources/2026-04-08-深圳OpenClaw大会.md
- wiki/entities/N8N.md
- wiki/entities/COSMO.md

**更新**：3个页面
- wiki/entities/GEO.md — 追加大会Simon演讲"GEO是结果而不是方法"
- wiki/entities/N8N.md — 追加田野演讲"从人肉运营到超级贾维斯"详情
- raw/wechat/2026-04-08-深圳OpenClaw大会.md — 补充完整海报OCR内容（议程、嘉宾、场地）

---

## 2026-04-09 ingest | Karpathy AI知识库搭建全流程

- **素材**：小智AI指南（easypay007）— Karpathy 公开 AI 知识库搭建全流程
- **原文链接**：https://mp.weixin.qq.com/s/8AYt5iyDSvYAVnd3fyRePQ
- **提取方式**：agent-browser（skill 更新后的首次微信提取）
- **状态**：完成

**新增**：3个页面（1素材+1实体+1原始素材）
- wiki/sources/2026-04-09-Karpathy-AI知识库搭建全流程.md
- wiki/entities/Karpathy知识库方法论.md
- raw/wechat/2026-04-09-Karpathy-AI知识库搭建全流程.md

**更新**：2个页面
- wiki/entities/CLAUDE.md — 追加 Karpathy 对 Schema 的观点
- wiki/entities/浏览器自动化.md — 追加 agent-browser 作为知识库素材收集工具

---

## 2026-04-09 ingest | 如何入门Python爬虫（知乎）

- **素材**：知乎经典问题「如何入门Python爬虫？」（17002 关注、95 万+ 浏览、83 个回答）
- **原文链接**：https://www.zhihu.com/question/20899988
- **提取方式**：webReader（agent-browser headless 403、agent-browser no-sandbox 滑块验证码、Playwright MCP 关闭、webReader 直接访问为空 → 最终通过回答详情页 URL 成功）
- **状态**：完成

**新增**：4个页面（1素材+2实体+1原始素材）
- wiki/sources/2026-04-09-如何入门Python爬虫.md
- wiki/entities/Python爬虫.md
- wiki/entities/反爬虫.md
- raw/zhihu/2026-04-09-如何入门Python爬虫.md

**更新**：2个页面
- wiki/entities/浏览器自动化.md — 追加知乎反爬实测对比数据
- index.md — 新增 Python编程素材分类和 2 个实体索引

---

## 2026-04-10 ingest | AI Harness 到底是个啥

- **素材**：dingtingli（上海）— 基于 Sebastian Raschka 博士原文解读 AI Harness 六大核心组件
- **原文链接**：https://mp.weixin.qq.com/s/_2WQuf1CiBPboHLHDTbKFw
- **原文出处**：https://magazine.sebastianraschka.com/p/components-of-a-coding-agent
- **提取方式**：agent-browser（微信提取稳定可用）
- **状态**：完成

**新增**：3个页面（1素材+1实体+1原始素材）
- wiki/sources/2026-04-10-AI-Harness到底是个啥.md
- wiki/entities/AI Harness.md
- raw/wechat/2026-04-10-AI-Harness到底是个啥.md

**更新**：4个页面
- wiki/entities/CLAUDE.md — 追加 Harness"实时上下文"视角
- wiki/entities/Memory.md — 追加 Harness"会话记忆"双轨结构对比
- wiki/entities/多Agent协作.md — 追加 Harness"子智能体"权限沙箱模式
- index.md — 新增 AI Harness 实体索引和技术工具素材
