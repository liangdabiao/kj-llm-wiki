# llm-wiki

> AI 驱动的个人知识库构建系统。你提供素材，AI 完成所有的整理、链接和维护工作。

基于 [Karpathy 的 llm-wiki 方法论](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)：知识被**编译一次，持续维护**，而不是每次查询都从原始文档重新推导。

特别感谢佬友：https://linux.do/

## 核心思路

传统 RAG 的问题：每次问问题，AI 都要从头阅读原始文件，没有积累。

llm-wiki 的做法：把碎片化的信息（网页、公众号、推文、PDF、笔记）整理成互相链接的 wiki 页面。随着素材增加，知识库自己长出来——实体之间产生关联，主题自动汇聚，矛盾主动浮现。

**你负责**：喂素材、提问、判断价值。
**AI 负责**：提取要点、创建实体页/主题页、维护交叉引用、检测矛盾、生成图谱。

## 如何使用

把资料（链接、文件、文本）扔给 AI，AI 自动整理成互相链接的 wiki 页面。有问题直接问 AI，AI 从知识库中检索并给出带引述的深度解答。

```
有资料 → 丢给 AI → AI 整理成 wiki 页面（摘要、实体、主题、交叉引用）
有疑问 → 问 AI → AI 从 wiki 检索，综合多篇素材回答，并继续生成新页面
```

| 你做的 | AI 做的 |
|-------|--------|
| 给链接 / 文件 / 粘贴文本 | 提取内容，生成摘要页、实体页、主题页 |
| "关于 XX"、"查询 XX" | 搜索知识库，综合回答并标注来源 |
| "深度分析 XX"、"综述 XX" | 跨素材生成深度报告，保存到 `wiki/synthesis/` |
| "检查知识库" | 检测孤立页面、断链、矛盾信息 |
| "知识库状态" | 统计素材和页面数量 |
| "画个知识图谱" | 生成 Mermaid 关系图 |

### 支持的素材来源

| 来源 | 提取方式 | 备注 |
|------|---------|------|
| 网页文章 | 自动（baoyu-url-to-markdown） | 需要 Chrome 调试模式 |
| 微信公众号 | 自动（wechat-article-to-markdown） | 需要 `uv` |
| X / Twitter | 自动（baoyu-url-to-markdown） | 需要 Chrome + 登录 |
| YouTube | 自动（youtube-transcript） | 需要 `uv` |
| PDF / Markdown / 文本 | 直接读取 | 无需额外依赖 |
| 小红书 / 知乎 | 手动粘贴 | 暂不支持自动提取 |

自动提取失败时，所有来源都可以回退到手动粘贴，核心流程不中断。

## 一键部署为在线 Wiki 网站

运行构建命令，自动将 `wiki/` 下的 Markdown 转为静态 HTML 站点：

```bash
node scripts/build-site.js
```

输出到 `docs/` 目录，然后推送到 GitHub，用 **Cloudflare Pages** 部署即可上线：

![Cloudflare Pages 部署](upload://1JVHXzPwcyMSI161yGD9QbkdEoF.png)

**在线 Demo**：https://kjwiki.348349.xyz/

### 部署步骤

1. 将本仓库推送到 GitHub
2. 在 [Cloudflare Pages](https://pages.cloudflare.com/) 创建项目，连接 GitHub 仓库
3. 构建命令设为 `node scripts/build-site.js`，输出目录设为 `docs`
4. 之后每次 `git push`，Cloudflare 自动重新部署（约 30 秒）

### 站点功能

- `[[双向链接]]` 自动转换为可点击链接，断链标橙
- 每个页面底部展示反向链接（谁链接到了这里）
- 前端实时搜索
- Mermaid 图表渲染
- 响应式布局（手机适配）
- 自动按实体 / 主题 / 素材 / 综合分类索引

详细构建说明见 [make.md](make.md)。

## 知识库结构

```
wiki/
├── entities/           # 实体页（人物、工具、概念）
├── topics/             # 主题页（知识领域）
├── sources/            # 素材摘要页
├── comparisons/        # 对比分析
└── synthesis/          # 深度综合报告
```

所有内容是本地 Markdown 文件，用 [Obsidian](https://obsidian.md/) 打开本目录可以实时查看双向链接图谱。

## 致谢

核心方法论：[Andrej Karpathy](https://karpathy.ai/) — [llm-wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

---

## License

MIT
