# Zephyr Craft

> 一句话生成网站 —— AI 驱动的网站生成平台。

只需输入一句描述，即可快速生成一个可用的网站。

## 技术栈

**后端**

- Java 21 + Spring Boot 3.5
- MyBatis-Flex（ORM）+ HikariCP（连接池）+ MySQL
- Knife4j（API 文档）
- Hutool、Lombok

**前端（zephyr-craft-web）**

- Vite + React 19 + TypeScript
- Tailwind CSS v4 + daisyUI（UI 组件）
- motion（动画）

## 项目结构

```
zephyr-craft/
├── src/main/java/com/object/ai/craft/   # 后端源码
│   ├── api/                             # 接口层（Controller、全局异常处理）
│   ├── app/                             # 应用配置（Knife4j、CORS）
│   ├── domain/                          # 领域层（模型、服务、仓库接口）
│   ├── infrastructure/                  # 基础设施层（持久化实现）
│   ├── types/                           # 通用类型（响应、异常）
│   └── generate/                        # MyBatis-Flex 代码生成
├── dev-ops/sql/init.sql                 # 数据库初始化脚本
└── zephyr-craft-web/                    # 前端项目
```

## 快速开始

**环境要求**：JDK 21+、Maven 3.6+、Node.js 18+、MySQL 8+

**1. 初始化数据库**

```bash
mysql -u root -p < dev-ops/sql/init.sql
```

**2. 启动后端**

修改 `src/main/resources/application.yml` 中的数据库连接配置，然后：

```bash
mvn spring-boot:run
```

后端运行在 `http://localhost:8080/api`，接口文档地址：`http://localhost:8080/api/doc.html`

**3. 启动前端**

```bash
cd zephyr-craft-web
npm install
npm run dev
```

前端运行在 `http://localhost:5173`
