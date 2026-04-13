/**
 * dedup-categorize.js
 * 对提取的条目进行去重、分类，输出 tools_deduped.json
 */
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'tools_all.json');
const OUTPUT = path.join(__dirname, '..', 'tools_deduped.json');

function main() {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  let entries = data.entries;

  console.log(`输入: ${entries.length} 条目\n`);

  // ===== 1. 过滤掉归档链接等无效条目 =====
  const excludeTokens = [
    'BboNwLapXiy2ZwkK3ficBd98nYd', // 2024 年历史更新（归档）
    'DyF5w3btkirb4Nk7iWWcuK6Nn0c', // 2023 年历史更新（归档）
  ];
  entries = entries.filter(e => !excludeTokens.includes(e.token));
  console.log(`过滤归档链接后: ${entries.length}`);

  // ===== 2. 分类体系 =====
  // 基于关键词分析的分类，按优先级从高到低排列
  const categories = [
    {
      name: 'OpenClaw & 小龙虾',
      slug: 'openclaw',
      icon: '🦞',
      priority: 21,
      keywords: [
        { term: 'openclaw', score: 25 },
        { term: 'clawdbot', score: 25 },
        { term: '小龙虾', score: 25 },
      ]
    },
    {
      name: 'Claude & Anthropic',
      slug: 'claude-anthropic',
      icon: '🟠',
      priority: 20,
      keywords: [
        { term: 'claude code', score: 20 },
        { term: 'claude', score: 18 },
        { term: 'anthropic', score: 20 },
        { term: 'cowork', score: 15 },
      ]
    },
    {
      name: 'AI 编程 & Vibe Coding',
      slug: 'ai-programming',
      icon: '💻',
      priority: 18,
      keywords: [
        { term: 'vibe coding', score: 20 },
        { term: 'cursor', score: 15 },
        { term: 'copilot', score: 15 },
        { term: 'ai编程', score: 18 },
        { term: 'ai开发', score: 15 },
        { term: 'claude code', score: 12 },
        { term: 'ide', score: 10 },
        { term: 'vs code', score: 8 },
        { term: 'hook', score: 12 },
        { term: '代码', score: 8 },
        { term: '编程', score: 10 },
        { term: '开发', score: 6 },
      ]
    },
    {
      name: 'Agent & 自动化',
      slug: 'agent-automation',
      icon: '🤖',
      priority: 17,
      keywords: [
        { term: 'agent', score: 18 },
        { term: 'mcp', score: 20 },
        { term: 'function calling', score: 18 },
        { term: 'tool use', score: 15 },
        { term: 'n8n', score: 18 },
        { term: 'dify', score: 18 },
        { term: 'coze', score: 18 },
        { term: '自动化', score: 15 },
        { term: '工作流', score: 12 },
        { term: 'bot', score: 12 },
        { term: 'chatbot', score: 15 },
        { term: '飞书', score: 10 },
      ]
    },
    {
      name: '大模型 & 基础设施',
      slug: 'llm-infra',
      icon: '🧠',
      priority: 16,
      keywords: [
        { term: 'llm', score: 18 },
        { term: 'rag', score: 20 },
        { term: 'embedding', score: 18 },
        { term: '向量数据库', score: 18 },
        { term: '微调', score: 18 },
        { term: 'fine-tuning', score: 18 },
        { term: 'lora', score: 18 },
        { term: '训练', score: 12 },
        { term: '推理', score: 12 },
        { term: '部署', score: 10 },
        { term: '模型', score: 8 },
        { term: '知识库', score: 12 },
        { term: 'prompt', score: 10 },
        { term: 'langchain', score: 18 },
        { term: 'llamaindex', score: 18 },
        { term: 'hugging face', score: 15 },
        { term: 'huggingface', score: 15 },
        { term: '架构', score: 8 },
        { term: '工程', score: 6 },
      ]
    },
    {
      name: 'GPT & OpenAI',
      slug: 'openai-gpt',
      icon: '🟢',
      priority: 15,
      keywords: [
        { term: 'openai', score: 20 },
        { term: 'chatgpt', score: 20 },
        { term: 'gpt', score: 15 },
        { term: 'sora', score: 18 },
      ]
    },
    {
      name: 'Gemini & Google',
      slug: 'google-gemini',
      icon: '🔵',
      priority: 14,
      keywords: [
        { term: 'gemini', score: 20 },
        { term: 'google', score: 15 },
      ]
    },
    {
      name: 'DeepSeek',
      slug: 'deepseek',
      icon: '🔷',
      priority: 14,
      keywords: [
        { term: 'deepseek', score: 20 },
      ]
    },
    {
      name: 'AI 视频 & 动画',
      slug: 'ai-video',
      icon: '🎬',
      priority: 13,
      keywords: [
        { term: 'sora', score: 12 },
        { term: '视频生成', score: 20 },
        { term: 'ai视频', score: 20 },
        { term: '可灵', score: 20 },
        { term: 'kling', score: 20 },
        { term: 'runway', score: 18 },
        { term: 'pika', score: 18 },
        { term: 'vidu', score: 18 },
        { term: 'seedance', score: 20 },
        { term: 'wan2.', score: 20 },
        { term: '短剧', score: 15 },
        { term: '镜头', score: 12 },
        { term: '动画', score: 15 },
      ],
      exclude: []
    },
    {
      name: 'AI 绘画 & 图像',
      slug: 'ai-image',
      icon: '🎨',
      priority: 13,
      keywords: [
        { term: 'midjourney', score: 20 },
        { term: 'stable diffusion', score: 18 },
        { term: 'comfyui', score: 18 },
        { term: 'dall-e', score: 18 },
        { term: 'firefly', score: 20 },
        { term: '绘画', score: 18 },
        { term: 'ai绘画', score: 20 },
        { term: '图像', score: 15 },
        { term: '生图', score: 20 },
        { term: '画图', score: 18 },
        { term: '插画', score: 18 },
        { term: 'niji', score: 20 },
        { term: 'flux', score: 18 },
        { term: '图像生成', score: 20 },
      ],
      exclude: [
        { term: '视频', score: 25 },
      ]
    },
    {
      name: 'AI 音乐 & 音频',
      slug: 'ai-music-audio',
      icon: '🎵',
      priority: 12,
      keywords: [
        { term: '音乐', score: 20 },
        { term: '音频', score: 18 },
        { term: 'tts', score: 18 },
        { term: 'asr', score: 18 },
        { term: '语音', score: 15 },
        { term: 'suno', score: 20 },
        { term: 'udio', score: 18 },
        { term: '作曲', score: 18 },
        { term: '歌声', score: 18 },
        { term: '歌词', score: 15 },
      ],
      exclude: [
        { term: 'image', score: 30 },
        { term: '图像', score: 30 },
        { term: '绘画', score: 30 },
        { term: '视频生成', score: 30 },
      ]
    },
    {
      name: 'AI 写作 & 文案',
      slug: 'ai-writing',
      icon: '✍️',
      priority: 12,
      keywords: [
        { term: '写作', score: 20 },
        { term: 'ai写作', score: 20 },
        { term: '翻译', score: 15 },
        { term: '文案', score: 15 },
        { term: '文档', score: 5 },
      ]
    },
    {
      name: 'AI 3D & 游戏',
      slug: 'ai-3d-game',
      icon: '🎮',
      priority: 11,
      keywords: [
        { term: '3d', score: 20 },
        { term: '游戏', score: 18 },
      ]
    },
    {
      name: 'AI 办公 & 效率',
      slug: 'ai-office',
      icon: '📊',
      priority: 12,
      keywords: [
        { term: 'ppt', score: 20 },
        { term: '办公', score: 18 },
        { term: '笔记', score: 15 },
        { term: '知识管理', score: 18 },
        { term: '思维导图', score: 18 },
        { term: 'notion', score: 15 },
        { term: '飞书', score: 15 },
        { term: '协作', score: 12 },
        { term: '演示', score: 12 },
        { term: '图表', score: 12 },
        { term: 'ocr', score: 18 },
        { term: '日程', score: 15 },
        { term: '会议', score: 12 },
        { term: '文档', score: 8 },
        { term: '表格', score: 12 },
      ]
    },
    {
      name: 'AI 安全 & 伦理',
      slug: 'ai-safety',
      icon: '🔒',
      priority: 11,
      keywords: [
        { term: '安全', score: 18 },
        { term: '隐私', score: 18 },
        { term: '对齐', score: 18 },
        { term: 'rlhf', score: 18 },
        { term: '红队', score: 20 },
        { term: '越狱', score: 20 },
        { term: '漏洞', score: 15 },
        { term: '攻击', score: 12 },
        { term: '防御', score: 12 },
        { term: '版权', score: 15 },
        { term: '监管', score: 15 },
        { term: '治理', score: 15 },
      ],
      exclude: [
        { term: 'vps', score: 30 },
        { term: '服务器', score: 20 },
        { term: 'harness', score: 25 },
      ]
    },
    {
      name: '教程 & 指南',
      slug: 'tutorials',
      icon: '📚',
      priority: 8,
      keywords: [
        { term: '教程', score: 18 },
        { term: '指南', score: 18 },
        { term: '入门', score: 15 },
        { term: '实战', score: 12 },
        { term: '课程', score: 15 },
        { term: '学习', score: 10 },
        { term: '清单', score: 12 },
        { term: '合集', score: 12 },
      ]
    },
    {
      name: '工具推荐 & 评测',
      slug: 'tools-review',
      icon: '🔧',
      priority: 9,
      keywords: [
        { term: '评测', score: 18 },
        { term: '测评', score: 18 },
        { term: '对比', score: 15 },
        { term: '推荐', score: 15 },
        { term: '工具', score: 8 },
        { term: '插件', score: 10 },
        { term: '扩展', score: 10 },
        { term: '体验', score: 5 },
      ]
    },
    {
      name: '开源项目',
      slug: 'open-source',
      icon: '⭐',
      priority: 10,
      keywords: [
        { term: '开源', score: 20 },
        { term: 'github', score: 18 },
      ]
    },
    {
      name: '产品 & 商业',
      slug: 'product-business',
      icon: '💼',
      priority: 10,
      keywords: [
        { term: '创业', score: 18 },
        { term: '商业', score: 15 },
        { term: '产品', score: 10 },
        { term: '增长', score: 15 },
        { term: '营销', score: 15 },
        { term: 'saas', score: 18 },
        { term: '商业模式', score: 18 },
        { term: '赚钱', score: 15 },
        { term: '落地', score: 10 },
        { term: '应用案例', score: 15 },
      ]
    },
    {
      name: '行业趋势 & 洞察',
      slug: 'industry-trends',
      icon: '📈',
      priority: 8,
      keywords: [
        { term: '趋势', score: 18 },
        { term: '行业', score: 15 },
        { term: '报告', score: 15 },
        { term: '白皮书', score: 18 },
        { term: '蓝皮书', score: 18 },
        { term: 'agi', score: 12 },
        { term: '研究', score: 10 },
        { term: '论文', score: 12 },
        { term: '播客', score: 12 },
        { term: '周刊', score: 15 },
        { term: '社区', score: 8 },
        { term: '访谈', score: 15 },
        { term: '对谈', score: 15 },
        { term: '演讲', score: 12 },
        { term: '洞察', score: 15 },
        { term: '峰会', score: 15 },
        { term: '发布', score: 10 },
        { term: '融资', score: 18 },
        { term: '上市', score: 18 },
        { term: '收购', score: 15 },
      ]
    },
    {
      name: '大厂动态',
      slug: 'tech-giants',
      icon: '🏢',
      priority: 9,
      keywords: [
        { term: '字节', score: 18 },
        { term: '百度', score: 18 },
        { term: '阿里', score: 18 },
        { term: 'meta', score: 15 },
        { term: 'apple', score: 15 },
        { term: 'microsoft', score: 15 },
        { term: '腾讯', score: 18 },
      ]
    },
    {
      name: '机器人 & 具身智能',
      slug: 'robotics',
      icon: '🦾',
      priority: 11,
      keywords: [
        { term: '机器人', score: 20 },
        { term: '具身智能', score: 20 },
        { term: '自动驾驶', score: 15 },
      ]
    },
    {
      name: '数据 & 可视化',
      slug: 'data-visualization',
      icon: '📉',
      priority: 10,
      keywords: [
        { term: '数据', score: 10 },
        { term: '可视化', score: 20 },
        { term: 'bi', score: 18 },
        { term: 'seo', score: 15 },
        { term: '数据库', score: 18 },
        { term: 'sql', score: 18 },
        { term: 'etl', score: 18 },
        { term: '仪表盘', score: 18 },
        { term: '大屏', score: 18 },
      ]
    },
    {
      name: '教育 & 职业',
      slug: 'education-career',
      icon: '🎓',
      priority: 8,
      keywords: [
        { term: '教育', score: 18 },
        { term: '面试', score: 15 },
        { term: '求职', score: 15 },
        { term: '招聘', score: 15 },
        { term: '职业', score: 15 },
        { term: '培训', score: 15 },
      ]
    },
    // ===== 以下为通用科技分类（周刊来源） =====
    {
      name: '开发工具 & 效率',
      slug: 'dev-tools',
      icon: '🛠️',
      priority: 9,
      keywords: [
        { term: '编辑器', score: 18 },
        { term: 'ide', score: 15 },
        { term: '终端', score: 15 },
        { term: '命令行', score: 15 },
        { term: 'cli', score: 15 },
        { term: 'shell', score: 15 },
        { term: '调试', score: 12 },
        { term: '构建', score: 12 },
        { term: '打包', score: 12 },
        { term: '编译', score: 12 },
        { term: '部署', score: 10 },
        { term: '监控', score: 12 },
        { term: '日志', score: 10 },
        { term: 'http', score: 8 },
        { term: '浏览器', score: 8 },
        { term: '扩展', score: 10 },
        { term: '插件', score: 10 },
      ],
      exclude: [
        { term: '人工智能', score: 20 },
        { term: '大模型', score: 20 },
        { term: 'ai', score: 15 },
        { term: '机器学习', score: 20 },
      ]
    },
    {
      name: '编程语言 & 框架',
      slug: 'lang-framework',
      icon: '💻',
      priority: 9,
      keywords: [
        { term: 'python', score: 15 },
        { term: 'javascript', score: 15 },
        { term: 'typescript', score: 15 },
        { term: 'rust', score: 18 },
        { term: 'go', score: 12 },
        { term: 'golang', score: 18 },
        { term: 'java', score: 12 },
        { term: 'react', score: 15 },
        { term: 'vue', score: 15 },
        { term: 'angular', score: 15 },
        { term: 'node', score: 12 },
        { term: 'rails', score: 15 },
        { term: 'django', score: 15 },
        { term: 'flask', score: 15 },
        { term: 'swift', score: 12 },
        { term: 'kotlin', score: 15 },
        { term: 'css', score: 12 },
        { term: 'html', score: 8 },
        { term: 'web', score: 8 },
        { term: '前端', score: 12 },
        { term: '后端', score: 12 },
        { term: 'api', score: 10 },
        { term: 'sdk', score: 12 },
        { term: 'npm', score: 12 },
        { term: 'git', score: 12 },
        { term: 'linux', score: 12 },
        { term: 'docker', score: 12 },
        { term: 'kubernetes', score: 15 },
        { term: 'sql', score: 12 },
        { term: '数据库', score: 12 },
        { term: '算法', score: 15 },
        { term: '数据结构', score: 18 },
      ],
      exclude: [
        { term: '人工智能', score: 20 },
        { term: '大模型', score: 20 },
        { term: '机器学习', score: 20 },
      ]
    },
    {
      name: '软件 & 应用',
      slug: 'software-apps',
      icon: '📱',
      priority: 8,
      keywords: [
        { term: 'app', score: 10 },
        { term: '应用', score: 10 },
        { term: '软件', score: 12 },
        { term: '手机', score: 10 },
        { term: '苹果', score: 8 },
        { term: 'google', score: 8 },
        { term: '微软', score: 8 },
        { term: 'windows', score: 10 },
        { term: 'mac', score: 10 },
        { term: 'ios', score: 10 },
        { term: 'android', score: 10 },
        { term: '游戏', score: 10 },
        { term: 'chrome', score: 10 },
        { term: 'firefox', score: 10 },
        { term: '开源', score: 12 },
        { term: 'github', score: 15 },
      ],
      exclude: [
        { term: '人工智能', score: 20 },
        { term: '大模型', score: 20 },
      ]
    },
    {
      name: '科技 & 社会',
      slug: 'tech-society',
      icon: '🌍',
      priority: 7,
      keywords: [
        { term: '隐私', score: 15 },
        { term: '安全', score: 10 },
        { term: '病毒', score: 12 },
        { term: '法律', score: 12 },
        { term: '专利', score: 12 },
        { term: '垄断', score: 15 },
        { term: ' SpaceX ', score: 15 },
        { term: 'nasa', score: 15 },
        { term: '太空', score: 12 },
        { term: '卫星', score: 12 },
        { term: '电动车', score: 12 },
        { term: '新能源', score: 12 },
        { term: '芯片', score: 12 },
        { term: '5g', score: 12 },
        { term: '区块链', score: 12 },
        { term: '加密', score: 10 },
        { term: '政府', score: 10 },
        { term: '环保', score: 12 },
        { term: '气候', score: 12 },
        { term: '量子', score: 15 },
      ],
      exclude: []
    },
    {
      name: '设计与创意',
      slug: 'design-creative',
      icon: '✨',
      priority: 8,
      keywords: [
        { term: '设计', score: 15 },
        { term: '字体', score: 18 },
        { term: '图标', score: 15 },
        { term: '配色', score: 18 },
        { term: 'ui', score: 15 },
        { term: 'ux', score: 15 },
        { term: 'logo', score: 15 },
        { term: '动画', score: 10 },
        { term: '3d', score: 10 },
        { term: '打印', score: 10 },
        { term: '摄影', score: 12 },
        { term: '视频', score: 8 },
        { term: '图片', score: 8 },
        { term: '壁纸', score: 15 },
        { term: '模板', score: 10 },
      ],
      exclude: [
        { term: '人工智能', score: 20 },
        { term: 'ai', score: 15 },
      ]
    },
  ];

  // ===== 3. 分类每个条目 =====
  const MIN_SCORE = 8; // 最低分阈值

  function classify(entry) {
    const text = `${entry.title} ${entry.description || ''}`.toLowerCase();
    const scores = [];

    for (const cat of categories) {
      let totalScore = 0;

      // 先检查排除词
      if (cat.exclude) {
        for (const exc of cat.exclude) {
          const excTerm = typeof exc === 'string' ? exc : exc.term;
          const excScore = typeof exc === 'string' ? 20 : (exc.score || 20);
          if (text.includes(excTerm.toLowerCase())) {
            totalScore -= excScore;
          }
        }
      }

      for (const kw of cat.keywords) {
        if (text.includes(kw.term.toLowerCase())) {
          totalScore += kw.score;
        }
      }

      // 标题中的匹配加权（标题权重更高，更可信）
      const titleText = entry.title.toLowerCase();
      for (const kw of cat.keywords) {
        if (titleText.includes(kw.term.toLowerCase())) {
          totalScore += Math.round(kw.score * 0.5); // 标题命中额外加 50%
        }
      }

      if (totalScore > 0) {
        scores.push({ category: cat, score: totalScore });
      }
    }

    // 按得分排序，取最高分类
    scores.sort((a, b) => b.score - a.score);

    // 主分类：最高分必须超过阈值，且领先第二名至少 3 分
    const top = scores[0];
    const second = scores[1];
    if (!top || top.score < MIN_SCORE) return { primary: null, tags: [], topScore: 0 };
    if (second && (top.score - second.score) < 2 && second.score >= MIN_SCORE) {
      // 分数太接近，归入"行业趋势"兜底而不是随意分配
      return { primary: null, tags: [], topScore: top.score };
    }

    const primary = top.category;
    const tags = scores.filter(s => s.score >= 20).map(s => s.category.name);

    return { primary, tags, topScore: top.score };
  }

  const categorized = [];
  const uncategorized = [];

  for (const entry of entries) {
    const result = classify(entry);
    if (result.primary) {
      categorized.push({
        ...entry,
        category: result.primary.name,
        category_slug: result.primary.slug,
        category_icon: result.primary.icon,
        tags: result.tags,
        score: result.topScore,
      });
    } else {
      // 未分类条目归入"行业趋势 & 洞察"兜底
      const fallback = categories.find(c => c.name === '行业趋势 & 洞察');
      categorized.push({
        ...entry,
        category: fallback.name,
        category_slug: fallback.slug,
        category_icon: fallback.icon,
        tags: [],
        score: 0,
      });
    }
  }

  console.log(`已分类: ${categorized.length}`);
  console.log(`未分类: ${uncategorized.length}`);

  // 打印未分类的条目
  if (uncategorized.length > 0 && uncategorized.length < 50) {
    console.log('\n未分类条目:');
    uncategorized.forEach(e => console.log(`  - ${e.title}`));
  }

  // ===== 4. 统计分类分布 =====
  const dist = {};
  for (const cat of categories) {
    const count = categorized.filter(e => e.category === cat.name).length;
    if (count > 0) dist[cat.name] = count;
  }

  console.log('\n分类分布:');
  const sortedDist = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sortedDist) {
    const bar = '█'.repeat(Math.min(50, Math.round(count / 10)));
    console.log(`  ${name.padEnd(25)} ${String(count).padStart(4)} ${bar}`);
  }

  // ===== 5. 输出 =====
  const output = {
    project: 'WaytoAGI',
    source: '飞书更新日志',
    generated_at: new Date().toISOString(),
    total: categorized.length + uncategorized.length,
    categorized: categorized.length,
    uncategorized: uncategorized.length,
    categories: sortedDist.map(([name, count]) => ({ name, count })),
    entries: categorized,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n已写入: ${OUTPUT}`);
}

main();
