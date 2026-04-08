跨境电商必备：用 OpenClaw 搭建 WhatsApp 智能客服机器人

   
   
     
原创
     
灵小九
   
   
     ⏱️ 预计阅读 14 分钟    
 
凌晨 3 点，你的美国客户在 WhatsApp 上发来询盘：「这个产品有库存吗？多久能发货？」

而你在睡觉。等你早上醒来回复，客户已经去找了另一家供应商。

这是跨境电商卖家的日常痛点：时差导致响应延迟，白白流失订单。

这篇文章，我将带你从零开始，用 OpenClaw 搭建一个 7×24 小时在线的 WhatsApp 智能客服机器人，实现多语言自动回复、订单状态查询，用极低成本解决跨境客服难题。

━━━━━━━━

一、为什么选择 OpenClaw？
OpenClaw 是一个开源的 AI 智能体网关框架，它可以把 AI 连接到各种聊天应用。

对于跨境电商卖家，OpenClaw 提供了三大核心能力：

1. 多渠道 Gateway 支持 WhatsApp

通过单个网关进程连接 WhatsApp、Telegram、Discord、飞书等 30+ 即时通讯工具。

2. 自动回复 + 多语言支持

接入大模型（GPT、Claude、Gemini 等），AI 可以理解客户意图并自动回复，支持 100+ 种语言。

3. 订单状态查询（对接 ERP API）

通过 Skills 扩展，AI 可以调用你的 ERP API，实时查询订单状态、库存信息、物流轨迹等。

━━━━━━━━

二、环境准备
硬件选择
方案一：Mac mini（M4 芯片 + 16GB 内存），适合家庭办公、长期运行

方案二：云服务器（腾讯云/阿里云，2核4G 起步），适合无本地设备

方案三：Windows/Linux PC（8GB 内存以上），适合已有设备利用

软件环境
需要准备以下环境：

1. Node.js 18+

2. OpenClaw CLI

3. WhatsApp Business 账号

4. AI 模型 API Key（OpenAI / Anthropic / Google）

安装 OpenClaw：

npm install -g openclaw@latest
openclaw --version
运行新手引导：

openclaw onboard --install-daemon
按照提示依次配置：选择 AI 服务商和模型 → 配置通讯渠道 → 设置管理员密码

━━━━━━━━

三、配对 WhatsApp 渠道
配置 WhatsApp 渠道
运行配对命令：

openclaw channels login
# 选择 WhatsApp，扫描二维码完成配对
配对成功后，OpenClaw 会自动保存会话信息。

配置访问控制
为了安全，建议配置白名单。编辑配置文件：

nano ~/.openclaw/openclaw.json
配置示例：

{
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"],
      "groups": { "*": { "requireMention": false } }
    }
  }
}
配置说明：

allowFrom：允许发送消息的手机号白名单

requireMention：群聊中是否需要 @ 提及才响应

━━━━━━━━

四、启动 Gateway 网关
配置完成后，启动 Gateway 网关：

# 启动网关（默认端口 18789）
openclaw gateway --port 18789

# 后台运行（推荐）
openclaw gateway --port 18789 --daemon
网关启动后，可以访问 Web 控制界面：

本地地址：http://127.0.0.1:18789/

验证 WhatsApp 连接：在 Web 控制界面中，检查 WhatsApp 渠道状态是否显示为「已连接」。

━━━━━━━━

五、配置智能客服提示词
为了让 AI 更好地扮演客服角色，我们需要配置专业的提示词。

编辑 SOUL.md
SOUL.md 是 OpenClaw 的「人格配置文件」：

nano ~/.openclaw/workspace/SOUL.md
智能客服提示词示例：

# SOUL.md - 智能客服人格

## 身份

你是「灵小九」，一个专业、友好、高效的跨境电商智能客服。

## 核心能力

1. 产品咨询：回答产品规格、价格、库存等问题
2. 订单查询：查询订单状态、物流信息、预计到达时间
3. 售后支持：处理退换货、退款、投诉等问题
4. 多语言服务：支持中文、英文、西班牙语、法语等

## 行为准则

1. 始终保持专业、友好的语气
2. 回答简洁明了，避免冗长
3. 不确定的问题，诚实说明并提供人工客服转接
4. 涉及价格、库存等敏感信息，先核实再回复

## 回复模板

欢迎语：
您好！我是灵小九，很高兴为您服务。请问有什么可以帮助您的？

订单查询：
您的订单 {{订单号}} 目前状态为 {{状态}}，预计 {{日期}} 送达。

人工转接：
这个问题需要人工客服处理，我帮您转接。请稍候...

## 限制

- 不承诺具体发货时间（除非已确认库存）
- 不处理支付相关操作（引导客户到官网）
- 不透露内部定价策略
重载配置
编辑完成后，重启 Gateway：

openclaw gateway restart
━━━━━━━━

六、对接 ERP API 实现订单查询
智能客服的核心价值之一，是能让客户自助查询订单状态。

创建订单查询 Skill
创建 Skill 目录：

mkdir -p ~/.openclaw/skills/order-query
cd ~/.openclaw/skills/order-query
创建 SKILL.md 配置文件：

# 订单查询 Skill

## 描述
查询订单状态、物流信息、预计到达时间

## 触发词
订单、物流、查询、追踪、订单号、tracking

## 使用方式
用户提供订单号，调用 ERP API 查询并返回结果
创建查询脚本 query_order.py：

#!/usr/bin/env python3
"""订单查询脚本"""

import json
import sys
import requests

# ERP API 配置
ERP_API_URL = "https://your-erp.com/api/v1/orders"
ERP_API_KEY = "your-api-key"

def query_order(order_id):
    """查询订单信息"""
    try:
        headers = {
            "Authorization": f"Bearer {ERP_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.get(
            f"{ERP_API_URL}/{order_id}",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            return format_order_info(data)
        elif response.status_code == 404:
            return f"未找到订单 {order_id}，请检查订单号是否正确。"
        else:
            return f"查询失败，请稍后重试或联系人工客服。"

    except requests.Timeout:
        return "查询超时，请稍后重试。"
    except Exception as e:
        return f"系统错误，请联系人工客服。"

def format_order_info(data):
    """格式化订单信息"""
    order = data.get("order", {})
    status_map = {
        "pending": "待处理",
        "processing": "处理中",
        "shipped": "已发货",
        "delivered": "已送达",
        "cancelled": "已取消"
    }

    status = status_map.get(order.get("status"), order.get("status"))

    lines = [
        f"订单号：{order.get('id')}",
        f"状态：{status}",
        f"商品：{order.get('items', [{}])[0].get('name', '-')}",
    ]

    if order.get("tracking_number"):
        lines.append(f"快递单号：{order.get('tracking_number')}")

    return "\n".join(lines)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("请提供订单号")
    else:
        print(query_order(sys.argv[1]))
注册 Skill
openclaw skills add ~/.openclaw/skills/order-query
openclaw skills list
━━━━━━━━

七、配置多语言支持
跨境电商的客户来自全球各地，多语言支持是必备能力。

方案一：使用多语言模型
现代大模型（GPT-4、Claude 3.5）本身就支持 100+ 种语言。在提示词中说明：

## 多语言支持

你可以使用用户使用的语言进行回复。
- 用户用中文提问，用中文回复
- 用户用英文提问，用英文回复
- 用户用西班牙语提问，用西班牙语回复

始终保持语言一致性，不要主动切换语言。
━━━━━━━━

八、设置自动欢迎语
提升客户体验的关键是「快速响应」和「清晰引导」。

配置自动欢迎功能：

{
  "automation": {
    "welcome": {
      "enabled": true,
      "message": "您好！我是灵小九，您的专属智能客服。\n\n请回复数字选择服务：\n1. 产品咨询\n2. 订单查询\n3. 售后服务\n4. 人工客服\n\n或直接描述您的问题，我会尽力帮助您！"
    }
  }
}
配置快捷命令映射：

{
  "commands": {
    "1": "产品咨询：请问您想了解哪款产品？",
    "2": "订单查询：请提供您的订单号。",
    "3": "售后服务：请问您遇到了什么问题？",
    "4": "正在为您转接人工客服，请稍候..."
  }
}
━━━━━━━━

九、常见问题解决
Q1：WhatsApp 连接不稳定？
解决方案：

1. 使用稳定网络，建议配置代理

2. 确保 OpenClaw 设备上的 WhatsApp 保持在线

3. 控制发送频率，避免短时间内大量消息

Q2：AI 回复不准确？
解决方案：

1. 优化 SOUL.md，增加更多场景示例

2. 升级到更强的模型（如 GPT-4、Claude 3.5）

3. 在提示词中添加产品知识库引用

Q3：订单查询失败？
解决方案：

1. 检查 API URL 和 Key 是否正确

2. 测试 API 是否可直接访问

3. 确认 API 有订单查询权限

━━━━━━━━

十、成本估算
搭建这样一个 WhatsApp 智能客服系统，成本是多少？

硬件成本
方案一：Mac mini M4，约 3000-4000 元，可运行 5 年以上

方案二：云服务器（2核4G），约 100-200 元/月

软件成本
OpenClaw：开源免费

AI 模型 API：
- GPT-4 Turbo：约 0.01-0.03 元/次对话
- Claude 3.5 Sonnet：约 0.008-0.02 元/次对话
- 国产模型：约 0.005-0.01 元/次对话

估算：每天 100 次对话，月成本约 30-100 元

对比人工客服
一个全职客服月薪 5000-8000 元，每天工作 8 小时。

AI 客服 7×24 小时在线，成本仅为人工的 1/50-1/100。

━━━━━━━━

总结
这篇文章，我们从零搭建了一个 WhatsApp 智能客服机器人。

核心技术栈：

1. OpenClaw Gateway：多渠道消息网关

2. 大模型 API：GPT-4 / Claude 3.5 / Gemini

3. ERP API 对接：订单状态查询

4. Skill 扩展：自定义业务逻辑

5. 多语言支持：100+ 种语言自动识别

关键在于：开始行动。

不要让时差成为流失订单的原因。今天就动手，给你的跨境电商业务加一个 7×24 小时在线的智能客服。

━━━━━━━━

你在跨境电商客服中，遇到过哪些痛点？欢迎留言分享！


   
   
🐯 灵慧光智 Lumina AI

   
专注 AI 与智能体技术实践与分享，以轻量化、可落地的 AI 智能体方案赋能个人与企业。

 
   
   
📝 原创声明

   
本文为原创内容，欢迎转发朋友圈。如需转载，请在后台留言获取授权。

 
   
   
👇 关注公众号，每周干货不断

   公众号二维码    
长按识别二维码 · 永不失联

   
或微信搜索「灵慧光智 Lumina AI」关注

 




暂无评论