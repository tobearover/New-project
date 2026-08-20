// 考纲分类体系：国内考试 / 出国考试 / 专业考试
const syllabi = [
  {
    id: 'cet4',
    name: '大学英语四级',
    category: '国内考试',
    icon: '🎓',
    description: '全国大学英语四级考试（CET-4）词汇大纲，覆盖约 4500 词，是本科阶段最通用的英语能力门槛。',
    audience: '高校在校生、求职与升学需要四级成绩的人群',
    versions: [
      { id: 'cet4-2016', year: '2016 修订版', note: '教育部考试中心最新版大纲词表（沿用至今）' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇', '认知词汇']
  },
  {
    id: 'cet6',
    name: '大学英语六级',
    category: '国内考试',
    icon: '🎓',
    description: '全国大学英语六级考试（CET-6）词汇大纲，在四级基础上扩充约 2000 词，侧重学术与书面表达。',
    audience: '已通过四级的在校生、考研/保研与求职需要六级成绩的人群',
    versions: [
      { id: 'cet6-2016', year: '2016 修订版', note: '教育部考试中心最新版大纲词表' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇', '认知词汇']
  },
  {
    id: 'gaokao',
    name: '高考英语',
    category: '国内考试',
    icon: '📚',
    description: '普通高等学校招生全国统一考试英语科词汇，约 3500 词，与新人教版/外研版教材同步。',
    audience: '高中学生及备考考生',
    versions: [
      { id: 'gaokao-2023', year: '2023 课标版', note: '普通高中英语课程标准（2017 版 2020 修订）' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇']
  },
  {
    id: 'zhongkao',
    name: '中考英语',
    category: '国内考试',
    icon: '🏫',
    description: '初中毕业学业考试英语词汇，约 1600 词，为基础词汇与日常交际用语。',
    audience: '初中学生及备考考生',
    versions: [
      { id: 'zhongkao-2022', year: '2022 课标版', note: '义务教育英语课程标准（2022 年版）' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇']
  },
  {
    id: 'ielts',
    name: '雅思',
    category: '出国考试',
    icon: '🌍',
    description: 'IELTS 学术类词汇，无固定词表，以高频学术词汇（AWL）与场景词汇为核心。',
    audience: '计划留学英联邦国家、移民或外企求职人群',
    versions: [
      { id: 'ielts-awl', year: '学术词汇表 AWL', note: 'Coxhead 学术词汇表 570 词族 + 雅思场景词' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇']
  },
  {
    id: 'toefl',
    name: '托福',
    category: '出国考试',
    icon: '🗽',
    description: 'TOEFL iBT 词汇，以大学课堂学术英语为主，覆盖听、说、读、写四科常见词。',
    audience: '计划赴美加留学的学生与学术交流人群',
    versions: [
      { id: 'toefl-core', year: '核心词表', note: '基于 OG 与 TPO 高频词统计' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇']
  },
  {
    id: 'gre',
    name: 'GRE',
    category: '出国考试',
    icon: '🧠',
    description: '美国研究生入学考试词汇，偏重高级学术词汇与近义词辨析，约 6000 词。',
    audience: '赴美加攻读研究生的考生',
    versions: [
      { id: 'gre-2023', year: '2023 核心词表', note: '基于官方题库与高频词统计' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇', '认知词汇']
  },
  {
    id: 'gmat',
    name: 'GMAT',
    category: '出国考试',
    icon: '📈',
    description: '经企管理研究生入学考试词汇，以商科与管理场景词汇为主，约 3500 词。',
    audience: '申请海外商学院的考生',
    versions: [
      { id: 'gmat-core', year: '核心词表', note: '基于 OG 高频词统计' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇']
  },
  {
    id: 'tem4',
    name: '英语专业四级',
    category: '专业考试',
    icon: '🎖️',
    description: '英语专业四级（TEM-4）词汇大纲，约 6000 词，要求精准掌握用法与搭配。',
    audience: '英语专业本科二年级学生',
    versions: [
      { id: 'tem4-2016', year: '2016 版', note: '高等学校英语专业教学大纲词表' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇', '认知词汇']
  },
  {
    id: 'tem8',
    name: '英语专业八级',
    category: '专业考试',
    icon: '🏅',
    description: '英语专业八级（TEM-8）词汇大纲，约 13000 词，为国内最高级别的英语专业水平测试。',
    audience: '英语专业本科四年级学生及研究生',
    versions: [
      { id: 'tem8-2016', year: '2016 版', note: '高等学校英语专业教学大纲词表' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇', '认知词汇']
  },
  {
    id: 'bec',
    name: 'BEC 商务英语',
    category: '专业考试',
    icon: '💼',
    description: '剑桥商务英语（BEC）词汇，覆盖商务沟通、贸易、金融、管理四大场景。',
    audience: '职场人士、商科学生与外企求职者',
    versions: [
      { id: 'bec-higher', year: 'BEC 高级', note: '剑桥商务英语高级词汇表' }
    ],
    tags: ['高频词汇', '常考词汇', '重点词汇']
  }
];

module.exports = { syllabi };
