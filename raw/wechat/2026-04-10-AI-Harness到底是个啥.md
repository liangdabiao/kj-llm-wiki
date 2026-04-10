# AI Harness 到底是个啥？6 张图给你讲明白

> 原始链接：https://mp.weixin.qq.com/s/_2WQuf1CiBPboHLHDTbKFw
> 来源：微信公众号「dingtingli」（上海）
> 原作者：Sebastian Raschka 博士（原文翻译与解读）
> 原文链接：https://magazine.sebastianraschka.com/p/components-of-a-coding-agent
> 提取时间：2026-04-10
> 提取方式：agent-browser（skill 更新后，微信提取稳定可用）

---

最近，AI 圈有个很火的词叫 Harness（原意是马的"挽具"或"缰绳"）。

Sebastian Raschka 博士亲手编写了一个极简版的 Harness 框架 Coding Agent，并在实践中提炼出了 Harness 的 6 大核心组件。

## LLM、Agent、Harness 啥关系？

千万别把大语言模型（LLM）和智能体（Agent）画等号。

- **大模型（LLM）**：汽车的"发动机"。早期 GPT-3、GPT-4，核心能力是"文字接龙"。
- **推理模型（Reasoning Model）**：带涡轮增压的超级发动机。在开口说话前，会在脑子里先打草稿、自我验证（Thinking 过程）。
- **Agent（智能体）**：汽车的"自动驾驶系统"。Agent 是一个循环（Loop），当你说"帮我修个 Bug"，它会自己决策：第一步看哪段代码，第二步用什么工具，报错了怎么纠正。
- **Harness（框架）**：围绕发动机和司机打造的"汽车底盘、方向盘和仪表盘"。没有它，Agent 无法与真实世界交互。它负责帮模型读取本地文件、运行终端命令、管理各种工具。

## 解剖 Harness 的六大核心组件

### 1. 实时上下文

当你下达指令的瞬间，Harness 会在后台迅速扫描代码库收集"情报"：项目类型、文件目录排布、最新的代码提交记录等。随后自动生成一份简明的工作区摘要，连同你的指令一起打包递给大模型。

### 2. 提示词缓存

对信息进行"干湿分离"：
- **稳定前缀（Stable Prefix）**：不常变动的信息（Agent 人设、系统指令、工具列表、项目概况）。被系统缓存。
- **动态状态（Session State）**：最新聊天记录、AI 短期记忆、当前指令。每次对话只重新计算这部分。

### 3. 工具

Harness 预设"工具箱"：查看文件、读取文件、执行终端命令、修改代码。同时配备安全检查：工具合法性、参数格式、高危操作需授权、工作区路径限制。

### 4. 上下文管理

防止 Context Bloat（上下文膨胀）：
- **暴力裁剪（Truncation）**：过长日志/文档强制截断
- **去重与摘要（Deduplication & Summarization）**：合并重复读取记录，浓缩历史为摘要

### 5. 会话记忆 (Session Memory)

双轨记忆结构：
- **完整对话记录（Full Log）**：一字不落记录在硬盘，用于"留底"和重建提示词
- **工作记忆（Working Memory）**：精简版，只记录当前任务关键情报，不断擦除更新

### 6. 子智能体 (Subagents)

主 Agent 学会"当老板"，动态召唤子智能体处理边缘问题。子智能体继承部分上下文但权限被严格限制（只读模式或受限沙箱），防止无限套娃。

## 总结

真正能让大模型从"聊天玩具"蜕变成"生产力工具"的，正是外面这层看不见、摸不着的 Harness 系统。它补足了大模型的短板，赋予了 AI 视野、记忆、手脚以及团队协作的能力。

Mini Coding Agent: https://github.com/rasbt/mini-coding-agent
