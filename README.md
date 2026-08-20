# SmartVocab 多平台自适应英语学习工具

基于考纲单词学习与题目单词智能识别（OCR）的响应式英语词汇学习网站 MVP。

## 功能

- 考纲范围选择：国内考试（四六级/高考/中考）、出国考试（雅思/托福/GRE/GMAT）、专业考试（专四/专八/BEC），支持考纲版本
- 单词学习：发音（英/美）、词性释义、例句、同反义词、派生词、考点解析、真题示例、记忆技巧
- 题目单词智能识别：拍照 / 相册导入，印刷体 OCR，自动提取单词并按考纲筛选、按重要程度分类
- 识别历史与去重：每次识别自动记录，历史条目可点击查看对应完整识别结果；30 分钟窗口内重复内容自动拦截并提示（可强制重识别）；历史按窗口自动清理、可手动清空
- 识别结果筛选：顶部可伸缩设置条按词类（高频/常考/重点/认知）与词组显示开关过滤结果，选择本地持久化
- 结果自动过滤：未收录 / 超出所选考纲的词汇自动过滤，仅展示考纲内已收录词，保证识别结果准确
- 个性化生词本：加入生词本 / 已掌握 / 收藏，遗忘曲线复习提醒，间隔重复
- 智能测验：拼写、词义匹配、听力辨词、真题模拟

## 技术栈

- 前端：React 18 + Vite + Tailwind CSS + React Router（PWA 支持）
- 后端：Node.js + Express + multer + tesseract.js（OCR）
- 数据：JSON 文件存储（`server/data/db.json`，首次启动自动由种子数据生成）

## 实现状态（MVP）

需求文档中的核心链路均已落地，种子数据规模为 11 个考纲 / 400 个单词 / 16 个词组：

| 需求模块 | 实现情况 |
| --- | --- |
| 考纲范围选择 | ✅ 11 类考纲 + 版本、简介、适用人群、词库统计 |
| 考纲单词体系 | ✅ 高频/常考/重点/认知四级分类，发音、释义、例句、同反义、派生、词组 |
| 题目单词智能识别 | ✅ 拍照（getUserMedia）/ 相册导入 / 粘贴文本；客户端预处理（灰度/对比度/去噪）+ Tesseract OCR + 考纲匹配分类 |
| 个性化单词管理 | ✅ 生词本/已掌握/收藏、错题自动收集、进度统计 |
| 单词详情与考法解析 | ✅ 考点解析、真题示例、记忆技巧、同根/同义词联想、易混搭配、相关词组 |
| 智能考试与记忆 | ✅ 四种测验 + 艾宾浩斯间隔重复（1/2/4/7/15/30 天） |
| 多平台自适应 | ✅ 响应式布局（手机底部导航/桌面顶栏）+ PWA（manifest + Service Worker） |

## 多数据源词库合并

`npm run merge:vocab` 将三个开源词库统一合并为 `server/src/seed/words_merged.js`：

1. **english-vocabulary**（[GitHub](https://github.com/zhenghaoyang24/english-vocabulary)，10.4 万词 / 14.2 万例句）：
   通过词书关联反查考纲，中英文关键词模糊匹配（如「四级」/「CET4」）
2. **dict-master**（有道背单词词书 dump，81 本 zip）：仅处理映射到 11 个允许考纲的词书
   （CET4/CET6/KaoYan/IELTS/TOEFL/GRE/GMAT/BEC/Level4/Level8/GaoZhong），
   SAT、初中、小学等词书整本跳过；提供音标、释义、例句、同反义词、派生词、短语
3. **cet6-vocabulary**（六级真题高频词 CSV + 简洁版词义表）：标记为 `cet6` 考纲，
   自动过滤 `filter_reason` 标注的低价值词条

统一规则：强制性 11 考纲筛选 → 词性提取 / 频率分级（★★★/★★/★/认知）→ 跨词书考纲标签取并集 →
与现有 `words.js` 按 word 去重（不覆盖原文件）。数据源目录可用 `SOURCE_DIR` 环境变量指定。

当前合并结果：**23,738 词**（含中考在内 12 个考纲全覆盖），其中 19,443 词含例句、15,000+ 词跨多个考纲；
各考纲覆盖：tem8 12,021 / toefl 10,234 / gre 9,882 / ielts 7,124 / cet6 6,799 / gaokao 6,372 /
cet4 4,965 / tem4 4,082 / gmat 3,125 / zhongkao 3,011 / bec 2,594。

质量治理：六级高频词缺失的中文释义通过**全量释义词典回填**（english-vocabulary 全量 10.4 万词 +
dict-master 全部 81 本词书）+ **词头规范化**（focu→focus、broader→broad）完成，
词库零空释义；无法识别为有效词头的碎片/专有名词（txt、ffi、beethoven 等 397 条）已剔除。
中考词库接入 dict-master 全部 14 本初中词书（有道/人教版/外研社），并通过**跨源考纲标签合并**
（如 study 同时属于 kaoyan/ielts/zhongkao 等）解决基础词丢失中考标签的问题。

### 已接入应用

应用启动时由 `server/src/seed/mergedAdapter.js` 将 `words_merged.js` 自动转换为运行时词库结构
（`phoneticUK/US`、`meanings` 字符串数组、`exams`、`level` 频率映射），与现有 `words.js`
合并后共 **24,138 词**，考纲选择、单词列表/详情、拍照识别匹配、生词本、测验全部基于该词库。
`db.json` 仅持久化用户状态（生词本/测验记录），词库每次启动从种子重建。

数据回流：与精编词条重复而跳过的开源数据（例句/同反义词/派生词/搭配/真题例句）由合并脚本
截获为 `words_merged_enrich.js`，运行时经 `enrichCuratedWords` 并回精编词条
（如 abandon 的例句 2→7 条、同义词 2→6 个、新增真题例句）。

### 识别历史与重复检测

- 每次识别（文本/图片）都会记录到 `recognitionHistory`，摘要含引擎、考纲、匹配词与原文
- 历史条目可点击查看该次完整识别结果：`GET /api/recognition/history/:id` 用记录的完整原文
  + 当前词库/生词本状态重新提取，返回与实时识别一致的结构（不保存完整分组结果，避免 db.json 膨胀）
- 去重采用内容哈希：图片按字节哈希（同一图片免重复 OCR）、文本按规范化内容哈希（忽略大小写/空白），
  并与考纲组合成键；默认 30 分钟窗口（`RECOGNITION_DEDUP_WINDOW_MIN` 可调），
  窗口内重复返回 `duplicate: true` 并附上次结果摘要，前端提示「仍要重新识别」（`force=true` 绕过）
- 清理策略：超出时间窗口的记录自动删除，总条数上限 100（`RECOGNITION_HISTORY_MAX`），
  服务重启时仅保留近 7 天记录；OCR 失败回退的演示文本不做文本级去重，避免不同图片误判重复

### 考纲词汇判断标准

识别结果仅展示**考纲内已收录词汇**：词条存在于合并词库（`words.js` 精编 400 词 +
`words_merged.js` 合并 23,738 词，数据源为 english-vocabulary / dict-master / cet6-vocabulary），
且其 `exams` 包含所选考纲标识；未收录或不在考纲内的词自动过滤，不进入识别结果。

## 已知边界（后续迭代方向）

- 种子词库为高质量示例数据（约 400 词），正式词库可按考纲版本批量导入（词条结构见 `server/src/seed/words.js`）
- 六级高频词释义已通过词典回填全部补齐（零空释义）；极少数真实新词（如 mindset/smartphone）因词典未收录而被剔除，后续可人工补录
- 无频率数据的词条默认归入「重点」级别（已按规则执行）；中考词库来自 14 本初中词书（3,011 词）
- 真题例句覆盖约 478 个词（有道词书真题例句 + 六级真题高频词 CSV），相比原 40 词已大幅扩展，仍可结合真题解析库继续扩充
- 当前为单用户本地存储（无登录体系）；正式上线需接入用户系统与 MongoDB/MySQL
- OCR 使用本地 Tesseract，首次识别会下载英文语言包；生产环境可替换为百度/腾讯/Google OCR API（`server/src/services/ocr.js` 是唯一接入点）
- 测验答案目前由客户端校验；正式上线应在服务端出题与判分，避免被前端篡改
- 记忆算法已实现间隔调度，推送提醒可接入 Web Push / 第三方推送服务

## 快速开始

```bash
npm run install:all   # 安装根/服务端/前端依赖
npm run dev           # 同时启动后端(:4000)与前端(:5173)
```

打开 http://localhost:5173。

> 说明：OCR 默认优先使用 tesseract.js 本地识别；首次识别会下载英文语言包（需网络）。若 OCR 引擎不可用或未安装，服务会自动回退到演示文本，不影响流程体验。`POST /api/recognition` 支持 `mockText` 字段直接传入题目文本用于测试。

## 目录结构

```
├── server/          # Express 后端
│   ├── src/
│   │   ├── index.js          # 入口
│   │   ├── db.js             # JSON 数据存储
│   │   ├── seed/             # 种子数据（考纲、词库、词组）
│   │   ├── routes/           # 路由
│   │   └── services/         # OCR、提取匹配、记忆算法
│   └── data/                 # 运行时数据（自动生成）
└── client/          # React 前端
    └── src/
        ├── pages/            # 页面
        ├── components/       # 组件
        └── api.js            # API 封装
```

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/syllabi` | 考纲列表（含版本、简介、适用人群） |
| GET | `/api/words?syllabus=&level=&q=` | 单词列表/搜索 |
| GET | `/api/words/:id` | 单词详情 |
| POST | `/api/recognition` | 图片 OCR + 考纲匹配（multipart，字段 `image`；可带 `mockText`） |
| GET | `/api/recognition/history` | 识别历史列表（窗口内去重记录摘要） |
| DELETE | `/api/recognition/history` | 清空识别历史 |
| GET/POST | `/api/wordbook` | 生词本（新增/查询/标记） |
| PATCH | `/api/wordbook/:id` | 修改标记（new/mastered/favorite） |
| DELETE | `/api/wordbook/:id` | 移除 |
| GET | `/api/review/due` | 到期复习单词 |
| POST | `/api/review/complete` | 完成一次复习（结果 again/good/easy） |
| GET | `/api/quiz?type=&syllabus=` | 生成测验 |
| POST | `/api/quiz/answer` | 提交答案 |
