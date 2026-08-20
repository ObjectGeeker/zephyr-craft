package com.object.ai.craft.api.model.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户注册请求体。
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "账号不能为空")
    @Size(max = 64, message = "账号长度不能超过64个字符")
    private String account;

    @NotBlank(message = "密码不能为空")
    @Size(max = 64, message = "密码长度不能超过64个字符")
    private String password;

    @NotBlank(message = "确认密码不能为空")
    @Size(max = 64, message = "确认密码长度不能超过64个字符")
    private String confirmPassword;

}
