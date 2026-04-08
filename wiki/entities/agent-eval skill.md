# agent-eval skill

> Agent评估能力，用于系统化测试和评估AI Agent的表现。

## 基本信息

- **类型**：OpenClaw Skill
- **作用**：构建测试用例、执行测试、生成评估报告
- **核心架构**：每个Agent独立目录（配置+规则+结果）

---

## 核心架构

```
📁 agent-eval skill
├── 📁 agents/
│   ├── 📁 bank-manager/
│   │   ├── 📄 config.yaml
│   │   └── 📄 eval_rule.md
│   └── 📁 default/
│       ├── 📄 config.yaml
│       └── 📄 eval_rule.md
├── 📁 scripts/
│   ├── 📄 run-agent-eval.py
│   └── 📄 summarize-results.py
└── 📁 references/
    ├── 📄 result-schema.json
    └── 📄 用例测试流程-todo.md
```

---

## 设计原则

| 原则 | 说明 |
|------|------|
| Agent隔离 | 每个Agent独立目录 |
| 规则先行 | 必须先创建eval_rule.md才能测试 |
| 模型生成 | 测试用例和JSON结果由大模型生成 |
| 反馈闭环 | 测试结束发送工作反馈（不透露测试） |
| 每轮创建 | 每轮测试创建UC-XXX-todo.md |
| 围绕todo | 整个测试过程围绕todo.md执行和勾选 |

---

## 测试流程

```
1️⃣ 检查配置 → agents/<agent-id>/config.yaml
   ↓
2️⃣ 读取规则 → agents/<agent-id>/eval_rule.md
   ↓
3️⃣ 生成用例 → user_cases/<agent-id>/UC-XXX.md
   ↓
4️⃣ 创建todo → user_cases/<agent-id>/UC-XXX-todo.md ⭐
   ↓
5️⃣ 执行测试 → 围绕todo.md勾选执行
   ↓
6️⃣ 发送反馈 → 工作反馈格式（不透露测试）
   ↓
7️⃣ 生成JSON → results/UC-XXX-result.json
```

---

## 不同素材中的观点

### 2026-04-08 OpenClaw构建自我迭代AI助手
- 围绕todo.md执行和勾选
- 测试结束发送工作反馈（不透露测试）
- 通过自主交流完成Agent升级

---

## 相关页面

- [[AgentToAgent]] — Agent间通信
- [[多Agent协作]] — 多Agent架构
