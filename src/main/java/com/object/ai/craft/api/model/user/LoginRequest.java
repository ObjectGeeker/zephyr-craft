package com.object.ai.craft.api.model.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户登录请求体。
 */
@Data
public class LoginRequest {

    @NotBlank(message = "账号不能为空")
    @Size(max = 64, message = "账号长度不能超过64个字符")
    private String account;

    @NotBlank(message = "密码不能为空")
    @Size(max = 64, message = "密码长度不能超过64个字符")
    private String password;

}
