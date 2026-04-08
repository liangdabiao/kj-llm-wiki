# Skills 深度报告

> 综合自 15+ 篇素材 | 生成日期：2026-04-08

## 背景概述

Skills 是 OpenClaw 智能体框架的核心扩展机制。本质上，每个 Skill 就是一段**操作说明文档**，教 Agent 如何使用某种能力——浏览网页、下载文件、抓取数据、操作飞书等。Skills 的设计理念是"不升级模型，只扩展能力"，让同一个 AI 模型通过不同 Skill 组合，胜任完全不同的工作场景。

截至 2026 年 4 月，ClawHub.ai 技能市场上已有 **10,000+** 个 Skill，涵盖跨境电商、数据分析、内容创作、客服、办公自动化等多个领域。（来源：[[ClawHub.ai]]、[[2026-04-08 最值得安装的8个Skill技能]]）

---

## 核心观点

### 1. Skills 不是越多越好

这是多篇素材中**出现频率最高、共识最强**的观点。

> "每个 Skill 都吃上下文，Agent 启动时要加载所有已安装 Skill 的描述和指令，装 20 个和装 5 个，光这部分就差了几千 token。上下文被占满了，核心推理能力反而下降。"
> — 来源：[[2026-04-08 最值得安装的8个Skill技能]]

> "skills 不是越多越好。一口气装几十个，结果工具互相干扰。"
> — 来源：[[2026-04-08 OpenClaw从新手到进阶]]

> "一个低质量 skill 可能会抢先执行，真正好用的工具反而调不到。"
> — 来源：[[2026-04-08 OpenClaw从新手到进阶]]

**共识结论**：围绕核心工作流，只装 **5-8 个**高频使用的 Skill。（来源：[[Skills]]）

### 2. 安装顺序：安全→基础→进阶→按需

多篇素材推荐分四阶段安装（来源：[[2026-04-08 最值得安装的8个Skill技能]]、[[Skills]]）：

| 阶段 | 定位 | 推荐 Skills |
|------|------|-------------|
| 第一阶段：安全打底 | 安装前必审 | [[Skill Vetter]] |
| 第二阶段：基础能力 | 联网搜索+浏览器 | tavily-search、[[last30days]]、agent-browser、summarize |
| 第三阶段：进阶优化 | 自我进化+自定义 | [[self-improving-agent]]、[[skill-creator]] |
| 第四阶段：按需选装 | 远程操控等 | [[Claude-to-IM-skill]] |

### 3. 层级隔离原则

> "公共技能放 ~/.openclaw/skills/（跨 Agent 调用不丢包），私有技能放 Agent 专属 skills 子目录（防止工具幻觉）。"
> — 来源：[[2026-04-08 用OpenClaw搭跨境电商团队]]、[[Skills]]

这个原则在多 Agent 协作场景中尤其重要——不同岗位的 Agent 不需要也不应该加载全部 Skill。

### 4. 安全是第一道关

> "ClawHub 上 10,000+ 个 Skill 鱼龙混杂，曾有人一次性发布 314 个全恶意 Skill（用户名 hightower6eu），套路是装完后让用户去陌生地址下载执行。"
> — 来源：[[2026-04-08 最值得安装的8个Skill技能]]、[[Skill Vetter]]

[[Skill Vetter]] 将 Skill 风险分为四级：低风险（笔记、天气）、中风险（文件操作、浏览器）、高风险（账号密码、交易）、极端风险（root 权限）。核心原则：**只从官方 ClawHub 安装，警惕第三方镜像站**。（来源：[[Skill Vetter]]）

---

## 不同视角对比

### 联网搜索：Tavily vs Brave vs Agent Reach vs searxng

| 维度 | tavily-search | Brave Search | Agent Reach | searxng |
|------|--------------|-------------|-------------|---------|
| 定位 | LLM 专用搜索 API | 高质量搜索 | 多平台聚合搜索 | 本地容器搜索 |
| 费用 | 月 1000 次免费 | 需海外信用卡 | 开源 | 开源（需 2 核 2G+ 服务器） |
| 覆盖平台 | 通用网页 | 通用网页 | 小红书/X/YouTube/Reddit/B 站 | 自建搜索引擎 |
| 来源 | [[2026-04-08 OpenClaw从新手到进阶]]、[[2026-04-08 给OpenClaw开天眼]] |

### 社区调研：last30days vs Perplexity

| 维度 | Perplexity | last30days |
|------|-----------|-----------|
| 数据源 | SEO 排名靠前的网页 | 社区真实参与度（Reddit 赞数、X 转发数等） |
| 回答的是 | "哪个网页 SEO 做得好" | "社区到底怎么看这件事" |
| 覆盖平台 | 通用网页 | Reddit、X、YouTube、HN、TikTok 等 10+ |
| 来源 | [[last30days]]、[[2026-04-08 最值得安装的8个Skill技能]] |

### 浏览器自动化：agent-browser vs browser-use vs playwright

| 维度 | agent-browser | browser-use | playwright-browser |
|------|--------------|-------------|-------------------|
| 方式 | 用户真实浏览器环境 | 视觉方式操作 | 传统脚本自动化 |
| 优势 | 保留登录态，不丢 cookie | 直观 | 稳定可控 |
| 劣势 | 需保持浏览器运行 | Token 消耗大 | 需要编程 |
| 来源 | [[2026-04-08 基于CC的浏览器自动化选型推荐]]、[[Skills]] |

---

## 知识脉络

### 按应用领域分类

#### 跨境电商 Skills（最大应用场景）

跨境电商是 Skill 生态中**内容最丰富**的领域，多篇素材从不同角度覆盖了七大核心技能领域（来源：[[2026-04-08 OpenClaw跨境电商必装技能]]、[[2026-04-08 跨境电商全部数据]]）：

| 领域 | 代表 Skills | 解决的问题 |
|------|------------|-----------|
| 店铺同步 | amazon-sync、temu-sync、shopee-sync、erp-connector | 多平台库存/订单自动同步 |
| 多语言客服 | cross-border-cs、multilingual-chat、amazon-cs-bot | 7×24 小时自动客服 |
| Listing 优化 | listing-optimizer、product-description-gen、seo-keyword-gen | 商品页面自动生成与 SEO |
| 广告监控 | ad-monitor、amazon-sp-optimizer、ad-roi-analyzer | ACOS/CTR/CVR 实时追踪 |
| 竞品监控 | competitor-tracker、price-watcher、review-scraper | 竞品价格/上新/差评监控 |
| 飞书办公 | feishu-reporter、daily-report-gen、alert-notifier | 自动汇报与告警推送 |
| 数据抓取 | WebFetch、Scrapling、Decodo Skill、Firecrawl MCP | 反爬穿透与结构化采集 |

实战案例中最典型的模式是"**数据抓取→AI 分析→飞书决策闭环**"（来源：[[2026-04-08 跨境电商skill]]）：
- Amazon 竞品价格监控：Decodo + Firecrawl + 每日 2 次抓取 + AI 分析 + 飞书回写，定价响应从天级→小时级
- 一人公司 28 个 Agent 矩阵：TikTok Shop + Shopify + Google/Meta Ads 全自动化

#### 飞书集成 Skills（官方内置 8 个）

OpenClaw 内置了完整的飞书集成（来源：[[2026-04-08 飞书系列Skills]]）：

1. **feishu-bitable** — 多维表格（创建/查询/编辑记录）
2. **feishu-calendar** — 日历与日程
3. **feishu-create-doc / fetch-doc / update-doc** — 云文档三件套
4. **feishu-im-read** — IM 消息读取（群聊/单聊/跨会话搜索）
5. **feishu-task** — 任务管理
6. **feishu-troubleshoot** — 故障诊断
7. **feishu-channel-rules** — 频道规则控制

#### 安全与自我进化类 Skills

| Skill | 作用 | 特点 |
|-------|------|------|
| [[Skill Vetter]] | 安装前扫描恶意行为 | 按低/中/高/极端四级评估 |
| [[self-improving-agent]] | 捕获错误+用户纠正，持续进化 | ClawHub 热门榜第一，46k+ installs |
| [[skill-creator]] | 创建自定义 Skill | Anthropic 官方出品 |
| [[agent-eval skill]] | 系统化测试 Agent 表现 | 围绕 todo.md 执行和勾选 |
| [[last30days]] | 海外社区情绪追踪 | Lyft 联合创始人作品，8000+ Star |

#### 远程操控类

[[Claude-to-IM-skill]] 通过飞书桥接本地 Claude Code 进程，实现手机远程操控。核心优势：不需要公网 IP、不需要内网穿透、防火墙后面也能用。（来源：[[Claude-to-IM-skill]]）

### 按学习阶段分类

来源：[[2026-04-08 目录导航]]

| 阶段 | 时间 | Skill 相关内容 |
|------|------|---------------|
| 第一阶段：工作规范 | 30-60 分钟 | 编写 AGENTS.md，不涉及 Skill |
| 第二阶段：记忆系统 | 60-120 分钟 | 开启 memoryFlush，配置自动维护 |
| 第三阶段：高级功能 | 120-240 分钟 | **开发自定义 Skill 扩展功能** |
| 第四阶段：性能调优 | 1-2 天 | 优化 token 使用效率（与 Skill 数量直接相关） |

---

## 尚待解决的问题

1. **Skill 之间冲突的具体检测机制**：多篇素材提到"功能相近的 Skill 会互相打架"，但未详细说明如何诊断和解决具体冲突
2. **自定义 Skill 的最佳实践规范**：skill-creator 提供了创建工具，但缺少从零设计一个高质量 Skill 的方法论（何时该做成 Skill vs 何时该写在 AGENTS.md 里）
3. **Skill 性能基准测试**：没有找到对不同 Skill 的 token 消耗、响应速度、准确率的系统对比数据
4. **企业级 Skill 管理方案**：当团队多人使用时，如何统一管理公共 Skill 版本、权限隔离、更新同步

---

## 相关页面

### 实体页
- [[Skills]] — 技能体系总览
- [[ClawHub.ai]] — 技能市场
- [[Skill Vetter]] — 安全审查工具
- [[self-improving-agent]] — Agent 自我进化
- [[skill-creator]] — 自定义 Skill 创建
- [[last30days]] — 社区情绪追踪
- [[Claude-to-IM-skill]] — 远程操控
- [[agent-eval skill]] — Agent 评估

### 素材页
- [[2026-04-08 最值得安装的8个Skill技能]] — 顾小北精选推荐
- [[2026-04-08 OpenClaw从新手到进阶]] — 技能推荐与安装原则
- [[2026-04-08 OpenClaw跨境电商必装技能]] — 七大领域技能目录
- [[2026-04-08 跨境电商skill]] — 爬虫 Skills 实战案例
- [[2026-04-08 跨境电商全部数据]] — 技能全量汇总
- [[2026-04-08 飞书系列Skills]] — 8 个飞书 Skill 详解
- [[2026-04-08 给OpenClaw开天眼]] — 10 个爬虫场景方案
- [[2026-04-08 用OpenClaw搭跨境电商团队]] — 多 Agent 中的 Skill 隔离
- [[2026-04-08 目录导航]] — 学习路径中的 Skill 开发阶段
- [[2026-04-08 OpenClaw构建自我迭代AI助手]] — agent-eval skill 详解

### 主题页
- [[OpenClaw生态]] — 技能生态全景
- [[跨境电商AI自动化]] — 跨境电商 Skill 应用
