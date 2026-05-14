# DEV_PLAN

> 本文档按版本（1.0 / 2.0 / 3.0）规划任务；每个 TASK 包含状态、子任务、验收标准与注意事项。编号格式 `TASK###`，子任务使用数字序号。

---

## 1.0 MVP （本地可运行演示）

### TASK001 后端基础 API
- 版本：1.0
- 状态：计划中
- 描述：基于 Express 提供景点信息 CRUD，连接 SQLite。

#### 子任务
1. **初始化 Node.js 与 Express 项目**  
   Prompt：
   ```text
   你是资深全栈开发者，请在 backend/ 目录初始化一个基于 Express 的 TS 项目：
   - 使用 `express`, `sqlite3`, `dotenv`
   - 集成 eslint、prettier、ts-node-dev
   - 输出 npm 脚本: dev / build / start
   ```
2. **配置 SQLite 数据库连接**  
   Prompt：
   ```text
   在 src/db.ts 中实现 Singleton 连接工厂：
   - 打开 database/qlb.db
   - 暴露 async `query(sql, params)` 方法
   ```
3. **实现 /api/attractions CRUD**  
   Prompt：
   ```text
   创建 src/routes/attractions.ts，实现 GET/POST/PUT/DELETE，使用 async/await，对错误抛出自定义 HttpError。
   ```
4. **集中式错误处理**  
   Prompt：
   ```text
   编写 src/middlewares/errorHandler.ts 捕获所有同步/异步错误，按 `{code, message}` 返回。
   ```
5. **单元测试**  
   Prompt：
   ```text
   使用 Jest + Supertest，为 attractions 路由编写测试，覆盖率≥80%。
   ```

#### 验收标准（Given-When-Then）
- [ ] Given 项目依赖已安装，When 运行 `npm run dev`，Then 后端在 <http://localhost:4000> 启动。
- [ ] Given DB 空表，When POST /api/attractions 新增记录，Then 响应 201 且可在 GET 列表中查询到。
- [ ] When 发送非法 ID，Then 返回 404 JSON `{code:404}`。

#### 注意事项
- 所有 SQL 使用预编译语句防止注入。
- 错误信息不暴露堆栈到客户端。
- 代码需通过 ESLint 规则。

---

### TASK002 前端基础页面
- 版本：1.0
- 状态：计划中
- 描述：React + Vite 单页应用，实现景点列表与表单编辑。

#### 子任务
1. **初始化 Vite React 项目**  
   Prompt：
   ```text
   在 frontend/ 目录使用 Vite 创建 React TypeScript 模板，加入 react-router-dom 与 axios。
   ```
2. **构建 UI 组件库**  
   Prompt：
   ```text
   安装 Ant Design，封装 <AttractionTable/> 与 <AttractionForm/> 组件。
   ```
3. **实现与后端 API 交互**  
   Prompt：
   ```text
   在 src/services/api.ts 中封装 CRUD 调用，支持 .env 配置后端地址。
   ```
4. **页面路由**  
   Prompt：
   ```text
   / -> 景点列表；/edit/:id -> 编辑表单；/create -> 新增。
   ```
5. **前端单元测试**  
   Prompt：
   ```text
   使用 React Testing Library，测试列表加载与表单提交逻辑。
   ```

#### 验收标准
- [ ] 打开 <http://localhost:3000>，可查看景点列表。
- [ ] 新增/编辑操作后，页面自动刷新数据，无报错。
- [ ] 所有交互请求均命中后端接口，网络错误时出现 Toast 提示。

#### 注意事项
- 使用 React Hooks，避免 class 组件。
- 路由切换保留滚动位置。

---

### TASK003 数据库 Schema 与脚本
- 版本：1.0
- 状态：计划中
- 描述：创建 attractions 表及种子数据脚本。

#### 子任务
1. **定义 schema.sql**  
   Prompt：
   ```text
   在 database/schema.sql 编写 CREATE TABLE attractions(...) 如 README 示例。
   ```
2. **编写种子脚本 seed.ts**  
   Prompt：
   ```text
   读取 JSON 初始景点数据并插入 DB，提供 npm script `npm run seed`。
   ```

#### 验收标准
- [ ] 执行 `npm run migrate` 创建表成功。
- [ ] 执行 `npm run seed` 后，GET /api/attractions 返回≥3条记录。

#### 注意事项
- 种子脚本可重复执行，不产生重复数据。

---

### TASK004 统一错误处理与测试流水线
- 版本：1.0
- 状态：计划中
- 描述：建立 lint、format、test 全链路 CI 脚本。

#### 子任务
1. **添加 ESLint / Prettier 配置**  
   Prompt：
   ```text
   统一 monorepo 根配置，使用 airbnb-typescript 风格。
   ```
2. **配置 Husky & lint-staged**  
   Prompt：
   ```text
   pre-commit: lint + prettier --check + test --bail。
   ```
3. **GitHub Actions**  
   Prompt：
   ```text
   push/pull_request 触发 CI，跑 `npm ci && npm test`。
   ```

#### 验收标准
- [ ] 提交前自动格式化代码，无 lint 错误。
- [ ] CI 通过率 100%。

#### 注意事项
- 确保 Windows 与 Unix 行尾一致。

---

### TASK005 启动脚本与文档
- 版本：1.0
- 状态：计划中
- 描述：提供一键启动 & 停止脚本，完善 README 快速开始。

#### 子任务
1. **根级 npm script `dev`**  
   Prompt：
   ```text
   并行启动前端 (3000) 与后端 (4000)，使用 concurrently。
   ```
2. **docs/usage.md**  
   Prompt：
   ```text
   撰写本地运行、生产构建、常见问题 FAQ。
   ```

#### 验收标准
- [ ] 执行 `npm run dev` 后，终端出现双服务日志，浏览器访问正常。
- [ ] README "快速开始" 步骤与脚本一致。

#### 注意事项
- 脚本需兼容 macOS、Linux、Windows (PowerShell)。

---

## 2.0 AI & Microservices
> 升级 FastAPI 微服务、引入 LLM 推理与向量检索，任务列表暂列标题，细节后续补充。

| TASK 编号 | 名称 | 状态 |
|-----------|------|------|
| TASK101 | AI 语音导览服务 | 计划中 |
| TASK102 | LLM 行程规划微服务 | 计划中 |
| TASK103 | 向量检索 & 语义搜索 | 计划中 |
| TASK104 | 前端 WebGL AR 场景 | 计划中 |
| TASK105 | End-to-End E2E 测试 (Playwright) | 计划中 |

---

## 3.0 Desktop & 插件生态
> Electron 打包、插件市场、事件溯源架构。

| TASK 编号 | 名称 | 状态 |
|-----------|------|------|
| TASK201 | Electron 桌面壳 | 计划中 |
| TASK202 | 插件 SDK & 市场 | 计划中 |
| TASK203 | 事件溯源 & 分布式日志 | 计划中 |
| TASK204 | 云同步与多端协同 | 计划中 | 