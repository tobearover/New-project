# SmartVocab 多平台自适应英语学习工具

基于考纲单词学习与题目单词智能识别（OCR）的响应式英语词汇学习网站 MVP。

## 功能

- 考纲范围选择：国内考试（四六级/高考/中考）、出国考试（雅思/托福/GRE/GMAT）、专业考试（专四/专八/BEC），支持考纲版本
- 单词学习：发音（英/美）、词性释义、例句、同反义词、派生词、考点解析、真题示例、记忆技巧
- 题目单词智能识别：拍照 / 相册导入，印刷体 OCR，自动提取单词并按考纲筛选、按重要程度分类
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

当前合并结果：**23,927 词**（11 个考纲全覆盖），其中 19,646 词含例句、11,196 词跨多个考纲；
各考纲覆盖：gre 7,180 / toefl 6,922 / kaoyan 6,668 / ielts 6,331 / tem8 5,552 / cet4 3,472 /
gaokao 2,203 / cet6 2,115 / tem4 1,375 / gmat 1,309 / bec 745。

## 已知边界（后续迭代方向）

- 种子词库为高质量示例数据（约 400 词），正式词库可按考纲版本批量导入（词条结构见 `server/src/seed/words.js`）
- `words_merged.js` 使用新结构（`phonetic_uk`、`meanings` 对象、`syllabus` 数组），与运行时词库结构不同，接入应用前需适配层
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
| GET/POST | `/api/wordbook` | 生词本（新增/查询/标记） |
| PATCH | `/api/wordbook/:id` | 修改标记（new/mastered/favorite） |
| DELETE | `/api/wordbook/:id` | 移除 |
| GET | `/api/review/due` | 到期复习单词 |
| POST | `/api/review/complete` | 完成一次复习（结果 again/good/easy） |
| GET | `/api/quiz?type=&syllabus=` | 生成测验 |
| POST | `/api/quiz/answer` | 提交答案 |
