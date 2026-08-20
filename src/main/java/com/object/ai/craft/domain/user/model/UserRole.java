package com.object.ai.craft.domain.user.model;

import lombok.Getter;

/**
 * 用户角色。
 */
@Getter
public enum UserRole {

    USER("user", "普通用户"),
    ADMIN("admin", "管理员");

    private final String value;

    private final String description;

    UserRole(String value, String description) {
        this.value = value;
        this.description = description;
    }

}
