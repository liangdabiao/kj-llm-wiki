# workspace

> Agent工作区，包含Agent的所有配置文件、记忆文件和技能文件。

## 基本信息

- **类型**：目录结构
- **位置**：~/.openclaw/workspace-<agent-name>/
- **作用**：定义"这个Agent平时怎么干活"

---

## 核心文件

| 文件 | 职责 | 变更类型 |
|------|------|----------|
| `SOUL.md` | Agent身份和人设 | 人设变更、边界调整、工作方式优化 |
| `AGENTS.md` | 工作区规则 | 规范更新、流程优化、目录结构变更 |
| `USER.md` | 用户信息和偏好 | 用户反馈记录、偏好调整 |
| `MEMORY.md` | 长期记忆 | 重要事件、决策、学习总结 |
| `HEARTBEAT.md` | 心跳检查清单 | 检查项目更新、推送规则优化 |
| `agents/prompts/*.md` | Agent提示词 | 技能调整、任务变更 |

---

## 关键区别

> workspace里的文件，管的是"这个Agent平时怎么干活"
> openclaw.json里的配置，管的是"这个系统怎么把它跑起来"

---

## 多Agent工作区隔离

每个Agent必须有自己独立的Workspace：
- workspace-lead/ — 大总管工作区
- workspace-geo/ — GEO内容优化师工作区
- workspace-reddit/ — Reddit营销专家工作区
- workspace-tiktok/ — TikTok爆款编导工作区

voc-analyst的市场研报绝不能和reddit-spec的养号记录混在一个目录里。

---

## 不同素材中的观点

### 2026-04-08 龙虾
- workspace里的文件，管的是"这个Agent平时怎么干活"
- openclaw.json里的配置，管的是"这个系统怎么把它跑起来"

### 2026-04-08 用OpenClaw搭跨境电商团队
- 工作区物理隔离：每个Agent独立Workspace
- 公共技能放~/.openclaw/skills/，私有技能放Agent专属目录

---

## 相关页面

- [[SOUL.md]] — 人格配置
- [[AGENTS.md]] — 工作区规则
- [[多Agent协作]] — 多Agent架构
