package com.object.ai.craft.api.model.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员批量管理用户数据项。
 */
@Data
public class UserBatchSaveRequest {

    private String id;

    @Size(max = 64, message = "账号长度不能超过64个字符")
    private String account;

    @Size(max = 64, message = "密码长度不能超过64个字符")
    private String password;

    @Size(max = 64, message = "确认密码长度不能超过64个字符")
    private String confirmPassword;

    @Size(max = 64, message = "用户名长度不能超过64个字符")
    private String username;

    @Size(max = 512, message = "头像地址长度不能超过512个字符")
    private String avatar;

    @Size(max = 512, message = "个人简介长度不能超过512个字符")
    private String profile;
}
