-- ----------------------------
-- 用户表
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
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