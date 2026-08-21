-- ----------------------------
-- 用户表
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`
(
    `id`          CHAR(32)     NOT NULL COMMENT '主键ID，32位小写十六进制UUID（无横线等特殊字符）',
    `account`     VARCHAR(64)  NOT NULL COMMENT '账号',
    `password`    VARCHAR(128) NOT NULL COMMENT '密码（加密存储）',
    `username`    VARCHAR(64)  NOT NULL COMMENT '用户名/昵称',
    `avatar`      VARCHAR(512)          DEFAULT NULL COMMENT '头像地址',
    `profile`     VARCHAR(512)          DEFAULT NULL COMMENT '个人简介',
    `role`        VARCHAR(32)  NOT NULL DEFAULT 'user' COMMENT '角色',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_account` (`account`),
    -- 经常查询的字段单独加索引
    INDEX `idx_username` (`username`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='用户表';

DROP TABLE IF EXISTS `app`;
-- 应用表
CREATE TABLE `app`
(
    `id`            CHAR(32)     NOT NULL COMMENT '主键 ID',
    `app_name`      VARCHAR(256) NOT NULL COMMENT '应用名称',
    `cover`         VARCHAR(512)          DEFAULT NULL COMMENT '应用封面',
    `init_prompt`   TEXT         NOT NULL COMMENT '应用初始化提示词',
    `code_gen_type` VARCHAR(64)           DEFAULT NULL COMMENT '代码生成类型',
    `deploy_key`    VARCHAR(64)           DEFAULT NULL COMMENT '部署标识',
    `deployed_time` DATETIME               DEFAULT NULL COMMENT '部署时间',
    `priority`      INT          NOT NULL DEFAULT 0 COMMENT '优先级',
    `user_id`       CHAR(32)     NOT NULL COMMENT '创建用户 ID',
    `edit_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '编辑时间',
    `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_delete`     TINYINT      NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_deploy_key` (`deploy_key`),
    INDEX `idx_app_name` (`app_name`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_featured` (`is_delete`, `priority`, `edit_time`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='应用';
