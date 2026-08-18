package com.object.ai.craft.model.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import java.io.Serializable;
import java.time.LocalDateTime;

import java.io.Serial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户表 实体类。
 *
 * @author Object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("user")
public class User implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID，32位小写十六进制UUID（无横线等特殊字符）
     */
    @Id(keyType = KeyType.Generator)
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

    /**
     * 逻辑删除标记：1-已删除，0-未删除
     */
    @Column(isLogicDelete = true)
    private Integer isDelete;

}
