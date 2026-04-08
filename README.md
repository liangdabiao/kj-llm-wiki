# llm-wiki

> AI 驱动的个人知识库构建系统。你提供素材，AI 完成所有的整理、链接和维护工作。

基于 [Karpathy 的 llm-wiki 方法论](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)：知识被**编译一次，持续维护**，而不是每次查询都从原始文档重新推导。

特别感谢佬友：https://linux.do/

## 核心思路

传统 RAG 的问题：每次问问题，AI 都要从头阅读原始文件，没有积累。

llm-wiki 的做法：把碎片化的信息（网页、公众号、推文、PDF、笔记）整理成互相链接的 wiki 页面。随着素材增加，知识库自己长出来——实体之间产生关联，主题自动汇聚，矛盾主动浮现。

**你负责**：喂素材、提问、判断价值。
**AI 负责**：提取要点、创建实体页/主题页、维护交叉引用、检测矛盾、生成图谱。

## 工作流一览

| 你说的话 | AI 做的事 |
|---------|----------|
| "帮我初始化一个知识库" | 创建目录结构和模板 |
| 给一个链接或文件 | 提取内容，生成摘要、实体页、主题页 |
| 给一个文件夹路径 | 批量消化所有文件 |
| "关于 XX" / "XX 是什么" | 搜索知识库，综合回答 |
| "深度分析 XX" / "综述 XX" | 跨素材生成深度报告 |
| "检查知识库" | 检测孤立页面、断链、矛盾信息 |
| "画个知识图谱" | 生成 Mermaid 关系图 |

## 支持的素材来源

| 来源 | 提取方式 | 备注 |
|------|---------|------|
| 网页文章 | 自动（baoyu-url-to-markdown） | 需要 Chrome 调试模式 |
| 微信公众号 | 自动（wechat-article-to-markdown） | 需要 `uv` |
| X / Twitter | 自动（baoyu-url-to-markdown） | 需要 Chrome + 登录 |
| YouTube | 自动（youtube-transcript） | 需要 `uv` |
| 知乎 | 自动 / 手动粘贴 | |
| PDF / Markdown / 文本 | 直接读取 | 无需额外依赖 |
| 小红书 | 手动粘贴 | 暂不支持自动提取 |

自动提取失败时，所有来源都可以回退到手动粘贴，核心流程不中断。

## 知识库长什么样

```
你的知识库/
├── raw/                    # 原始素材（AI 不修改）
│   ├── articles/           # 网页文章
│   ├── tweets/             # X/Twitter
│   ├── wechat/             # 微信公众号
│   ├── xiaohongshu/        # 小红书
│   ├── zhihu/              # 知乎
│   ├── pdfs/               # PDF
│   └── notes/              # 笔记 / 粘贴文本
├── wiki/                   # AI 生成的知识库（主体）
│   ├── entities/           # 实体页（人物、工具、概念）
│   ├── topics/             # 主题页（知识领域）
│   ├── sources/            # 素材摘要页
│   ├── comparisons/        # 对比分析
│   └── synthesis/          # 深度综合报告
├── index.md                # 索引
├── log.md                  # 操作日志
└── .wiki-schema.md         # 配置（人机共同维护）
```

所有内容是本地 Markdown 文件，用 Obsidian 打开就能看到双向链接图谱。

## 安装

### 一句话安装

把仓库链接交给 agent，让它自己跑：

```bash
bash install.sh --platform claude    # Claude Code
bash install.sh --platform codex      # Codex
bash install.sh --platform openclaw   # OpenClaw
```

### 安装位置

| 平台 | 路径 |
|------|------|
| Claude Code | `~/.claude/skills/llm-wiki` |
| Codex | `~/.codex/skills/llm-wiki` |
| OpenClaw | `~/.openclaw/skills/llm-wiki` |

### 前置条件

安装器会自动检查并提示，以下是各可选能力需要的依赖：

| 能力 | 需要 |
|------|------|
| 微信公众号提取 | [uv](https://docs.astral.sh/uv/)（Python 包管理器） |
| YouTube 字幕 | `uv` |
| 网页 / X / Twitter 提取 | Chrome 调试模式（`--remote-debugging-port=9222`） |
| Node 依赖（网页提取） | `bun` 或 `npm` 二选一 |

**PDF、本地文件、纯文本粘贴不需要任何额外依赖**，开箱即用。

## 内容处理分级

| 素材长度 | 处理方式 | 生成内容 |
|---------|---------|---------|
| > 1000 字 | 完整处理 | 摘要页 + 实体页 + 主题页 + 更新索引 |
| <= 1000 字 | 简化处理 | 摘要页 + 关键概念标记 |

## 多知识库支持

在工作目录执行 ingest/query/lint 时，会先检查当前目录是否有 `.wiki-schema.md`。如果有，直接用当前目录作为知识库。如果没有，回退到 `~/.llm-wiki-path` 记录的路径。支持同时维护多个知识库。

## 双语支持

初始化时选择语言（中文 / English），之后所有 AI 输出和新生成的 wiki 内容都按所选语言生成。

## 项目结构

```
llm-wiki-skill/
├── SKILL.md                    # 核心能力定义和工作流规范
├── install.sh                  # 统一安装器
├── setup.sh                    # 兼容旧入口（已废弃）
├── scripts/
│   ├── source-registry.sh      # 来源总表读取与 URL/文件路由
│   ├── source-registry.tsv     # 来源定义（11 种来源）
│   ├── adapter-state.sh        # 外挂状态检测（5 种状态）
│   ├── init-wiki.sh            # 知识库初始化
│   ├── wiki-compat.sh          # 旧知识库兼容
│   └── shared-config.sh        # 共享配置
├── templates/                  # 页面模板（中英双语）
├── deps/                       # 打包的依赖 skill
│   ├── baoyu-url-to-markdown/  # 网页/X/知乎提取
│   └── youtube-transcript/     # YouTube 字幕
├── tests/
│   ├── regression.sh           # 全局回归测试
│   └── adapter-state.sh        # 适配器状态测试
├── platforms/                  # 各平台入口文件
│   ├── claude/
│   ├── codex/
│   └── openclaw/
└── docs/                       # 设计文档与计划
```

## 致谢

核心方法论：[Andrej Karpathy](https://karpathy.ai/) — [llm-wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

集成的开源项目：

- [baoyu-url-to-markdown](https://github.com/JimLiu/baoyu-skills) by JimLiu — 网页/X/知乎内容提取
- [wechat-article-to-markdown](https://github.com/jackwener/wechat-article-to-markdown) — 微信公众号提取
- youtube-transcript — YouTube 字幕提取

## 当前知识库

本仓库同时也是一个正在运行的知识库（主题：AI 技术学习笔记），包含 OpenClaw 生态、跨境电商自动化、智能客服等内容。

### 知识库结构

```
D:\kllm-wiki/
├── raw/                    # 原始素材（29 篇，AI 不修改）
│   ├── articles/           # 网页文章
│   ├── wechat/             # 微信公众号
│   └── ...
├── wiki/                   # AI 生成的知识库（63+ 页）
│   ├── entities/           # 实体页（30 个：人物、工具、概念）
│   ├── topics/             # 主题页（4 个：知识领域）
│   ├── sources/            # 素材摘要（28 篇）
│   ├── comparisons/        # 对比分析
│   └── synthesis/          # 深度综合报告
├── index.md                # 索引
├── log.md                  # 操作日志
└── .wiki-schema.md         # 知识库配置
```

### 如何使用知识库

本知识库通过 llm-wiki skill 驱动，在 Claude Code 中使用。核心工作流：

| 你说的话 | AI 做的事 |
|---------|----------|
| 给一个链接或文件路径 | 提取内容，生成摘要页、实体页、主题页，更新索引 |
| "关于 XX"、"查询 XX" | 搜索 wiki 目录，综合回答并标注来源 |
| "深度分析 XX"、"综述 XX" | 跨素材生成深度报告，保存到 `wiki/synthesis/` |
| "检查知识库" | 检测孤立页面、断链、矛盾信息 |
| "知识库状态" | 统计素材和页面数量、展示最近活动 |
| "画个知识图谱" | 生成 Mermaid 关系图 |

**日常用法**：直接在对话中给链接或文件，AI 会自动消化并整理到知识库中。也可以用 Obsidian 打开本目录，实时查看双向链接图谱。

---

## 静态站点构建

### build-site.js — Markdown 转 HTML 站点

`scripts/build-site.js` 将 `wiki/` 下的 Markdown 文件转换为完整的静态 HTML 站点，输出到 `docs/` 目录。

**核心功能**：

- Markdown → HTML 转换（基于 marked）
- `[[双向链接]]` 自动转换为可点击链接
- Mermaid 图表渲染
- 反向链接索引（每个页面底部展示"谁链接到了这里"）
- 搜索功能（前端实时搜索）
- 响应式布局（移动端适配）
- 自动分类索引（实体/主题/素材/对比/综合）

**使用方法**：

```bash
# 构建
node scripts/build-site.js

# 本地预览
npx serve docs

# 快速更新（一行搞定）
node scripts/build-site.js && git add docs/ wiki/ && git commit -m "update: 更新知识库" && git push
```

**输出结构**：

```
docs/
├── index.html              # 首页（统计 + 分类索引）
├── css/style.css           # 样式
├── js/main.js              # 搜索和交互
└── wiki/
    ├── entities/           # 实体页 HTML
    ├── topics/             # 主题页 HTML
    ├── sources/            # 素材页 HTML
    └── synthesis/          # 综合报告 HTML
```

**部署流程**：`wiki/*.md` → `build-site.js` → `docs/*.html` → 推送 GitHub → Cloudflare Pages 自动部署（约 30 秒）。

**依赖**：`marked` 和 `glob`（首次运行自动安装，无需手动处理）。

### make.md — 构建说明与自动化方案

`make.md` 记录了站点的构建流程、更新原理和自动化配置方案。

**内容包括**：

- **更新原理**：解释了从 Markdown 源文件到线上站点的完整链路（md → 脚本 → HTML → GitHub → Cloudflare）
- **操作步骤**：新增文章、修改文章后的具体命令
- **GitHub Actions 自动化**：提供了 `.github/workflows/deploy.yml` 配置，当 `wiki/` 目录有更新时自动触发构建和部署
- **核心原则**：`wiki/` 是人类可读的源文件，`docs/` 是构建输出，两者通过 `build-site.js` 桥接

---

## License

MIT
