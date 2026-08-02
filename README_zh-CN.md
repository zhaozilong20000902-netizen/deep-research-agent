# 徐州经贸教学研创智能体

面向江苏省徐州经贸高等职业学校教师的教材分析与教学活动设计 Agent。教师可以上传教材 PDF、Word、PPT 或文本材料，结合联网搜索生成教学灵感、课堂任务、评价量规或符合学校模板结构的课程授课教案。

**Framework:** OpenAI Agents SDK · **Category:** Research · **Language:** TypeScript

## 概述

本项目不是通用聊天机器人。它运行一条教师主导的研创管线：先采集真实教学情境，再把课堂问题拆解为待核验事项，从开放网络与学术数据库收集依据，最后生成目标、活动、证据与评价对齐的教学活动包。教师可继续讨论并进行版本化优化。

- **真实教学画像**：课程、教学主题、课时、班额、学情、教学框架、材料和约束独立录入，不把关键信息埋在聊天里。
- **教材文件读取**：在浏览器中提取 PDF、DOCX、PPTX、TXT 和 Markdown 的文字，原文件不直接上传。
- **学校格式教案**：按照“教案首页 + 七列表格教学设计”的徐州经贸模板生成，可导出 A4 宋体 Word 文件。
- **多种教学成果**：支持教学灵感、学校格式教案、教学能力大赛优化、课堂活动与任务单、评价任务与量规。
- **教师确认式拆解**：围绕学情难点、教学依据、目标与评价对齐、课堂风险生成调查问题，教师确认后才继续。
- **双源证据检索**：联网搜索（腾讯云 Web Search API）与学术搜索（CrossRef + Semantic Scholar）共同支撑设计理由。
- **课堂可执行交付**：固定输出教学任务画像、依据、目标与达成证据、分时流程、活动脚本、分层评价、应变方案和教师行动清单。
- **证据红线**：禁止编造学生数据、课堂成效、政策条文、课程标准、企业案例和文献；信息缺失时明确标记“待教师确认”。
- **版本化迭代**：教学活动包按项目保存，支持历史版本、差异对比、回滚和后续精修。

## 环境变量

| 变量 | 必填 | 说明 |
|----------|----------|-------------|
| `AI_GATEWAY_API_KEY` | 是 | 模型网关 API Key。使用 Makers Models 的 API Key，或任何兼容 OpenAI 协议的提供商 Key。 |
| `AI_GATEWAY_BASE_URL` | 是 | 网关基础地址。使用 Makers Models 时填写 `https://ai-gateway.edgeone.link/v1`。 |
| `AI_GATEWAY_MODEL` | 否 | 模型 ID，默认为 `@makers/deepseek-v4-flash`。 |
| `WSA_API_KEY` | 否 | 腾讯云 Web Search API（WSA）Key，用于平台内置 `web_search` 工具。未配置时联网搜索将回退到稳定性较差的方案。 |

本模板遵循 OpenAI 兼容标准，可指向 Makers Models 或任何兼容提供商。

### 如何获取 AI_GATEWAY_API_KEY

1. 打开 Makers 控制台（https://edgeone.ai/makers/new?s_url=https://console.tencentcloud.com/edgeone/makers）
2. 登录并启用 Makers
3. 进入 Makers → Models → API Key，创建 Key
4. 将其填入 `AI_GATEWAY_API_KEY`

> 内置模型在额度内免费，适合验证；生产环境请绑定自费厂商 Key（BYOK）。

### 如何获取 WSA_API_KEY

1. 在腾讯云 WSA 控制台（https://console.cloud.tencent.com/wsapi/index）启用 Web Search（WSA）
2. 获取 API Key 并设置为 `WSA_API_KEY`
3. 参考：[WSA API 文档](https://cloud.tencent.com/document/product/1806/130615)

> 如不使用腾讯云 WSA，可将 `web_search` 工具实现替换为第三方搜索服务（如 Exa、Tavily）。

## 本地开发

**前置依赖**
- Node.js 18+
- EdgeOne CLI（`npm i -g edgeone`）

```bash
npm install
cp .env.example .env
# 编辑 .env，填入 AI_GATEWAY_API_KEY、AI_GATEWAY_BASE_URL 和 WSA_API_KEY
edgeone makers dev
```

本地可观测面板地址：http://localhost:8088/agent-metrics。

## 项目结构

```
deep-research-agent/
├── agents/
│   ├── research.ts         # POST /research —— 主研究管线
│   ├── chat.ts             # POST /chat —— 跟进讨论
│   ├── stop.ts             # POST /stop —— 中止运行
│   ├── _tools.ts           # 工具工厂（分解、搜索、抓取）
│   ├── _prompts.ts         # 系统提示词构建器
│   ├── _sources.ts         # 学术 API 解析器（CrossRef、Semantic Scholar）
│   ├── _project-store.ts   # 版本持久化辅助函数
│   ├── _follow-up.ts       # 无搜索编辑路径（报告优化）
│   ├── _report-cleanup.ts  # 后处理与引用验证
│   └── _shared.ts          # SDK 重导出、SSE 辅助函数、日志
├── cloud-functions/
│   ├── project/            # 项目与版本存储
│   ├── enrich-doi/         # DOI 元数据增强
│   ├── health/             # GET /health
│   ├── _http.ts            # HTTP 客户端工具
│   └── _logger.ts          # 云函数共享日志
├── app/                    # Next.js App Router 前端
├── lib/
│   ├── i18n.tsx            # 中 / 英翻译
│   └── teaching.ts         # 教学情境模型与可选框架
└── edgeone.json            # EdgeOne 部署配置
```

以 `_` 为前缀的文件是私有模块，不会作为公共路由暴露。

## 工作原理

### 运行模式
`agents/` 下的文件以**会话模式**运行：相同 `conversation_id` 的请求会被粘性路由到同一 Agent 实例及同一沙箱。这保证了对话历史与上传上下文在后续消息中始终可用。

### 端到端流程

1. **教学情境输入** —— 教师填写课程、学段、主题、课时、班额、真实学情、框架、材料、约束和希望解决的问题。
2. **调查问题分解** —— Agent 从学情难点、教学依据、对齐关系和课堂风险等角度生成 2–7 个问题。
3. **教师确认** —— 教师编辑或确认问题，再进入完整研创模式。
4. **证据研究** —— Agent 调用两类工具：
   - **联网搜索**（`search_web`）通过平台 `web_search` 工具（腾讯云 WSA）。
   - **学术搜索**（`search_literature`）通过 CrossRef 和 Semantic Scholar API。
5. **URL 抓取** —— 对联网搜索结果中的关键 URL，使用平台 `browser_fetch` 工具抓取详细内容。
6. **教学活动包合成** —— Agent 将来源与教师输入整合为九段式课堂交付物，并保持目标、活动、证据、评价对齐。
7. **清理与验证** —— 输出经过后处理，删除重复参考文献并剔除无效引用编号。
8. **持久化** —— 教学情境与活动包一同保存为项目版本。
9. **跟进精修** —— 教师可基于已有活动包询问可行性、调整脚本或优化评价，无需每次重新搜索。

### 关键路由与参数
- `/research` —— 主研创端点。Body：`{ question, depth, projectId, teachingContext, confirmedSubQuestions?, decomposeOnly? }`。
- `/chat` —— 基于已完成报告的跟进讨论。Body：`{ message, projectId, chatHistory, report }`。
- `/stop` —— 中止活跃研究运行。Body：`{ conversation_id }`。
- `/health` —— 存活探针（位于 `cloud-functions/`，不涉及 AI）。
- `conversation_id` 由前端生成，通过 `makers-conversation-id` Header 传入；运行时会自动绑定到 `context.conversation_id`。

### 超时配置
`edgeone.json` 中将 Agent 超时设置为 **300 秒**，以适应长时间运行的研究合成。

## 相关资源

- [Makers Agents 文档](https://cloud.tencent.com/document/product/1552/132759)
- [Makers 快速开始](https://cloud.tencent.com/document/product/1552/132786)
- [Makers Models](https://cloud.tencent.com/document/product/1552/132748)

## 许可证

MIT
