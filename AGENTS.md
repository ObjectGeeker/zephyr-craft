# AGENTS.md

## 项目概览

Zephyr Craft 是一个“输入一句描述即可生成网站”的 AI 网站生成平台。仓库包含 Spring Boot 后端与独立的 React 前端：

- 后端：Java 21、Spring Boot 3.5、MyBatis-Flex、MySQL、Sa-Token、LangChain4j、Knife4j。
- 前端：Vite、React 19、TypeScript、Tailwind CSS v4、daisyUI、Motion、Axios。

后端服务的基础地址为 `http://localhost:8080/api`，开发环境前端为 `http://localhost:5173`；Vite 会将 `/api` 请求代理到后端。

## 目录与职责

```text
src/main/java/com/object/ai/craft/
├── api/                 # HTTP 边界：Controller、请求/响应模型、全局异常处理
├── appPO/config/          # Spring、AI、CORS、Sa-Token、Knife4j 配置
├── domain/              # 领域模型、服务、仓储接口、AI 代码生成能力
├── infrastructure/      # 领域仓储的持久化实现、Mapper、PO
├── types/               # 通用响应、分页、异常与断言工具
└── generate/            # MyBatis-Flex 代码生成工具
src/main/resources/
├── mapper/              # MyBatis XML
└── prompt/              # AI 代码生成的系统提示词
dev-ops/sql/init.sql     # 本地数据库初始化脚本
src/test/                # 后端单元/集成测试
zephyr-craft-web/
├── src/api/             # Axios 请求封装、接口方法、前端 DTO
├── src/components/      # 可复用 UI 组件
├── src/pages/           # 页面级组件
├── src/store/           # React Context 与登录态管理
├── src/assets/          # 静态资源
└── src/index.css        # Tailwind/daisyUI 入口与全局设计 token
```

## 常用命令

在仓库根目录执行后端命令：

```bash
mvn test
mvn package
mvn spring-boot:run
```

在 `zephyr-craft-web/` 执行前端命令：

```bash
npm run dev
npm run lint
npm run build
```

首次运行需要 MySQL 8+。使用 `dev-ops/sql/init.sql` 初始化数据库，并在本地配置中提供数据库和 AI 服务所需的凭据。不要提交真实密码、令牌或 API Key；应优先通过被忽略的 `.env` 或本地配置注入。

## 后端开发约定

- 保持分层依赖方向：`api → domain ← infrastructure`。Controller 不直接调用 Mapper；领域服务不依赖 HTTP 对象或持久化 PO。
- 为新领域对象创建领域模型、仓储接口，以及 `infrastructure/persistence` 下的 PO、Mapper、仓储实现。数据库变更同步写入 `dev-ops/sql/init.sql`。
- API 请求体放在 `api/model/<domain>/`，使用 Jakarta Validation 注解并在 Controller 参数处添加 `@Valid`。对外响应使用 VO，避免暴露领域实体、PO、密码或内部字段。
- Controller 通过 `ResultUtil.success(...)` 返回 `BaseResponse<T>`；业务失败使用 `BusinessException`、`ErrorCode` 和 `ThrowUtil`，由 `GlobalExceptionHandler` 统一转换，避免在业务代码中自行拼装错误响应。
- 需鉴权的接口使用 Sa-Token 注解，例如管理员接口使用 `@SaCheckRole("admin")`；鉴权规则需同时在服务端落实，不能只依赖前端页面限制。
- 持久化实现使用 MyBatis-Flex。保持领域对象与 PO 的显式转换，查询条件使用 `QueryWrapper`，避免将数据库类型扩散到领域层。
- 新增或修改 AI 代码生成输出格式时，同步检查 `src/main/resources/prompt/` 中相应系统提示词、解析器和保存器，保持三者协议一致。
- 延续现有 Java 风格：4 空格缩进、类名 PascalCase、方法/字段 camelCase、包名全小写；优先使用 Lombok 的 `@RequiredArgsConstructor` 进行构造器注入。

## 前端开发约定

- 使用函数组件与 TypeScript；组件用 PascalCase，普通函数、变量和 API 方法用 camelCase。
- 业务接口集中在 `src/api/`：通过 `request<T>` 发起请求，它会拆解后端的 `BaseResponse<T>`，不要在页面中重复实现 Axios、错误码处理或 `/api` 前缀。
- 认证依赖 HttpOnly/cookie 会话，请求必须保留 `withCredentials`；未登录跳转和业务异常已在 `src/api/request.ts` 统一处理。
- 路由在 `src/App.tsx` 定义；页面放 `src/pages/`，跨页面复用的组件放 `src/components/`，登录态通过 `UserContext` / `UserProvider` 访问与刷新。
- 样式优先使用 Tailwind utility class 与 `src/index.css` 定义的语义色 token（如 `brand`、`ink`、`mist`、`line`）。保持当前简洁的蓝白视觉体系，新增全局样式前先确认 utility class 无法表达。
- 不要编辑 `dist/` 或 `node_modules/`，它们都是生成/安装产物。修改前端后至少运行 `npm run lint`；涉及类型、打包或路由时运行 `npm run build`。

## 测试与交付检查

- 后端逻辑变更：为服务、解析器或接口的关键分支增加/更新 `src/test/` 测试，并运行与变更相称的 `mvn test`。
- 前端逻辑变更：运行 `npm run lint`；提交前运行 `npm run build`，确认 TypeScript 检查和 Vite 打包通过。
- 新接口交付前检查：请求校验、成功响应、常见业务错误、登录/角色限制、前端 API 类型和页面调用是否完整。
- 不修改构建输出（`target/`、`zephyr-craft-web/dist/`）来实现功能；将源代码、配置模板、提示词和数据库脚本的变更一并提交。
