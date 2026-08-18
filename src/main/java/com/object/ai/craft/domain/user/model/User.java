package com.object.ai.craft.domain.user.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户 领域实体
 *
 * @author Object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID，32位小写十六进制UUID（无横线等特殊字符）
     */
    private String id;

    /**
     * 账号
     */
    private String account;

    /**
     * 密码（加密存储）
     */
    private String password;

    /**
     * 用户名/昵称
     */
    private String username;

    /**
     * 头像地址
     */
    private String avatar;

    /**
     * 个人简介
     */
    private String profile;

    /**
     * 角色
     */
    private String role;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

}
