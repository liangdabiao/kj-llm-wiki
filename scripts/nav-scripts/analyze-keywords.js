/**
 * analyze-keywords.js
 * 分析条目标题和描述中的关键词分布，辅助分类设计
 */
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'tools_all.json');
const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const entries = data.entries;

// 关键词频率统计（标题 + 描述）
const keywords = {};
const titleKeywords = {};

const techTerms = [
  'AI', 'LLM', 'GPT', 'Claude', 'OpenAI', 'ChatGPT', 'Gemini', 'DeepSeek',
  'RAG', 'Agent', 'Copilot', 'Cursor', 'Vibe Coding', 'Prompt',
  'Stable Diffusion', 'Midjourney', 'DALL-E', 'ComfyUI', 'Sora',
  'LangChain', 'LlamaIndex', 'Dify', 'Coze', 'Gpts', 'Flowise', 'n8n',
  'Python', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Node',
  'Docker', 'Kubernetes', 'AWS', '云服务',
  '知识库', '向量数据库', 'Embedding', '微调', 'Fine-tuning', 'LoRA',
  '多模态', '视频生成', '语音', 'TTS', 'ASR', 'OCR',
  '写作', '翻译', '编程', '代码', '开发', '设计', '绘画',
  '工具', '推荐', '教程', '实战', '指南', '入门', '合集', '清单',
  '飞书', 'Slack', 'Notion', '自动化', '工作流',
  '论文', '研究', '报告', '趋势', '行业',
  '创业', '商业', '产品', '增长', '营销',
  'Apple', 'Google', 'Microsoft', 'Meta', '字节', '百度', '阿里',
  'Sora', 'Kling', '可灵', 'Runway', 'Pika',
  'MCP', 'Function Calling', 'Tool Use',
  '数据', '分析', '可视化', 'BI',
  '安全', '隐私', '对齐', 'RLHF',
  '机器人', '自动驾驶', '具身智能', '机器人',
  '音乐', '音频', '3D', '游戏',
  '开源', '模型', '部署', '推理', '训练',
  'WordPress', '插件', '网站', 'SEO',
  'Claude Code', 'VS Code', 'IDE',
  '图表', 'PPT', '演示', '文档',
  '视频会议', '协作', '办公',
  '评测', '对比', '测评', '体验',
  '架构', '工程', 'DevOps', 'CI/CD',
  '创业', '副业', '赚钱', '自由职业',
  '教育', '学习', '课程', '培训',
  '面试', '求职', '招聘', '职业',
  '播客', 'Newsletter', '周刊', '社区',
  'Hook', '插件', '扩展', 'API',
  'vibe coding', 'AI编程', 'AI开发', 'AI写作', 'AI绘画', 'AI视频',
  'huggingface', 'Hugging Face',
  '机器人', 'Bot', 'chatbot',
  '商业模式', '应用案例', '落地',
  'AGI', 'ASI', '通用人工智能',
  'SaaS', 'PaaS', 'B2B', 'B2C',
  '笔记', '知识管理', '思维导图',
  'Markdown', '文档', 'wiki',
  '白皮书', '蓝皮书',
];

entries.forEach(e => {
  const text = (e.title + ' ' + (e.description || '')).toLowerCase();
  techTerms.forEach(term => {
    const termLower = term.toLowerCase();
    if (text.includes(termLower)) {
      keywords[term] = (keywords[term] || 0) + 1;
      // 标题中的关键词
      if (e.title.toLowerCase().includes(termLower)) {
        titleKeywords[term] = (titleKeywords[term] || 0) + 1;
      }
    }
  });
});

// 按频率排序
console.log('=== 关键词频率排名（标题+描述）===');
const sorted = Object.entries(keywords).sort((a, b) => b[1] - a[1]);
sorted.forEach(([kw, count], i) => {
  const titleCount = titleKeywords[kw] || 0;
  console.log(`  ${String(i + 1).padStart(3)}. ${kw.padEnd(25)} ${String(count).padStart(4)} 次 (标题: ${titleCount})`);
});

console.log(`\n总条目: ${entries.length}`);
console.log(`有日期的: ${entries.filter(e => e.date).length}`);
