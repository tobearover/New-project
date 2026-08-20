// 种子词库：完整词条（详细解析）+ 紧凑词条（基础信息）
// 级别：high_frequency 高频 / frequent 常考 / key 重点 / cognition 认知

const detailedWords = [
  {
    id: 'abandon', word: 'abandon', phoneticUK: '/əˈbændən/', phoneticUS: '/əˈbændən/',
    pos: 'v.', meanings: ['放弃，抛弃', '离弃，遗弃', '中止'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'tem4'],
    examples: [
      { en: 'He abandoned his car in the snow.', zh: '他把汽车丢弃在雪地里。' },
      { en: 'They had to abandon the plan due to lack of funds.', zh: '由于资金不足，他们不得不放弃该计划。' }
    ],
    synonyms: ['give up', 'desert', 'quit'], antonyms: ['keep', 'maintain', 'retain'],
    derivatives: ['abandoned adj. 被抛弃的', 'abandonment n. 抛弃'],
    collocations: ['abandon oneself to 沉溺于', 'abandon a project 放弃项目'],
    examPoint: '四级高频词。常考“放弃”义项，以及 abandon oneself to sth（沉溺于）的用法；注意与 desert（抛弃，擅离职守）辨析。',
    realExam: [
      { source: 'CET-4 阅读理解', sentence: 'The crew had to abandon the sinking ship.', note: '此处 abandon 意为“撤离、离开”。' }
    ],
    memoryTip: '谐音“俺搬凳”→ 搬家时凳子都不要了，全都抛弃。'
  },
  {
    id: 'absorb', word: 'absorb', phoneticUK: '/əbˈzɔːb/', phoneticUS: '/əbˈzɔːrb/',
    pos: 'v.', meanings: ['吸收', '使全神贯注', '理解，掌握'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Plants absorb water through their roots.', zh: '植物通过根部吸收水分。' },
      { en: 'She was completely absorbed in her book.', zh: '她完全沉浸在书里。' }
    ],
    synonyms: ['take in', 'soak up'], antonyms: ['release', 'emit'],
    derivatives: ['absorption n. 吸收', 'absorbing adj. 引人入胜的'],
    collocations: ['be absorbed in 全神贯注于', 'absorb knowledge 吸收知识'],
    examPoint: '常考 be absorbed in 结构，主语通常为人，表示“专注于”。',
    realExam: [
      { source: 'CET-6 完形填空', sentence: 'Vitamins are substances that the body cannot absorb without fat.', note: 'absorb 与营养吸收场景绑定。' }
    ],
    memoryTip: 'ab（加强）+ sorb（吸）→ 使劲吸进去，就是“吸收”。'
  },
  {
    id: 'access', word: 'access', phoneticUK: '/ˈækses/', phoneticUS: '/ˈækses/',
    pos: 'n. / v.', meanings: ['入口，通道', '接近（或进入）的机会，使用权', '访问（数据）'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts', 'toefl'],
    examples: [
      { en: 'Students have free access to the library.', zh: '学生可以免费使用图书馆。' },
      { en: 'The only access to the village is by boat.', zh: '进入该村的唯一通道是乘船。' }
    ],
    synonyms: ['entry', 'admission'], antonyms: ['exit'],
    derivatives: ['accessible adj. 可进入的；易理解的', 'accessibility n. 可及性'],
    collocations: ['have access to 有机会使用；可接近', 'access the Internet 上网'],
    examPoint: '高频考点：have/get access to 是固定搭配，to 后接名词；注意 accessible 与 available 的辨析。',
    realExam: [
      { source: 'CET-4 选词填空', sentence: 'With the rise of the Internet, people have easy access to information.', note: 'access 作名词与 to 连用。' }
    ],
    memoryTip: 'ac + cess（走）→ 走过去能到的地方，就是“通道、使用权”。'
  },
  {
    id: 'achieve', word: 'achieve', phoneticUK: '/əˈtʃiːv/', phoneticUS: '/əˈtʃiːv/',
    pos: 'v.', meanings: ['实现，达到', '完成，取得'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'tem4'],
    examples: [
      { en: 'She worked hard to achieve her goals.', zh: '她努力工作以实现自己的目标。' },
      { en: 'The company achieved record profits last year.', zh: '该公司去年实现了创纪录的利润。' }
    ],
    synonyms: ['accomplish', 'attain', 'realize'], antonyms: ['fail'],
    derivatives: ['achievement n. 成就', 'achievable adj. 可实现的'],
    collocations: ['achieve success 取得成功', 'achieve a balance 达到平衡'],
    examPoint: '注意 achieve 后接目标/结果类名词；与 accomplish 近义，但 achieve 更强调最终达成。',
    realExam: [
      { source: 'CET-4 写作', sentence: 'Only by making constant efforts can we achieve our dreams.', note: '倒装句式 + achieve 搭配。' }
    ],
    memoryTip: 'a + chieve（=chief 首领）→ 当上首领，就是“达成、实现”。'
  },
  {
    id: 'acquire', word: 'acquire', phoneticUK: '/əˈkwaɪə(r)/', phoneticUS: '/əˈkwaɪər/',
    pos: 'v.', meanings: ['获得，取得', '学到（知识、技能）'],
    level: 'high_frequency', exams: ['cet6', 'ielts', 'toefl', 'gre'],
    examples: [
      { en: 'Children acquire language at an amazing speed.', zh: '儿童习得语言的速度惊人。' },
      { en: 'The firm has acquired a smaller company.', zh: '该公司收购了一家较小的企业。' }
    ],
    synonyms: ['obtain', 'gain', 'attain'], antonyms: ['lose'],
    derivatives: ['acquisition n. 获得；收购', 'acquired adj. 后天获得的'],
    collocations: ['acquire knowledge 获取知识', 'acquire a habit 养成习惯'],
    examPoint: '常与 knowledge/skill 搭配表“习得”，与 obtain 相比更强调通过努力持续获得。',
    realExam: [
      { source: 'TOEFL 听力', sentence: 'Language acquisition is a complex process that continues throughout life.', note: 'acquisition 为名词考点。' }
    ],
    memoryTip: 'ac + quire（寻求）→ 反复寻求直到拿到手，即“获得”。'
  },
  {
    id: 'adapt', word: 'adapt', phoneticUK: '/əˈdæpt/', phoneticUS: '/əˈdæpt/',
    pos: 'v.', meanings: ['适应', '改编', '使适合'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'It took her a while to adapt to the new environment.', zh: '她花了一段时间才适应新环境。' },
      { en: 'The novel was adapted for television.', zh: '这部小说被改编成电视剧。' }
    ],
    synonyms: ['adjust', 'accommodate'], antonyms: ['resist'],
    derivatives: ['adaptation n. 适应；改编', 'adaptable adj. 适应性强的'],
    collocations: ['adapt to 适应', 'adapt...from... 由……改编'],
    examPoint: '高频考点：adapt to 后接名词/动名词；adapt 与 adopt（采纳、收养）形近词辨析是常考陷阱。',
    realExam: [
      { source: 'CET-4 选词填空', sentence: 'Organisms that adapt to changing environments are more likely to survive.', note: 'adapt 与 to 搭配。' }
    ],
    memoryTip: 'ad + apt（适合）→ 使适合新情况，即“适应、改编”。'
  },
  {
    id: 'adequate', word: 'adequate', phoneticUK: '/ˈædɪkwət/', phoneticUS: '/ˈædɪkwət/',
    pos: 'adj.', meanings: ['足够的，充足的', '胜任的，合格的'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl'],
    examples: [
      { en: 'Make sure you get adequate sleep.', zh: '确保你有充足的睡眠。' },
      { en: 'She proved adequate to the task.', zh: '她证明自己能胜任这项任务。' }
    ],
    synonyms: ['sufficient', 'enough'], antonyms: ['inadequate', 'insufficient'],
    derivatives: ['adequately adv. 充分地', 'adequacy n. 充分'],
    collocations: ['adequate for 对……足够', 'be adequate to 胜任'],
    examPoint: 'adequate 表“刚好够用”，与 sufficient 近义；与 enough 相比更正式。',
    realExam: [
      { source: 'IELTS 写作', sentence: 'Governments should ensure adequate funding for public health.', note: 'adequate 修饰不可数名词。' }
    ],
    memoryTip: 'ad + equate（相等）→ 数量与需求相等，就是“足够的”。'
  },
  {
    id: 'advocate', word: 'advocate', phoneticUK: '/ˈædvəkeɪt/ v. /ˈædvəkət/ n.', phoneticUS: '/ˈædvəkeɪt/ v. /ˈædvəkət/ n.',
    pos: 'v. / n.', meanings: ['提倡，主张', '拥护者，提倡者'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl', 'gre'],
    examples: [
      { en: 'Many experts advocate a balanced diet.', zh: '许多专家提倡均衡饮食。' },
      { en: 'She is a strong advocate of equal rights.', zh: '她是平等权利的坚定拥护者。' }
    ],
    synonyms: ['support', 'promote'], antonyms: ['oppose'],
    derivatives: ['advocacy n. 提倡，拥护'],
    collocations: ['advocate doing sth 提倡做某事', 'advocate for 为……发声'],
    examPoint: '作动词时后接动名词 advocate doing sth；名词读 /ˈædvəkət/，注意重音随词性变化。',
    realExam: [
      { source: 'CET-6 阅读', sentence: 'Some researchers advocate delaying school start times for teenagers.', note: 'advocate + doing 结构。' }
    ],
    memoryTip: 'ad（加强）+ voc（喊）+ ate → 使劲为某事喊话，就是“提倡”。'
  },
  {
    id: 'alternative', word: 'alternative', phoneticUK: '/ɔːlˈtɜːnətɪv/', phoneticUS: '/ɔːlˈtɜːrnətɪv/',
    pos: 'n. / adj.', meanings: ['可供选择的事物，替代方案', '替代的，备选的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'We had no alternative but to wait.', zh: '我们别无选择，只能等待。' },
      { en: 'Alternative energy sources are becoming more popular.', zh: '替代能源正变得越来越受欢迎。' }
    ],
    synonyms: ['option', 'choice'], antonyms: ['necessity'],
    derivatives: ['alternatively adv. 或者，要不'],
    collocations: ['have no alternative but to do 别无选择只能……', 'alternative energy 替代能源'],
    examPoint: 'have no alternative but to do 为高频考点；注意 alternative 强调“二选一”之外的“另一选择”。',
    realExam: [
      { source: 'CET-4 翻译', sentence: 'With no alternative but to walk, we set off early.', note: 'but to do 结构。' }
    ],
    memoryTip: 'altern（交替）+ ative → 可交替使用的方案，即“替代方案”。'
  },
  {
    id: 'analyze', word: 'analyze', phoneticUK: '/ˈænəlaɪz/', phoneticUS: '/ˈænəlaɪz/',
    pos: 'v.', meanings: ['分析', '解析'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'toefl'],
    examples: [
      { en: 'Scientists analyzed the data from the experiment.', zh: '科学家分析了实验数据。' }
    ],
    synonyms: ['examine', 'evaluate'], antonyms: ['synthesize'],
    derivatives: ['analysis n. 分析', 'analytical adj. 分析的'],
    collocations: ['analyze data 分析数据', 'in the final analysis 归根结底'],
    examPoint: '注意英式拼写 analyse；名词 analysis 的复数形式是 analyses。',
    realExam: [
      { source: 'TOEFL 写作', sentence: 'To understand consumer behavior, researchers must analyze large datasets.', note: '学术写作常用搭配。' }
    ],
    memoryTip: 'ana（分开）+ lyze（松开）→ 拆开来看，就是“分析”。'
  },
  {
    id: 'apparent', word: 'apparent', phoneticUK: '/əˈpærənt/', phoneticUS: '/əˈpærənt/',
    pos: 'adj.', meanings: ['显然的，明显的', '表面上的'],
    level: 'frequent', exams: ['cet6', 'ielts', 'gre'],
    examples: [
      { en: 'It was apparent that she was tired.', zh: '很明显她累了。' },
      { en: 'The apparent success was short-lived.', zh: '表面上的成功没有持续多久。' }
    ],
    synonyms: ['obvious', 'evident', 'clear'], antonyms: ['unclear', 'obscure'],
    derivatives: ['apparently adv. 显然，据说'],
    collocations: ['it is apparent that... 显而易见……'],
    examPoint: 'apparently 常作插入语，意为“显然/据说”，是阅读理解常见信号词。',
    realExam: [
      { source: 'CET-6 阅读', sentence: 'It is apparent that technology has changed the way we communicate.', note: 'it is apparent that 句型。' }
    ],
    memoryTip: 'ap + parent（父母）→ 父母在场，情况“显而易见”。'
  },
  {
    id: 'appeal', word: 'appeal', phoneticUK: '/əˈpiːl/', phoneticUS: '/əˈpiːl/',
    pos: 'v. / n.', meanings: ['呼吁，恳求', '吸引，引起兴趣', '上诉', '吸引力'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao'],
    examples: [
      { en: 'The police appealed to the public for information.', zh: '警方呼吁公众提供信息。' },
      { en: 'The idea appeals to young people.', zh: '这个想法吸引年轻人。' }
    ],
    synonyms: ['attract', 'plead'], antonyms: ['repel'],
    derivatives: ['appealing adj. 有吸引力的'],
    collocations: ['appeal to 呼吁；吸引', 'make an appeal 发出呼吁'],
    examPoint: '高频考点：appeal to sb 表示“吸引某人”或“呼吁某人”；名词表“吸引力”时常用 the appeal of。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'The appeal of online shopping lies in its convenience.', note: 'the appeal of 结构。' }
    ],
    memoryTip: 'ap + peal（=pull 拉）→ 把人心拉过来，就是“吸引、呼吁”。'
  },
  {
    id: 'appreciate', word: 'appreciate', phoneticUK: '/əˈpriːʃieɪt/', phoneticUS: '/əˈpriːʃieɪt/',
    pos: 'v.', meanings: ['感激，感谢', '欣赏，赏识', '理解，意识到'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'tem4'],
    examples: [
      { en: 'I really appreciate your help.', zh: '我非常感激你的帮助。' },
      { en: 'It takes time to appreciate modern art.', zh: '欣赏现代艺术需要时间。' }
    ],
    synonyms: ['value', 'admire', 'be grateful for'], antonyms: ['dislike'],
    derivatives: ['appreciation n. 感激；欣赏', 'appreciative adj. 感激的'],
    collocations: ['appreciate doing sth 感激做某事', 'show appreciation for 对……表示感激'],
    examPoint: '高频考点：appreciate 后接动名词（appreciate doing），不接不定式；表“感激”时宾语常为 help/support。',
    realExam: [
      { source: 'CET-4 写作', sentence: 'We appreciate having this opportunity to learn from you.', note: 'appreciate + doing。' }
    ],
    memoryTip: 'ap + preci（价值）+ ate → 看出价值，就是“欣赏、感激”。'
  },
  {
    id: 'approach', word: 'approach', phoneticUK: '/əˈprəʊtʃ/', phoneticUS: '/əˈproʊtʃ/',
    pos: 'v. / n.', meanings: ['接近，靠近', '着手处理', '方法，途径', '临近'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'The deadline is approaching fast.', zh: '截止日期迅速临近。' },
      { en: 'We need a new approach to the problem.', zh: '我们需要解决问题的新方法。' }
    ],
    synonyms: ['method', 'way', 'near'], antonyms: ['depart'],
    derivatives: ['approachable adj. 平易近人的'],
    collocations: ['approach to sth/doing sth 处理……的方法', 'adopt an approach 采用一种方法'],
    examPoint: '名词 approach 后接 to + n./doing，不接 of；这是四六级和雅思写作高频搭配。',
    realExam: [
      { source: 'IELTS 写作', sentence: 'A more practical approach to reducing traffic is to improve public transport.', note: 'approach to + doing。' }
    ],
    memoryTip: 'ap + proach（接近）→ 走近问题，找到“方法”。'
  },
  {
    id: 'appropriate', word: 'appropriate', phoneticUK: '/əˈprəʊpriət/', phoneticUS: '/əˈproʊpriət/',
    pos: 'adj.', meanings: ['适当的，恰当的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts', 'tem4'],
    examples: [
      { en: 'Please wear appropriate clothes for the interview.', zh: '请穿适合面试的衣服。' }
    ],
    synonyms: ['suitable', 'proper', 'fitting'], antonyms: ['inappropriate', 'unsuitable'],
    derivatives: ['appropriately adv. 恰当地', 'appropriateness n. 适当'],
    collocations: ['be appropriate for 适合……', 'it is appropriate to do 做……是恰当的'],
    examPoint: '注意拼写与读音；与 proper 近义，正式语境更常用 appropriate。',
    realExam: [
      { source: 'CET-4 翻译', sentence: 'Teachers should choose appropriate materials for young learners.', note: 'be appropriate for 搭配。' }
    ],
    memoryTip: 'ap + propri（自己的）+ ate → 像自己的一样合适，即“恰当的”。'
  },
  {
    id: 'assume', word: 'assume', phoneticUK: '/əˈsjuːm/', phoneticUS: '/əˈsuːm/',
    pos: 'v.', meanings: ['假定，假设', '承担（责任）', '呈现（外观）'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'toefl', 'gre'],
    examples: [
      { en: 'I assume that you have heard the news.', zh: '我猜你已经听说这个消息了。' },
      { en: 'She assumed responsibility for the project.', zh: '她承担了这个项目的责任。' }
    ],
    synonyms: ['suppose', 'presume'], antonyms: ['know'],
    derivatives: ['assumption n. 假设；承担'],
    collocations: ['assume that... 假定……', 'assume responsibility 承担责任'],
    examPoint: '阅读理解高频词：注意“assume 未必为真”的语境，常与 suppose/presume 辨析；名词 assumption 与 make 搭配。',
    realExam: [
      { source: 'TOEFL 阅读', sentence: 'Researchers assumed that the results would be consistent across cultures.', note: 'assume + that 从句。' }
    ],
    memoryTip: 'as + sume（拿）→ 先拿来当作真的，就是“假定”。'
  },
  {
    id: 'available', word: 'available', phoneticUK: '/əˈveɪləbl/', phoneticUS: '/əˈveɪləbl/',
    pos: 'adj.', meanings: ['可获得的，可用的', '有空的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Tickets are available online.', zh: '门票可以在网上买到。' },
      { en: 'I am available tomorrow afternoon.', zh: '我明天下午有空。' }
    ],
    synonyms: ['accessible', 'obtainable'], antonyms: ['unavailable'],
    derivatives: ['availability n. 可用性'],
    collocations: ['be available to sb 可供某人使用', 'make sth available 使某物可获取'],
    examPoint: '高频考点：available 常作后置定语（the best available option）；表“有空的”修饰人。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'The report is available on the university website.', note: '后置定语用法。' }
    ],
    memoryTip: 'a + vail（价值）+ able → 有价值且拿得到，就是“可获得的”。'
  },
  {
    id: 'benefit', word: 'benefit', phoneticUK: '/ˈbenɪfɪt/', phoneticUS: '/ˈbenɪfɪt/',
    pos: 'n. / v.', meanings: ['利益，好处', '福利，津贴', '使受益'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Regular exercise has many health benefits.', zh: '经常锻炼对健康有很多好处。' },
      { en: 'The new policy will benefit local farmers.', zh: '新政策将使当地农民受益。' }
    ],
    synonyms: ['advantage', 'profit'], antonyms: ['harm', 'loss'],
    derivatives: ['beneficial adj. 有益的', 'beneficiary n. 受益人'],
    collocations: ['benefit from 从……中受益', 'be of benefit to 对……有益', 'for the benefit of 为了……的利益'],
    examPoint: '高频考点：benefit from（受益于）；名词短语 be of benefit to sb；形容词 beneficial 与 to 搭配。',
    realExam: [
      { source: 'CET-4 写作', sentence: 'Students can benefit greatly from reading classic literature.', note: 'benefit from 搭配。' }
    ],
    memoryTip: 'bene（好）+ fit（做）→ 做好事带来“好处”。'
  },
  {
    id: 'challenge', word: 'challenge', phoneticUK: '/ˈtʃælɪndʒ/', phoneticUS: '/ˈtʃælɪndʒ/',
    pos: 'n. / v.', meanings: ['挑战', '质疑，提出异议'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Learning a new language is a big challenge.', zh: '学习一门新语言是个很大的挑战。' },
      { en: 'She challenged the traditional view.', zh: '她对传统观点提出质疑。' }
    ],
    synonyms: ['difficulty', 'question'], antonyms: ['easy task'],
    derivatives: ['challenging adj. 具有挑战性的'],
    collocations: ['face a challenge 面对挑战', 'challenge sb to do sth 向某人挑战做某事'],
    examPoint: 'challenging 修饰任务/环境；动词表“质疑”时在学术阅读中常考。',
    realExam: [
      { source: 'CET-4 听力', sentence: 'Finding affordable housing remains a challenge for young people.', note: 'remain a challenge 搭配。' }
    ],
    memoryTip: '谐音“查冷治”→ 查清楚难题才能治理，即“挑战”。'
  },
  {
    id: 'circumstance', word: 'circumstance', phoneticUK: '/ˈsɜːkəmstəns/', phoneticUS: '/ˈsɜːrkəmstæns/',
    pos: 'n.', meanings: ['情况，环境', '境况，经济状况'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl', 'tem4'],
    examples: [
      { en: 'Under no circumstances should you give up.', zh: '在任何情况下你都不应该放弃。' }
    ],
    synonyms: ['condition', 'situation'], antonyms: [],
    derivatives: ['circumstantial adj. 依情况而定的'],
    collocations: ['under/in the circumstances 在这种情况下', 'under no circumstances 决不（倒装）'],
    examPoint: '高频考点：under no circumstances 位于句首引起部分倒装，是六级语法选择题常客。',
    realExam: [
      { source: 'CET-6 语法', sentence: 'Under no circumstances may you leave the room.', note: '否定前置，助动词提前。' }
    ],
    memoryTip: 'circum（周围）+ stance（站立）→ 站在四周的情况，就是“环境、境况”。'
  },
  {
    id: 'consequence', word: 'consequence', phoneticUK: '/ˈkɒnsɪkwəns/', phoneticUS: '/ˈkɑːnsəkwens/',
    pos: 'n.', meanings: ['结果，后果', '重要性'],
    level: 'frequent', exams: ['cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'The accident was a consequence of careless driving.', zh: '这场事故是粗心驾驶的结果。' }
    ],
    synonyms: ['result', 'outcome', 'effect'], antonyms: ['cause'],
    derivatives: ['consequent adj. 随之发生的', 'consequently adv. 因此'],
    collocations: ['as a consequence of 由于……', 'in consequence 结果'],
    examPoint: '高频考点：as a consequence of / consequently 表因果；consequence 偏负面结果，result 中性。',
    realExam: [
      { source: 'CET-6 阅读', sentence: 'As a consequence of global warming, sea levels are rising.', note: 'as a consequence of 搭配。' }
    ],
    memoryTip: 'con（共同）+ sequ（跟随）+ ence → 跟着发生的事，就是“结果”。'
  },
  {
    id: 'contribute', word: 'contribute', phoneticUK: '/kənˈtrɪbjuːt/', phoneticUS: '/kənˈtrɪbjuːt/',
    pos: 'v.', meanings: ['贡献，捐助', '促成，导致', '投稿'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Everyone should contribute to protecting the environment.', zh: '每个人都应为保护环境贡献力量。' }
    ],
    synonyms: ['donate', 'help'], antonyms: ['withhold'],
    derivatives: ['contribution n. 贡献；稿件', 'contributor n. 贡献者；投稿人'],
    collocations: ['contribute to 有助于；促成；捐款给'],
    examPoint: '高频考点：contribute to 后接名词/动名词，to 是介词；表“促成（坏事）”时也是 contribute to。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'Several factors contributed to the rapid growth of the city.', note: 'contribute to 表“促成”。' }
    ],
    memoryTip: 'con（共同）+ tribute（给予）→ 大家一起给，就是“贡献”。'
  },
  {
    id: 'crucial', word: 'crucial', phoneticUK: '/ˈkruːʃl/', phoneticUS: '/ˈkruːʃl/',
    pos: 'adj.', meanings: ['至关重要的，决定性的'],
    level: 'high_frequency', exams: ['cet6', 'ielts', 'toefl', 'gre'],
    examples: [
      { en: 'Timing is crucial to the success of the plan.', zh: '时机对计划成功至关重要。' }
    ],
    synonyms: ['critical', 'vital', 'essential'], antonyms: ['minor', 'trivial'],
    derivatives: ['crucially adv. 至关重要地'],
    collocations: ['be crucial to/for 对……至关重要', 'play a crucial role in 在……中起关键作用'],
    examPoint: '雅思写作高频词：play a crucial role in；与 vital/essential 可互换但语气更强。',
    realExam: [
      { source: 'IELTS 写作', sentence: 'Education plays a crucial role in economic development.', note: 'play a crucial role in 搭配。' }
    ],
    memoryTip: 'cruc（十字）+ ial → 处在十字路口的关键位置，即“至关重要的”。'
  },
  {
    id: 'decline', word: 'decline', phoneticUK: '/dɪˈklaɪn/', phoneticUS: '/dɪˈklaɪn/',
    pos: 'v. / n.', meanings: ['下降，减少', '衰退，衰落', '婉言拒绝'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts'],
    examples: [
      { en: 'Sales declined sharply last quarter.', zh: '上季度销售额急剧下降。' },
      { en: 'She declined my invitation politely.', zh: '她礼貌地拒绝了我的邀请。' }
    ],
    synonyms: ['decrease', 'refuse'], antonyms: ['increase', 'accept'],
    derivatives: ['declining adj. 下降的'],
    collocations: ['on the decline 在衰退中', 'decline to do sth 婉拒做某事'],
    examPoint: '一词多义考点：下降 / 衰退 / 婉拒；作名词常用 on the decline。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'The number of wild animals is on the decline.', note: 'on the decline 固定搭配。' }
    ],
    memoryTip: 'de（向下）+ cline（倾斜）→ 向下倾斜，就是“下降、衰退”。'
  },
  {
    id: 'demonstrate', word: 'demonstrate', phoneticUK: '/ˈdemənstreɪt/', phoneticUS: '/ˈdemənstreɪt/',
    pos: 'v.', meanings: ['证明，论证', '演示，示范', '示威游行'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl'],
    examples: [
      { en: 'The experiment demonstrates that the theory works.', zh: '实验证明该理论是成立的。' }
    ],
    synonyms: ['prove', 'show', 'illustrate'], antonyms: [],
    derivatives: ['demonstration n. 证明；演示；示威', 'demonstrator n. 示威者'],
    collocations: ['demonstrate that... 证明……', 'demonstrate how to do 示范如何做'],
    examPoint: '学术写作高频词：demonstrate 表“证明/展示”，比 show 正式。',
    realExam: [
      { source: 'TOEFL 阅读', sentence: 'Recent studies demonstrate a clear link between sleep and memory.', note: 'demonstrate a link 搭配。' }
    ],
    memoryTip: 'de + monstr（展示）+ ate → 展示出来给人看，就是“证明、演示”。'
  },
  {
    id: 'distinguish', word: 'distinguish', phoneticUK: '/dɪˈstɪŋɡwɪʃ/', phoneticUS: '/dɪˈstɪŋɡwɪʃ/',
    pos: 'v.', meanings: ['区分，辨别', '使杰出'],
    level: 'frequent', exams: ['cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'It is hard to distinguish the twins.', zh: '很难区分这对双胞胎。' }
    ],
    synonyms: ['differentiate', 'discriminate'], antonyms: ['confuse'],
    derivatives: ['distinct adj. 不同的；清晰的', 'distinction n. 差别；卓越'],
    collocations: ['distinguish A from B 区分 A 和 B', 'distinguish between... 在……之间辨别'],
    examPoint: '高频考点：distinguish A from B / distinguish between A and B；与 differentiate 近义。',
    realExam: [
      { source: 'CET-6 阅读', sentence: 'Children learn to distinguish between right and wrong at an early age.', note: 'distinguish between 搭配。' }
    ],
    memoryTip: 'di（分开）+ sting（刺）+ uish → 用刺点把东西分开，即“区分”。'
  },
  {
    id: 'efficient', word: 'efficient', phoneticUK: '/ɪˈfɪʃnt/', phoneticUS: '/ɪˈfɪʃnt/',
    pos: 'adj.', meanings: ['高效的，效率高的', '（人）能干的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts', 'bec'],
    examples: [
      { en: 'The new system is more efficient than the old one.', zh: '新系统比旧系统效率更高。' }
    ],
    synonyms: ['effective', 'productive'], antonyms: ['inefficient'],
    derivatives: ['efficiency n. 效率', 'efficiently adv. 高效地'],
    collocations: ['energy-efficient 节能的', 'efficient use of time 高效利用时间'],
    examPoint: '辨析高频考点：efficient 强调“效率高”，effective 强调“有效果”。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'Online courses allow students to make efficient use of their time.', note: 'efficient use of 搭配。' }
    ],
    memoryTip: 'ef（出）+ fic（做）+ ient → 能把事情做出来且省力，就是“高效的”。'
  },
  {
    id: 'emerge', word: 'emerge', phoneticUK: '/ɪˈmɜːdʒ/', phoneticUS: '/ɪˈmɜːrdʒ/',
    pos: 'v.', meanings: ['出现，浮现', '（事实）显现，暴露'],
    level: 'frequent', exams: ['cet6', 'toefl', 'gre'],
    examples: [
      { en: 'The sun emerged from behind the clouds.', zh: '太阳从云层后露了出来。' },
      { en: 'New evidence has emerged in the case.', zh: '该案件出现了新证据。' }
    ],
    synonyms: ['appear', 'arise'], antonyms: ['disappear', 'vanish'],
    derivatives: ['emergence n. 出现', 'emergency n. 紧急情况'],
    collocations: ['emerge from 从……出现', 'it emerged that... 事实表明……'],
    examPoint: 'it emerged that 句型是新闻/阅读高频表达；emergency（紧急情况）为派生词考点。',
    realExam: [
      { source: 'TOEFL 阅读', sentence: 'New technologies emerged rapidly in the late twentieth century.', note: 'emerge 与 from 连用。' }
    ],
    memoryTip: 'e（出）+ merge（沉）→ 从沉没中出来，就是“浮现”。'
  },
  {
    id: 'emphasize', word: 'emphasize', phoneticUK: '/ˈemfəsaɪz/', phoneticUS: '/ˈemfəsaɪz/',
    pos: 'v.', meanings: ['强调，着重'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'The teacher emphasized the importance of practice.', zh: '老师强调了练习的重要性。' }
    ],
    synonyms: ['stress', 'highlight'], antonyms: [],
    derivatives: ['emphasis n. 强调', 'emphatic adj. 强调的'],
    collocations: ['emphasize the importance of 强调……的重要性', 'lay/put emphasis on 重视'],
    examPoint: '注意动词拼写 emphasize（英式 emphasise）；名词 emphasis 与 on 搭配。',
    realExam: [
      { source: 'CET-4 写作', sentence: 'Schools should emphasize the value of cooperation.', note: 'emphasize + 名词。' }
    ],
    memoryTip: 'em + phas（说）+ ize → 反复说出来，就是“强调”。'
  },
  {
    id: 'enhance', word: 'enhance', phoneticUK: '/ɪnˈhɑːns/', phoneticUS: '/ɪnˈhæns/',
    pos: 'v.', meanings: ['提高，增强，增进'],
    level: 'high_frequency', exams: ['cet6', 'ielts', 'toefl', 'gre'],
    examples: [
      { en: 'Reading widely can enhance your vocabulary.', zh: '广泛阅读可以提高你的词汇量。' }
    ],
    synonyms: ['improve', 'boost', 'strengthen'], antonyms: ['weaken', 'reduce'],
    derivatives: ['enhancement n. 增强，提升'],
    collocations: ['enhance the quality 提升质量', 'enhance awareness 增强意识'],
    examPoint: '雅思写作高频词：enhance 后接 quality/ability/awareness 等抽象名词；与 improve 相比更书面。',
    realExam: [
      { source: 'CET-6 写作', sentence: 'Technology can enhance the learning experience.', note: 'enhance + 抽象名词。' }
    ],
    memoryTip: 'en（使）+ hance（高）→ 使变高，就是“增强、提升”。'
  },
  {
    id: 'essential', word: 'essential', phoneticUK: '/ɪˈsenʃl/', phoneticUS: '/ɪˈsenʃl/',
    pos: 'adj.', meanings: ['必不可少的，极其重要的', '本质的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Water is essential for life.', zh: '水对生命至关重要。' }
    ],
    synonyms: ['vital', 'crucial', 'necessary'], antonyms: ['unnecessary', 'dispensable'],
    derivatives: ['essentially adv. 本质上'],
    collocations: ['be essential for/to 对……必不可少', 'it is essential that...（虚拟语气）'],
    examPoint: '高频考点：it is essential that + 从句用虚拟语气（should + 动词原形）；与 vital/crucial 近义。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'It is essential that students develop independent thinking.', note: '虚拟语气考点。' }
    ],
    memoryTip: 'essence（本质）+ ial → 本质必需的，就是“必不可少的”。'
  },
  {
    id: 'establish', word: 'establish', phoneticUK: '/ɪˈstæblɪʃ/', phoneticUS: '/ɪˈstæblɪʃ/',
    pos: 'v.', meanings: ['建立，设立', '确立，证实'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'The company was established in 1998.', zh: '这家公司成立于 1998 年。' }
    ],
    synonyms: ['found', 'set up', 'create'], antonyms: ['abolish'],
    derivatives: ['establishment n. 建立；机构', 'established adj. 已确立的'],
    collocations: ['establish a relationship 建立关系', 'established fact 既定事实'],
    examPoint: '写作高频词：establish 表“建立”比 set up 正式；表“证实”时与 prove 近义。',
    realExam: [
      { source: 'CET-4 翻译', sentence: 'The university was established more than a century ago.', note: '被动语态常见用法。' }
    ],
    memoryTip: 'e + stabl（稳定）+ ish → 使稳定下来，就是“建立、确立”。'
  },
  {
    id: 'evaluate', word: 'evaluate', phoneticUK: '/ɪˈvæljueɪt/', phoneticUS: '/ɪˈvæljueɪt/',
    pos: 'v.', meanings: ['评估，评价'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl'],
    examples: [
      { en: 'We need to evaluate the results carefully.', zh: '我们需要仔细评估结果。' }
    ],
    synonyms: ['assess', 'estimate'], antonyms: [],
    derivatives: ['evaluation n. 评估', 'evaluative adj. 评价性的'],
    collocations: ['evaluate the impact 评估影响', 'evaluation of 对……的评价'],
    examPoint: '学术场景高频词：与 assess 近义，常出现在研究类文章和图表作文中。',
    realExam: [
      { source: 'IELTS 写作', sentence: 'It is difficult to evaluate the long-term effects of social media.', note: 'evaluate the effects 搭配。' }
    ],
    memoryTip: 'e + valu（价值）+ ate → 衡量价值，就是“评估”。'
  },
  {
    id: 'expand', word: 'expand', phoneticUK: '/ɪkˈspænd/', phoneticUS: '/ɪkˈspænd/',
    pos: 'v.', meanings: ['扩大，扩展', '膨胀'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'The company plans to expand into Asia.', zh: '该公司计划向亚洲扩张。' }
    ],
    synonyms: ['extend', 'enlarge'], antonyms: ['contract', 'shrink'],
    derivatives: ['expansion n. 扩张，膨胀', 'expansive adj. 广阔的'],
    collocations: ['expand the market 开拓市场', 'expand one\'s knowledge 扩充知识'],
    examPoint: '高频考点：expand（扩大范围/体积）与 extend（延伸长度/期限）辨析。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'Trade helps expand people\'s access to goods and services.', note: 'expand access 搭配。' }
    ],
    memoryTip: 'ex（向外）+ pand（展开）→ 向外展开，就是“扩大”。'
  },
  {
    id: 'explore', word: 'explore', phoneticUK: '/ɪkˈsplɔː(r)/', phoneticUS: '/ɪkˈsplɔːr/',
    pos: 'v.', meanings: ['探索，探究', '勘探，考察'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'toefl'],
    examples: [
      { en: 'We explored the old town on foot.', zh: '我们步行探索了这座老城。' }
    ],
    synonyms: ['investigate', 'probe'], antonyms: [],
    derivatives: ['exploration n. 探索', 'explorer n. 探险家'],
    collocations: ['explore the possibility 探讨可能性', 'space exploration 太空探索'],
    examPoint: '注意 explore 是及物动词，直接接宾语；名词 exploration 常见搭配 space/energy exploration。',
    realExam: [
      { source: 'TOEFL 阅读', sentence: 'Scientists continue to explore the depths of the ocean.', note: 'explore + 地点名词。' }
    ],
    memoryTip: 'ex（外）+ plore（喊）→ 喊出去探路，就是“探索”。'
  },
  {
    id: 'identify', word: 'identify', phoneticUK: '/aɪˈdentɪfaɪ/', phoneticUS: '/aɪˈdentɪfaɪ/',
    pos: 'v.', meanings: ['识别，认出', '确定，查明', '认同'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'The police identified the suspect from the video.', zh: '警方通过视频认出了嫌疑人。' }
    ],
    synonyms: ['recognize', 'determine'], antonyms: [],
    derivatives: ['identification n. 识别；身份证明', 'identity n. 身份'],
    collocations: ['identify with 认同；与……产生共鸣', 'identify the problem 找出问题'],
    examPoint: '高频考点：identify with sb（认同某人）；名词 identity（身份）与 identification（识别）辨析。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'The study helps identify factors that affect sleep quality.', note: 'identify + 宾语。' }
    ],
    memoryTip: 'ident（相同）+ ify → 找出相同之处来确认，就是“识别”。'
  },
  {
    id: 'implement', word: 'implement', phoneticUK: '/ˈɪmplɪment/', phoneticUS: '/ˈɪmplɪment/',
    pos: 'v.', meanings: ['实施，执行'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl', 'bec'],
    examples: [
      { en: 'The government will implement the new policy next year.', zh: '政府将在明年实施新政策。' }
    ],
    synonyms: ['carry out', 'execute'], antonyms: [],
    derivatives: ['implementation n. 实施'],
    collocations: ['implement a plan 执行计划', 'implementation of 实施……'],
    examPoint: '商务与学术高频词：implement a policy/plan；名词 implementation 与 of 搭配。',
    realExam: [
      { source: 'BEC 阅读', sentence: 'The manager was responsible for implementing the new system.', note: 'be responsible for + doing。' }
    ],
    memoryTip: 'im + ple（填满）+ ment → 把计划填满落实，就是“实施”。'
  },
  {
    id: 'influence', word: 'influence', phoneticUK: '/ˈɪnfluəns/', phoneticUS: '/ˈɪnfluəns/',
    pos: 'n. / v.', meanings: ['影响', '有影响力的人或事物', '影响，左右'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'Parents have a great influence on their children.', zh: '父母对孩子有很大影响。' }
    ],
    synonyms: ['effect', 'impact'], antonyms: [],
    derivatives: ['influential adj. 有影响力的'],
    collocations: ['have an influence on 对……有影响', 'under the influence of 在……的影响下'],
    examPoint: '高频考点：have an influence/effect on；注意 influence 名词与动词同形。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'Social media has a powerful influence on young people.', note: 'have a(n) ... influence on 搭配。' }
    ],
    memoryTip: 'in（流入）+ flu（流）+ ence → 流入人心的力量，就是“影响”。'
  },
  {
    id: 'maintain', word: 'maintain', phoneticUK: '/meɪnˈteɪn/', phoneticUS: '/meɪnˈteɪn/',
    pos: 'v.', meanings: ['维持，保持', '保养，维修', '坚持认为'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'It is important to maintain a healthy diet.', zh: '保持健康饮食很重要。' }
    ],
    synonyms: ['preserve', 'keep', 'sustain'], antonyms: ['abandon'],
    derivatives: ['maintenance n. 维护，保养'],
    collocations: ['maintain a balance 保持平衡', 'maintain that... 坚持认为……'],
    examPoint: '一词多义考点：保持/保养/坚持认为；名词 maintenance 拼写易错。',
    realExam: [
      { source: 'CET-4 阅读', sentence: 'Regular exercise helps maintain good health.', note: 'maintain + 名词。' }
    ],
    memoryTip: 'main（手）+ tain（握）→ 握在手里不放松，就是“保持、维护”。'
  },
  {
    id: 'obvious', word: 'obvious', phoneticUK: '/ˈɒbviəs/', phoneticUS: '/ˈɑːbviəs/',
    pos: 'adj.', meanings: ['明显的，显而易见的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao'],
    examples: [
      { en: 'It was obvious that he was lying.', zh: '很明显他在撒谎。' }
    ],
    synonyms: ['evident', 'apparent', 'clear'], antonyms: ['subtle', 'obscure'],
    derivatives: ['obviously adv. 显然'],
    collocations: ['it is obvious that... 显而易见……', 'for obvious reasons 出于显而易见的原因'],
    examPoint: 'obviously 常作评注性状语；it is obvious that 为高频句型。',
    realExam: [
      { source: 'CET-4 听力', sentence: 'For obvious reasons, the meeting was postponed.', note: 'for obvious reasons 搭配。' }
    ],
    memoryTip: 'ob（在……前）+ vi（路）→ 摆在大路上谁都看得见，就是“明显的”。'
  },
  {
    id: 'obtain', word: 'obtain', phoneticUK: '/əbˈteɪn/', phoneticUS: '/əbˈteɪn/',
    pos: 'v.', meanings: ['获得，得到'],
    level: 'frequent', exams: ['cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'You need permission to obtain the data.', zh: '你需要获得许可才能获取这些数据。' }
    ],
    synonyms: ['acquire', 'gain', 'get'], antonyms: ['lose'],
    derivatives: ['obtainable adj. 可获得的'],
    collocations: ['obtain information 获取信息', 'obtain a degree 获得学位'],
    examPoint: '正式语体高频词：obtain 比 get 正式；与 acquire 相比更强调“通过努力/程序获得”。',
    realExam: [
      { source: 'IELTS 阅读', sentence: 'Researchers obtained samples from three different sites.', note: 'obtain 用于学术语境。' }
    ],
    memoryTip: 'ob（加强）+ tain（拿住）→ 努力拿住，就是“获得”。'
  },
  {
    id: 'potential', word: 'potential', phoneticUK: '/pəˈtenʃl/', phoneticUS: '/pəˈtenʃl/',
    pos: 'adj. / n.', meanings: ['潜在的，可能的', '潜力，潜能'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts', 'toefl'],
    examples: [
      { en: 'She has great potential as a leader.', zh: '她具备成为领导者的巨大潜力。' }
    ],
    synonyms: ['possible', 'latent'], antonyms: ['actual'],
    derivatives: ['potentially adv. 潜在地'],
    collocations: ['potential risks 潜在风险', 'realize one\'s potential 发挥潜力', 'a potential threat 潜在威胁'],
    examPoint: '高频考点：realize/achieve one\'s potential（发挥潜能）；形容词作定语修饰 risk/threat/customer。',
    realExam: [
      { source: 'CET-6 阅读', sentence: 'AI has the potential to transform many industries.', note: 'have the potential to do 搭配。' }
    ],
    memoryTip: 'potent（有力的）+ ial → 有力但尚未发挥，就是“潜力、潜在的”。'
  },
  {
    id: 'significant', word: 'significant', phoneticUK: '/sɪɡˈnɪfɪkənt/', phoneticUS: '/sɪɡˈnɪfɪkənt/',
    pos: 'adj.', meanings: ['重要的，意义重大的', '显著的，明显的'],
    level: 'high_frequency', exams: ['cet4', 'cet6', 'gaokao', 'ielts'],
    examples: [
      { en: 'There was a significant increase in sales.', zh: '销售额显著增长。' }
    ],
    synonyms: ['important', 'notable', 'considerable'], antonyms: ['insignificant', 'trivial'],
    derivatives: ['significance n. 重要性，意义', 'significantly adv. 显著地'],
    collocations: ['a significant role 重要作用', 'statistically significant 统计显著的'],
    examPoint: '图表作文高频词：significant increase/decrease；名词 significance 与 attach/importance 搭配。',
    realExam: [
      { source: 'CET-4 作文', sentence: 'The Internet plays a significant role in modern education.', note: 'play a significant role in 搭配。' }
    ],
    memoryTip: 'sign（标记）+ fic + ant → 值得做标记的，就是“重要的”。'
  },
  {
    id: 'strategy', word: 'strategy', phoneticUK: '/ˈstrætədʒi/', phoneticUS: '/ˈstrætədʒi/',
    pos: 'n.', meanings: ['战略，策略', '行动计划'],
    level: 'frequent', exams: ['cet6', 'ielts', 'bec'],
    examples: [
      { en: 'The company needs a clear marketing strategy.', zh: '公司需要清晰的营销策略。' }
    ],
    synonyms: ['plan', 'tactic'], antonyms: [],
    derivatives: ['strategic adj. 战略性的'],
    collocations: ['adopt a strategy 采取策略', 'a long-term strategy 长期战略'],
    examPoint: '商务英语高频词：marketing/pricing strategy；tactic 指具体战术，strategy 指整体战略。',
    realExam: [
      { source: 'BEC 阅读', sentence: 'The firm revised its pricing strategy to attract more customers.', note: 'pricing strategy 搭配。' }
    ],
    memoryTip: 'strate（=strat 军队）+ gy → 将军打仗的计谋，就是“战略”。'
  },
  {
    id: 'transform', word: 'transform', phoneticUK: '/trænsˈfɔːm/', phoneticUS: '/trænsˈfɔːrm/',
    pos: 'v.', meanings: ['使改变形态，转变', '改造，变革'],
    level: 'frequent', exams: ['cet6', 'ielts', 'toefl', 'gre'],
    examples: [
      { en: 'The Internet has transformed the way we live.', zh: '互联网改变了我们的生活方式。' }
    ],
    synonyms: ['change', 'convert', 'reshape'], antonyms: ['preserve'],
    derivatives: ['transformation n. 转变，变革', 'transformative adj. 变革性的'],
    collocations: ['transform A into B 把 A 变成 B', 'undergo a transformation 经历变革'],
    examPoint: '写作高频词：transform A into B；与 change 相比强调根本性的改变。',
    realExam: [
      { source: 'CET-6 写作', sentence: 'Digital technology has transformed education worldwide.', note: 'transform + 名词。' }
    ],
    memoryTip: 'trans（改变）+ form（形状）→ 改变形状，就是“转变、变革”。'
  },
  {
    id: 'vital', word: 'vital', phoneticUK: '/ˈvaɪtl/', phoneticUS: '/ˈvaɪtl/',
    pos: 'adj.', meanings: ['至关重要的', '充满活力的'],
    level: 'frequent', exams: ['cet6', 'ielts', 'gre'],
    examples: [
      { en: 'Sleep is vital to good health.', zh: '睡眠对健康至关重要。' }
    ],
    synonyms: ['essential', 'crucial'], antonyms: ['unimportant'],
    derivatives: ['vitality n. 活力'],
    collocations: ['be vital to/for 对……至关重要', 'play a vital role 起关键作用'],
    examPoint: '写作高频词：play a vital role in；it is vital that + 虚拟语气。',
    realExam: [
      { source: 'CET-6 阅读', sentence: 'Trust is vital to any long-term relationship.', note: 'be vital to 搭配。' }
    ],
    memoryTip: 'vit（生命）+ al → 关乎生命的，就是“至关重要的”。'
  }
];

// 紧凑词条：[word, pos, 释义（分号分隔）, level, exams（逗号分隔）]
const compactWords = [
  ['ability', 'n.', '能力；才能', 'high_frequency', 'cet4,cet6,gaokao'],
  ['academic', 'adj.', '学术的；学院的', 'high_frequency', 'cet6,ielts,toefl'],
  ['accompany', 'v.', '陪伴；伴随', 'frequent', 'cet6,gaokao'],
  ['accurate', 'adj.', '准确的；精确的', 'frequent', 'cet6,ielts'],
  ['acknowledge', 'v.', '承认；致谢', 'frequent', 'cet6,gre'],
  ['adjust', 'v.', '调整；适应', 'high_frequency', 'cet4,cet6,gaokao'],
  ['adopt', 'v.', '采纳；收养', 'high_frequency', 'cet4,cet6'],
  ['advance', 'v./n.', '前进；进展；预付', 'high_frequency', 'cet4,cet6,gaokao'],
  ['advantage', 'n.', '优势；有利条件', 'high_frequency', 'cet4,cet6,gaokao'],
  ['affect', 'v.', '影响；感动', 'high_frequency', 'cet4,cet6,gaokao'],
  ['afford', 'v.', '负担得起；提供', 'high_frequency', 'cet4,cet6,gaokao'],
  ['aggressive', 'adj.', '好斗的；有进取心的', 'frequent', 'cet6,toefl'],
  ['ambition', 'n.', '雄心，抱负', 'frequent', 'cet6,gre'],
  ['ancient', 'adj.', '古代的；古老的', 'key', 'cet4,gaokao'],
  ['annual', 'adj.', '每年的，年度的', 'frequent', 'cet6,gaokao'],
  ['anxiety', 'n.', '焦虑；担忧', 'frequent', 'cet6,toefl'],
  ['apparent', 'adj.', '明显的；表面上的', 'frequent', 'cet6,ielts'],
  ['apply', 'v.', '申请；应用；适用', 'high_frequency', 'cet4,cet6,gaokao'],
  ['approve', 'v.', '批准；赞成', 'frequent', 'cet6,gaokao'],
  ['arise', 'v.', '出现；产生；起身', 'frequent', 'cet6,ielts'],
  ['arrange', 'v.', '安排；整理', 'key', 'cet4,gaokao'],
  ['aspect', 'n.', '方面；外观', 'frequent', 'cet6,ielts'],
  ['assess', 'v.', '评估；估价', 'frequent', 'cet6,ielts'],
  ['assign', 'v.', '分配；指派', 'frequent', 'cet6,toefl'],
  ['assist', 'v.', '帮助；协助', 'key', 'cet4,gaokao'],
  ['associate', 'v./n.', '联系；联想；同事', 'frequent', 'cet6,ielts'],
  ['atmosphere', 'n.', '大气；气氛', 'key', 'cet4,gaokao'],
  ['attach', 'v.', '附上；系上；重视', 'frequent', 'cet6,gaokao'],
  ['attempt', 'n./v.', '尝试，企图', 'high_frequency', 'cet4,cet6,gaokao'],
  ['attitude', 'n.', '态度；看法', 'high_frequency', 'cet4,cet6,gaokao'],
  ['attract', 'v.', '吸引；引起', 'high_frequency', 'cet4,cet6,gaokao'],
  ['audience', 'n.', '观众；听众', 'key', 'cet4,gaokao'],
  ['authority', 'n.', '权威；当局；权力', 'frequent', 'cet6,toefl'],
  ['avoid', 'v.', '避免；回避', 'high_frequency', 'cet4,cet6,gaokao'],
  ['aware', 'adj.', '意识到的；知道的', 'high_frequency', 'cet4,cet6,gaokao'],
  ['background', 'n.', '背景；经历', 'key', 'cet4,gaokao'],
  ['balance', 'n./v.', '平衡；结余；使平衡', 'high_frequency', 'cet4,cet6,gaokao'],
  ['barrier', 'n.', '障碍；屏障', 'frequent', 'cet6,ielts'],
  ['behavior', 'n.', '行为；举止', 'frequent', 'cet6,gaokao'],
  ['bias', 'n.', '偏见；倾向', 'frequent', 'toefl,gre'],
  ['budget', 'n.', '预算', 'frequent', 'bec,cet6'],
  ['campaign', 'n.', '运动；活动；战役', 'frequent', 'cet6,gaokao'],
  ['capacity', 'n.', '容量；能力', 'frequent', 'cet6,toefl'],
  ['cautious', 'adj.', '谨慎的；小心的', 'frequent', 'cet6,ielts'],
  ['cease', 'v.', '停止；终止', 'cognition', 'gre,tem8'],
  ['character', 'n.', '性格；角色；汉字', 'key', 'cet4,gaokao'],
  ['claim', 'v./n.', '声称；要求；索赔', 'frequent', 'cet6,ielts'],
  ['clarify', 'v.', '澄清；阐明', 'frequent', 'cet6,ielts'],
  ['classify', 'v.', '分类；归类', 'frequent', 'cet6,toefl'],
  ['climate', 'n.', '气候；风气', 'key', 'cet4,gaokao'],
  ['collapse', 'v./n.', '倒塌；崩溃；暴跌', 'frequent', 'cet6,gre'],
  ['combine', 'v.', '结合；联合', 'high_frequency', 'cet4,cet6,gaokao'],
  ['commercial', 'adj./n.', '商业的；商业广告', 'frequent', 'cet6,bec'],
  ['commit', 'v.', '犯（错误）；承诺；投入', 'frequent', 'cet6,ielts'],
  ['community', 'n.', '社区；群体', 'high_frequency', 'cet4,cet6,gaokao'],
  ['compete', 'v.', '竞争；比赛', 'high_frequency', 'cet4,cet6,gaokao'],
  ['complex', 'adj.', '复杂的；复合的', 'high_frequency', 'cet4,cet6'],
  ['comprehensive', 'adj.', '全面的；综合的', 'frequent', 'cet6,toefl'],
  ['compromise', 'n./v.', '妥协；折中', 'frequent', 'cet6,ielts'],
  ['concentrate', 'v.', '集中；专心', 'high_frequency', 'cet4,cet6,gaokao'],
  ['concern', 'n./v.', '担心；关心；涉及', 'high_frequency', 'cet4,cet6,gaokao'],
  ['conclude', 'v.', '得出结论；结束', 'high_frequency', 'cet4,cet6,gaokao'],
  ['conduct', 'v./n.', '进行；指挥；行为', 'frequent', 'cet6,ielts'],
  ['confident', 'adj.', '自信的；确信的', 'high_frequency', 'cet4,cet6,gaokao'],
  ['confirm', 'v.', '确认；证实', 'high_frequency', 'cet4,cet6'],
  ['conflict', 'n./v.', '冲突；矛盾', 'frequent', 'cet6,gaokao'],
  ['confuse', 'v.', '使困惑；混淆', 'high_frequency', 'cet4,cet6,gaokao'],
  ['connect', 'v.', '连接；联系', 'high_frequency', 'cet4,gaokao'],
  ['conscious', 'adj.', '意识到的；神志清醒的', 'frequent', 'cet6,gre'],
  ['conservative', 'adj./n.', '保守的；保守派', 'frequent', 'cet6,toefl'],
  ['considerable', 'adj.', '相当大的；可观的', 'frequent', 'cet6,gre'],
  ['consist', 'v.', '由……组成；在于', 'high_frequency', 'cet4,cet6'],
  ['constant', 'adj.', '持续的；不变的', 'frequent', 'cet6,ielts'],
  ['construct', 'v.', '建造；构建', 'frequent', 'cet6,toefl'],
  ['consult', 'v.', '咨询；查阅；商量', 'frequent', 'cet6,bec'],
  ['consume', 'v.', '消耗；消费；吃喝', 'frequent', 'cet6,ielts'],
  ['contact', 'n./v.', '联系；接触', 'high_frequency', 'cet4,cet6,gaokao'],
  ['contain', 'v.', '包含；容纳；控制', 'high_frequency', 'cet4,cet6,gaokao'],
  ['contemporary', 'adj.', '当代的；同时代的', 'frequent', 'cet6,toefl'],
  ['convenient', 'adj.', '方便的；便利的', 'high_frequency', 'cet4,gaokao'],
  ['convince', 'v.', '说服；使确信', 'high_frequency', 'cet4,cet6'],
  ['cooperate', 'v.', '合作；配合', 'frequent', 'cet6,bec'],
  ['cope', 'v.', '应对；处理', 'frequent', 'cet6,ielts'],
  ['create', 'v.', '创造；创建', 'high_frequency', 'cet4,cet6,gaokao'],
  ['critical', 'adj.', '批判的；关键的；危急的', 'frequent', 'cet6,ielts'],
  ['culture', 'n.', '文化；教养', 'high_frequency', 'cet4,cet6,gaokao'],
  ['curious', 'adj.', '好奇的；奇特的', 'key', 'cet4,gaokao'],
  ['debate', 'n./v.', '辩论；讨论', 'frequent', 'cet6,ielts'],
  ['decade', 'n.', '十年', 'high_frequency', 'cet4,cet6'],
  ['decrease', 'v./n.', '减少；降低', 'high_frequency', 'cet4,cet6'],
  ['define', 'v.', '定义；界定；明确', 'high_frequency', 'cet4,cet6,ielts'],
  ['demand', 'n./v.', '需求；要求', 'high_frequency', 'cet4,cet6,bec'],
  ['deny', 'v.', '否认；拒绝给予', 'frequent', 'cet6,gaokao'],
  ['depend', 'v.', '依靠；取决于', 'high_frequency', 'cet4,gaokao'],
  ['derive', 'v.', '获得；源于；派生', 'frequent', 'cet6,gre'],
  ['describe', 'v.', '描述；形容', 'high_frequency', 'cet4,gaokao'],
  ['deserve', 'v.', '应得；值得', 'frequent', 'cet6,gaokao'],
  ['despite', 'prep.', '尽管；不管', 'high_frequency', 'cet4,cet6,gaokao'],
  ['determine', 'v.', '决定；确定；测定', 'high_frequency', 'cet4,cet6'],
  ['develop', 'v.', '发展；开发；培养', 'high_frequency', 'cet4,cet6,gaokao'],
  ['device', 'n.', '设备；装置；手段', 'high_frequency', 'cet4,cet6'],
  ['devote', 'v.', '奉献；致力于', 'frequent', 'cet6,gaokao'],
  ['digital', 'adj.', '数字的；数码的', 'frequent', 'cet6,ielts'],
  ['diverse', 'adj.', '多样的；不同的', 'frequent', 'cet6,toefl'],
  ['domestic', 'adj.', '国内的；家庭的', 'frequent', 'cet6,bec'],
  ['dominate', 'v.', '支配；占主导地位', 'frequent', 'cet6,gre'],
  ['dramatic', 'adj.', '戏剧性的；巨大的；显著的', 'frequent', 'cet6,ielts'],
  ['economy', 'n.', '经济；节约', 'high_frequency', 'cet4,cet6,bec'],
  ['effective', 'adj.', '有效的；生效的', 'high_frequency', 'cet4,cet6,ielts'],
  ['effort', 'n.', '努力；尝试', 'high_frequency', 'cet4,cet6,gaokao'],
  ['eliminate', 'v.', '消除；淘汰', 'frequent', 'cet6,gre'],
  ['employ', 'v.', '雇用；使用', 'frequent', 'cet6,bec'],
  ['encounter', 'v./n.', '遭遇；偶遇', 'frequent', 'cet6,gre'],
  ['encourage', 'v.', '鼓励；促进', 'high_frequency', 'cet4,cet6,gaokao'],
  ['endure', 'v.', '忍受；持久', 'frequent', 'cet6,gre'],
  ['engage', 'v.', '从事；参与；吸引', 'frequent', 'cet6,ielts'],
  ['ensure', 'v.', '确保；保证', 'high_frequency', 'cet4,cet6,ielts'],
  ['entire', 'adj.', '整个的；全部的', 'key', 'cet4,gaokao'],
  ['environment', 'n.', '环境', 'high_frequency', 'cet4,cet6,gaokao'],
  ['evidence', 'n.', '证据；迹象', 'high_frequency', 'cet4,cet6,ielts'],
  ['evolve', 'v.', '进化；演变', 'frequent', 'cet6,toefl'],
  ['examine', 'v.', '检查；审查；考试', 'high_frequency', 'cet4,cet6'],
  ['exceed', 'v.', '超过；超出', 'frequent', 'cet6,bec'],
  ['exchange', 'n./v.', '交换；交流；兑换', 'key', 'cet4,gaokao'],
  ['exclude', 'v.', '排除；不包括', 'frequent', 'cet6,gre'],
  ['exhibit', 'v./n.', '展出；表现；展品', 'frequent', 'cet6,toefl'],
  ['expect', 'v.', '期待；预料', 'high_frequency', 'cet4,gaokao'],
  ['expense', 'n.', '费用；开支', 'frequent', 'cet6,bec'],
  ['expert', 'n./adj.', '专家；熟练的', 'high_frequency', 'cet4,cet6'],
  ['explain', 'v.', '解释；说明', 'high_frequency', 'cet4,gaokao'],
  ['expose', 'v.', '暴露；揭露；使接触', 'frequent', 'cet6,toefl'],
  ['extend', 'v.', '延长；扩展；伸出', 'high_frequency', 'cet4,cet6'],
  ['external', 'adj.', '外部的；外界的', 'frequent', 'cet6,gre'],
  ['facility', 'n.', '设施；设备；便利', 'frequent', 'cet6,ielts'],
  ['factor', 'n.', '因素；要素', 'high_frequency', 'cet4,cet6,ielts'],
  ['familiar', 'adj.', '熟悉的；常见的', 'key', 'cet4,gaokao'],
  ['feature', 'n./v.', '特点；以……为特色', 'high_frequency', 'cet4,cet6,ielts'],
  ['finance', 'n./v.', '财政；金融；资助', 'frequent', 'cet6,bec'],
  ['flexible', 'adj.', '灵活的；可变通的', 'frequent', 'cet6,ielts'],
  ['focus', 'v./n.', '集中；焦点', 'high_frequency', 'cet4,cet6,gaokao'],
  ['forecast', 'n./v.', '预报；预测', 'frequent', 'cet6,toefl'],
  ['foundation', 'n.', '基础；基金会', 'frequent', 'cet6,toefl'],
  ['frequent', 'adj.', '频繁的；经常的', 'key', 'cet4,gaokao'],
  ['function', 'n./v.', '功能；运转', 'high_frequency', 'cet4,cet6,toefl'],
  ['fundamental', 'adj.', '基本的；根本的', 'frequent', 'cet6,gre'],
  ['furthermore', 'adv.', '此外；而且', 'key', 'cet6,gaokao'],
  ['generate', 'v.', '产生；引起；发电', 'frequent', 'cet6,ielts'],
  ['genuine', 'adj.', '真实的；真诚的', 'frequent', 'cet6,gre'],
  ['global', 'adj.', '全球的；全面的', 'high_frequency', 'cet4,cet6,ielts'],
  ['gradual', 'adj.', '逐渐的；逐步的', 'frequent', 'cet6,gaokao'],
  ['guarantee', 'v./n.', '保证；担保', 'frequent', 'cet6,bec'],
  ['handle', 'v./n.', '处理；操作；把手', 'key', 'cet4,gaokao'],
  ['harmony', 'n.', '和谐；融洽', 'frequent', 'cet6,gre'],
  ['hesitate', 'v.', '犹豫；踌躇', 'frequent', 'cet6,gaokao'],
  ['highlight', 'v./n.', '突出；强调；亮点', 'frequent', 'cet6,ielts'],
  ['ignore', 'v.', '忽视；不理睬', 'high_frequency', 'cet4,cet6,gaokao'],
  ['illustrate', 'v.', '说明；阐明；配插图', 'frequent', 'cet6,toefl'],
  ['immediate', 'adj.', '立即的；直接的', 'key', 'cet4,cet6'],
  ['impact', 'n./v.', '影响；冲击', 'high_frequency', 'cet4,cet6,ielts'],
  ['imply', 'v.', '暗示；意味着', 'frequent', 'cet6,gre'],
  ['import', 'n./v.', '进口；输入', 'key', 'cet4,bec'],
  ['impress', 'v.', '给……留下印象', 'frequent', 'cet6,gaokao'],
  ['improve', 'v.', '改善；提高', 'high_frequency', 'cet4,gaokao'],
  ['include', 'v.', '包括；包含', 'high_frequency', 'cet4,gaokao'],
  ['income', 'n.', '收入；收益', 'high_frequency', 'cet4,cet6,bec'],
  ['increase', 'v./n.', '增加；增长', 'high_frequency', 'cet4,cet6,gaokao'],
  ['indicate', 'v.', '表明；指示；象征', 'high_frequency', 'cet4,cet6,ielts'],
  ['individual', 'n./adj.', '个人；个别的', 'high_frequency', 'cet4,cet6,toefl'],
  ['industry', 'n.', '工业；行业', 'high_frequency', 'cet4,cet6,bec'],
  ['inform', 'v.', '通知；告知', 'frequent', 'cet6,gaokao'],
  ['initiative', 'n.', '主动性；倡议', 'frequent', 'cet6,bec'],
  ['innovation', 'n.', '创新；革新', 'frequent', 'cet6,toefl'],
  ['inquiry', 'n.', '询问；调查', 'frequent', 'cet6,ielts'],
  ['inspire', 'v.', '鼓舞；激励；启发', 'frequent', 'cet6,gaokao'],
  ['install', 'v.', '安装；任命', 'key', 'cet4,cet6'],
  ['instance', 'n.', '例子；实例', 'frequent', 'cet6,gaokao'],
  ['integrate', 'v.', '整合；融入', 'frequent', 'cet6,toefl'],
  ['intend', 'v.', '打算；想要', 'key', 'cet4,gaokao'],
  ['interact', 'v.', '互动；相互作用', 'frequent', 'cet6,ielts'],
  ['interpret', 'v.', '解释；口译；解读', 'frequent', 'cet6,toefl'],
  ['interrupt', 'v.', '打断；中断', 'key', 'cet4,gaokao'],
  ['invest', 'v.', '投资；投入', 'frequent', 'cet6,bec'],
  ['investigate', 'v.', '调查；研究', 'frequent', 'cet6,toefl'],
  ['involve', 'v.', '涉及；包含；使参与', 'high_frequency', 'cet4,cet6,ielts'],
  ['issue', 'n./v.', '问题；议题；发布', 'high_frequency', 'cet4,cet6,ielts'],
  ['justify', 'v.', '证明……有理；为……辩护', 'frequent', 'cet6,gre'],
  ['knowledge', 'n.', '知识；了解', 'high_frequency', 'cet4,gaokao'],
  ['launch', 'v./n.', '发起；发射；上市', 'frequent', 'cet6,bec'],
  ['legal', 'adj.', '法律的；合法的', 'frequent', 'cet6,bec'],
  ['limit', 'n./v.', '限制；界限', 'high_frequency', 'cet4,cet6,gaokao'],
  ['logic', 'n.', '逻辑；道理', 'frequent', 'cet6,gre'],
  ['major', 'adj./n./v.', '主要的；专业；主修', 'high_frequency', 'cet4,cet6,gaokao'],
  ['manage', 'v.', '管理；设法做到', 'high_frequency', 'cet4,cet6,bec'],
  ['manufacture', 'v./n.', '制造；生产', 'frequent', 'cet6,bec'],
  ['measure', 'v./n.', '测量；措施', 'high_frequency', 'cet4,cet6,gaokao'],
  ['mental', 'adj.', '精神的；智力的', 'key', 'cet4,cet6'],
  ['mention', 'v./n.', '提到；说起', 'key', 'cet4,gaokao'],
  ['method', 'n.', '方法；办法', 'high_frequency', 'cet4,gaokao'],
  ['migrate', 'v.', '迁移；移居', 'frequent', 'toefl,gre'],
  ['minor', 'adj./n.', '较小的；未成年人', 'frequent', 'cet6,gaokao'],
  ['moderate', 'adj.', '适度的；温和的', 'frequent', 'cet6,gre'],
  ['modern', 'adj.', '现代的；新式的', 'key', 'cet4,gaokao'],
  ['monitor', 'v./n.', '监测；监控器', 'frequent', 'cet6,ielts'],
  ['motivate', 'v.', '激励；激发', 'frequent', 'cet6,ielts'],
  ['natural', 'adj.', '自然的；天生的', 'key', 'cet4,gaokao'],
  ['negative', 'adj.', '消极的；否定的；负的', 'high_frequency', 'cet4,cet6,ielts'],
  ['negotiate', 'v.', '谈判；协商', 'frequent', 'cet6,bec'],
  ['normal', 'adj.', '正常的；标准的', 'key', 'cet4,gaokao'],
  ['observe', 'v.', '观察；遵守；评论', 'frequent', 'cet6,toefl'],
  ['occupy', 'v.', '占据；占用；使忙碌', 'frequent', 'cet6,gre'],
  ['occur', 'v.', '发生；出现', 'high_frequency', 'cet4,cet6,gaokao'],
  ['offer', 'v./n.', '提供；报价', 'high_frequency', 'cet4,cet6,bec'],
  ['operate', 'v.', '运转；操作；经营', 'high_frequency', 'cet4,cet6,bec'],
  ['opportunity', 'n.', '机会；时机', 'high_frequency', 'cet4,cet6,gaokao'],
  ['oppose', 'v.', '反对；抵制', 'frequent', 'cet6,gaokao'],
  ['option', 'n.', '选择；选项', 'high_frequency', 'cet4,cet6,gaokao'],
  ['organize', 'v.', '组织；安排', 'high_frequency', 'cet4,cet6,gaokao'],
  ['original', 'adj./n.', '最初的；原创的；原件', 'high_frequency', 'cet4,cet6'],
  ['outcome', 'n.', '结果；成果', 'frequent', 'cet6,ielts'],
  ['overall', 'adj./adv.', '总体的；全面地', 'frequent', 'cet6,ielts'],
  ['participate', 'v.', '参加；参与', 'high_frequency', 'cet4,cet6,ielts'],
  ['particular', 'adj.', '特定的；特别的；讲究的', 'high_frequency', 'cet4,cet6'],
  ['passive', 'adj.', '被动的；消极的', 'frequent', 'cet6,gre'],
  ['perform', 'v.', '执行；表演；表现', 'high_frequency', 'cet4,cet6'],
  ['permit', 'v./n.', '允许；许可证', 'frequent', 'cet6,toefl'],
  ['persist', 'v.', '坚持；持续存在', 'frequent', 'cet6,gre'],
  ['persuade', 'v.', '说服；劝服', 'frequent', 'cet4,gaokao'],
  ['phenomenon', 'n.', '现象', 'frequent', 'cet6,toefl'],
  ['policy', 'n.', '政策；方针', 'high_frequency', 'cet4,cet6,bec'],
  ['positive', 'adj.', '积极的；肯定的；正面的', 'high_frequency', 'cet4,cet6,ielts'],
  ['precise', 'adj.', '精确的；准确的', 'frequent', 'cet6,gre'],
  ['predict', 'v.', '预测；预言', 'high_frequency', 'cet4,cet6,ielts'],
  ['prefer', 'v.', '更喜欢；宁愿', 'key', 'cet4,gaokao'],
  ['pressure', 'n.', '压力；压强', 'high_frequency', 'cet4,cet6,gaokao'],
  ['prevent', 'v.', '阻止；防止', 'high_frequency', 'cet4,cet6,gaokao'],
  ['previous', 'adj.', '以前的；先前的', 'high_frequency', 'cet4,cet6,gaokao'],
  ['primary', 'adj.', '主要的；初级的', 'frequent', 'cet6,ielts'],
  ['principle', 'n.', '原则；原理', 'frequent', 'cet6,toefl'],
  ['priority', 'n.', '优先事项；优先权', 'frequent', 'cet6,bec'],
  ['procedure', 'n.', '程序；步骤', 'frequent', 'cet6,bec'],
  ['process', 'n./v.', '过程；处理', 'high_frequency', 'cet4,cet6,bec'],
  ['produce', 'v./n.', '生产；产生；农产品', 'high_frequency', 'cet4,cet6,bec'],
  ['professional', 'adj./n.', '专业的；职业的；专业人士', 'high_frequency', 'cet4,cet6,bec'],
  ['profit', 'n./v.', '利润；获益', 'frequent', 'cet6,bec'],
  ['progress', 'n./v.', '进步；进展', 'high_frequency', 'cet4,gaokao'],
  ['promote', 'v.', '促进；提升；推广', 'high_frequency', 'cet4,cet6,bec'],
  ['proportion', 'n.', '比例；部分', 'frequent', 'cet6,ielts'],
  ['propose', 'v.', '提议；求婚；打算', 'frequent', 'cet6,toefl'],
  ['prospect', 'n.', '前景；可能性', 'frequent', 'cet6,gre'],
  ['protect', 'v.', '保护；防护', 'key', 'cet4,gaokao'],
  ['provide', 'v.', '提供；供应', 'high_frequency', 'cet4,cet6,gaokao'],
  ['publish', 'v.', '出版；发表；公布', 'frequent', 'cet6,gaokao'],
  ['purchase', 'v./n.', '购买；采购', 'frequent', 'cet6,bec'],
  ['pursue', 'v.', '追求；从事；追赶', 'frequent', 'cet6,ielts'],
  ['qualify', 'v.', '取得资格；使合格', 'frequent', 'cet6,ielts'],
  ['quantity', 'n.', '数量；大量', 'key', 'cet4,bec'],
  ['range', 'n./v.', '范围；幅度；排列', 'high_frequency', 'cet4,cet6,ielts'],
  ['rapid', 'adj.', '迅速的；快速的', 'key', 'cet4,gaokao'],
  ['rate', 'n./v.', '比率；速度；评价', 'high_frequency', 'cet4,cet6,bec'],
  ['react', 'v.', '反应；起化学反应', 'frequent', 'cet6,gaokao'],
  ['realistic', 'adj.', '现实的；逼真的', 'frequent', 'cet6,ielts'],
  ['recognize', 'v.', '认出；承认；认可', 'high_frequency', 'cet4,cet6,gaokao'],
  ['recommend', 'v.', '推荐；建议', 'high_frequency', 'cet4,cet6,gaokao'],
  ['recover', 'v.', '恢复；康复；收回', 'frequent', 'cet6,gaokao'],
  ['reduce', 'v.', '减少；降低', 'high_frequency', 'cet4,cet6,gaokao'],
  ['refer', 'v.', '提到；参考；涉及', 'high_frequency', 'cet4,cet6,ielts'],
  ['reflect', 'v.', '反映；反射；思考', 'high_frequency', 'cet4,cet6,ielts'],
  ['regard', 'v./n.', '认为；看待；尊重', 'frequent', 'cet6,ielts'],
  ['region', 'n.', '地区；区域', 'key', 'cet4,cet6'],
  ['register', 'v./n.', '注册；登记', 'frequent', 'cet6,bec'],
  ['regular', 'adj.', '定期的；规则的', 'key', 'cet4,gaokao'],
  ['regulate', 'v.', '管理；调节；控制', 'frequent', 'cet6,gre'],
  ['reject', 'v.', '拒绝；排斥；否决', 'frequent', 'cet6,toefl'],
  ['relate', 'v.', '联系；有关；叙述', 'frequent', 'cet6,ielts'],
  ['release', 'v./n.', '释放；发布；发行', 'frequent', 'cet6,bec'],
  ['relevant', 'adj.', '相关的；切题的', 'frequent', 'cet6,ielts'],
  ['reliable', 'adj.', '可靠的；可信赖的', 'frequent', 'cet6,ielts'],
  ['relief', 'n.', '宽慰；缓解；救济', 'frequent', 'cet6,gre'],
  ['rely', 'v.', '依赖；依靠', 'frequent', 'cet6,ielts'],
  ['remain', 'v.', '保持；剩余；留下', 'high_frequency', 'cet4,cet6,gaokao'],
  ['remark', 'n./v.', '评论；言论', 'frequent', 'cet6,gre'],
  ['remove', 'v.', '移除；脱掉；开除', 'high_frequency', 'cet4,cet6,gaokao'],
  ['represent', 'v.', '代表；象征；描绘', 'frequent', 'cet6,toefl'],
  ['require', 'v.', '需要；要求', 'high_frequency', 'cet4,cet6,gaokao'],
  ['research', 'n./v.', '研究；调查', 'high_frequency', 'cet4,cet6,ielts'],
  ['reserve', 'v./n.', '预订；保留；储备', 'frequent', 'cet6,bec'],
  ['resource', 'n.', '资源；财力', 'high_frequency', 'cet4,cet6,ielts'],
  ['respond', 'v.', '回应；反应', 'high_frequency', 'cet4,cet6,ielts'],
  ['responsible', 'adj.', '负责的；有责任的', 'high_frequency', 'cet4,cet6,gaokao'],
  ['restore', 'v.', '恢复；修复；归还', 'frequent', 'cet6,gre'],
  ['restrict', 'v.', '限制；约束', 'frequent', 'cet6,toefl'],
  ['result', 'n./v.', '结果；导致', 'high_frequency', 'cet4,cet6,gaokao'],
  ['retain', 'v.', '保持；保留；记住', 'frequent', 'cet6,gre'],
  ['reveal', 'v.', '揭示；透露；展现', 'frequent', 'cet6,ielts'],
  ['revenue', 'n.', '收入；税收', 'frequent', 'cet6,bec'],
  ['reward', 'n./v.', '奖励；报酬；奖赏', 'frequent', 'cet6,gaokao'],
  ['risk', 'n./v.', '风险；冒险', 'high_frequency', 'cet4,cet6,ielts'],
  ['routine', 'n./adj.', '常规；例行公事', 'frequent', 'cet6,ielts'],
  ['satisfy', 'v.', '使满意；满足', 'key', 'cet4,gaokao'],
  ['scale', 'n.', '规模；刻度；比例', 'frequent', 'cet6,toefl'],
  ['schedule', 'n./v.', '日程表；安排', 'key', 'cet4,bec'],
  ['secure', 'adj./v.', '安全的；获得；固定', 'frequent', 'cet6,bec'],
  ['select', 'v.', '选择；挑选', 'high_frequency', 'cet4,cet6,gaokao'],
  ['significant', 'adj.', '重要的；显著的', 'high_frequency', 'cet4,cet6,ielts'],
  ['similar', 'adj.', '相似的；类似的', 'high_frequency', 'cet4,gaokao'],
  ['simplify', 'v.', '简化；使简单', 'frequent', 'cet6,gaokao'],
  ['situation', 'n.', '情况；形势', 'high_frequency', 'cet4,cet6,gaokao'],
  ['skilled', 'adj.', '熟练的；有技能的', 'key', 'cet4,gaokao'],
  ['solution', 'n.', '解决办法；溶液', 'high_frequency', 'cet4,cet6,gaokao'],
  ['solve', 'v.', '解决；解答', 'high_frequency', 'cet4,gaokao'],
  ['somewhat', 'adv.', '有点；稍微', 'frequent', 'cet6,gre'],
  ['source', 'n.', '来源；出处；源头', 'high_frequency', 'cet4,cet6,ielts'],
  ['specific', 'adj.', '具体的；特定的', 'high_frequency', 'cet4,cet6,ielts'],
  ['standard', 'n./adj.', '标准；标准的', 'high_frequency', 'cet4,cet6,gaokao'],
  ['status', 'n.', '地位；身份；状态', 'frequent', 'cet6,bec'],
  ['stimulate', 'v.', '刺激；激励；促进', 'frequent', 'cet6,gre'],
  ['strengthen', 'v.', '加强；巩固', 'frequent', 'cet6,gaokao'],
  ['structure', 'n./v.', '结构；构建', 'high_frequency', 'cet4,cet6,toefl'],
  ['subject', 'n./adj.', '主题；学科；受……支配的', 'frequent', 'cet4,cet6'],
  ['submit', 'v.', '提交；屈服', 'frequent', 'cet6,bec'],
  ['subsequent', 'adj.', '随后的；后来的', 'frequent', 'cet6,gre'],
  ['substitute', 'n./v.', '替代品；代替', 'frequent', 'cet6,gre'],
  ['sufficient', 'adj.', '足够的；充分的', 'frequent', 'cet6,ielts'],
  ['suggest', 'v.', '建议；表明；暗示', 'high_frequency', 'cet4,cet6,gaokao'],
  ['superior', 'adj./n.', '更好的；上级', 'frequent', 'cet6,gre'],
  ['supply', 'n./v.', '供应；供给', 'high_frequency', 'cet4,cet6,bec'],
  ['support', 'v./n.', '支持；支撑；供养', 'high_frequency', 'cet4,cet6,gaokao'],
  ['suppose', 'v.', '假设；认为', 'key', 'cet4,gaokao'],
  ['survey', 'n./v.', '调查；测量；俯瞰', 'frequent', 'cet6,ielts'],
  ['survive', 'v.', '幸存；存活；挺过', 'frequent', 'cet6,toefl'],
  ['sustain', 'v.', '维持；支撑；遭受', 'frequent', 'cet6,gre'],
  ['symbol', 'n.', '象征；符号', 'key', 'cet4,gaokao'],
  ['technique', 'n.', '技术；技巧', 'high_frequency', 'cet4,cet6,toefl'],
  ['technology', 'n.', '科技；技术', 'high_frequency', 'cet4,cet6,gaokao'],
  ['temporary', 'adj.', '临时的；暂时的', 'frequent', 'cet6,gaokao'],
  ['tend', 'v.', '倾向于；照料', 'high_frequency', 'cet4,cet6,ielts'],
  ['tension', 'n.', '紧张；压力；张力', 'frequent', 'cet6,gre'],
  ['theory', 'n.', '理论；学说', 'high_frequency', 'cet4,cet6,toefl'],
  ['threaten', 'v.', '威胁；恐吓', 'frequent', 'cet6,gaokao'],
  ['tradition', 'n.', '传统；惯例', 'high_frequency', 'cet4,cet6,gaokao'],
  ['transfer', 'v./n.', '转移；调动；换乘', 'frequent', 'cet6,bec'],
  ['trend', 'n.', '趋势；潮流', 'high_frequency', 'cet4,cet6,ielts'],
  ['unique', 'adj.', '独特的；唯一的', 'high_frequency', 'cet4,cet6,toefl'],
  ['update', 'v./n.', '更新；最新消息', 'key', 'cet4,cet6,bec'],
  ['urban', 'adj.', '城市的；都市的', 'frequent', 'cet6,toefl'],
  ['urgent', 'adj.', '紧急的；急迫的', 'frequent', 'cet6,bec'],
  ['valid', 'adj.', '有效的；正当的', 'frequent', 'cet6,gre'],
  ['vary', 'v.', '变化；不同', 'frequent', 'cet6,ielts'],
  ['version', 'n.', '版本；说法', 'high_frequency', 'cet4,cet6,gaokao'],
  ['virtual', 'adj.', '虚拟的；实际上的', 'frequent', 'cet6,toefl'],
  ['vision', 'n.', '视力；视野；愿景', 'frequent', 'cet6,gre'],
  ['voluntary', 'adj.', '自愿的；志愿的', 'frequent', 'cet6,toefl'],
  ['widespread', 'adj.', '广泛的；普遍的', 'frequent', 'cet6,gre'],
  ['witness', 'n./v.', '目击者；见证', 'frequent', 'cet6,toefl'],
  ['yield', 'v./n.', '产生；屈服；产量', 'frequent', 'cet6,gre'],
  ['zone', 'n.', '地区；地带', 'key', 'cet4,toefl']
];

const LEVEL_LABELS = {
  high_frequency: '高频词汇',
  frequent: '常考词汇',
  key: '重点词汇',
  cognition: '认知词汇'
};

function buildCompact([word, pos, meanings, level, exams]) {
  return {
    id: word,
    word,
    phoneticUK: '',
    phoneticUS: '',
    pos,
    meanings: meanings.split('；'),
    level,
    exams: exams.split(','),
    examples: [],
    synonyms: [],
    antonyms: [],
    derivatives: [],
    collocations: [],
    examPoint: '',
    realExam: [],
    memoryTip: ''
  };
}

const detailedIds = new Set(detailedWords.map((w) => w.id));
const words = [
  ...detailedWords,
  ...compactWords.map(buildCompact).filter((w) => !detailedIds.has(w.id))
];

// 词组短语种子
const phrases = [
  { id: 'p-account-for', phrase: 'account for', meaning: '说明（原因）；占（比例）', level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts'], example: 'Online sales account for half of the company’s revenue.' },
  { id: 'p-apply-for', phrase: 'apply for', meaning: '申请', level: 'high_frequency', exams: ['cet4', 'gaokao'], example: 'She applied for a scholarship last month.' },
  { id: 'p-break-down', phrase: 'break down', meaning: '出故障；崩溃；分解', level: 'high_frequency', exams: ['cet4', 'cet6'], example: 'The car broke down on the highway.' },
  { id: 'p-bring-about', phrase: 'bring about', meaning: '导致，引起', level: 'frequent', exams: ['cet6', 'ielts'], example: 'Technology has brought about great changes.' },
  { id: 'p-call-off', phrase: 'call off', meaning: '取消', level: 'frequent', exams: ['cet4', 'cet6'], example: 'The match was called off because of rain.' },
  { id: 'p-carry-out', phrase: 'carry out', meaning: '执行，实施', level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts'], example: 'The survey was carried out among college students.' },
  { id: 'p-come-up-with', phrase: 'come up with', meaning: '想出，提出', level: 'frequent', exams: ['cet4', 'cet6'], example: 'He came up with a brilliant idea.' },
  { id: 'p-deal-with', phrase: 'deal with', meaning: '处理，应对', level: 'high_frequency', exams: ['cet4', 'gaokao'], example: 'We must deal with the problem immediately.' },
  { id: 'p-give-up', phrase: 'give up', meaning: '放弃', level: 'high_frequency', exams: ['cet4', 'gaokao'], example: 'Never give up on your dreams.' },
  { id: 'p-look-forward-to', phrase: 'look forward to', meaning: '期待，盼望', level: 'high_frequency', exams: ['cet4', 'gaokao'], example: 'I look forward to hearing from you.' },
  { id: 'p-make-up-for', phrase: 'make up for', meaning: '弥补，补偿', level: 'frequent', exams: ['cet6', 'ielts'], example: 'Hard work cannot make up for a lack of talent.' },
  { id: 'p-put-off', phrase: 'put off', meaning: '推迟，拖延', level: 'frequent', exams: ['cet4', 'cet6'], example: 'Don’t put off until tomorrow what you can do today.' },
  { id: 'p-rely-on', phrase: 'rely on', meaning: '依靠，依赖', level: 'frequent', exams: ['cet6', 'ielts'], example: 'You can rely on her to finish the job.' },
  { id: 'p-result-in', phrase: 'result in', meaning: '导致，造成', level: 'high_frequency', exams: ['cet4', 'cet6', 'ielts'], example: 'Careless driving can result in serious accidents.' },
  { id: 'p-take-part-in', phrase: 'take part in', meaning: '参加', level: 'high_frequency', exams: ['cet4', 'gaokao'], example: 'All students took part in the activity.' },
  { id: 'p-turn-out', phrase: 'turn out', meaning: '结果是；生产；关掉', level: 'frequent', exams: ['cet6', 'gaokao'], example: 'The party turned out to be a great success.' }
];

module.exports = { words, phrases, LEVEL_LABELS };
