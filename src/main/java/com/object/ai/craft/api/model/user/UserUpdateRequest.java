package com.object.ai.craft.api.model.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员更新用户资料请求体。
 */
@Data
public class UserUpdateRequest {

    @NotBlank(message = "用户ID不能为空")
    private String id;

    @Size(max = 64, message = "用户名长度不能超过64个字符")
    private String username;

    @Size(max = 512, message = "头像地址长度不能超过512个字符")
    private String avatar;

    @Size(max = 512, message = "个人简介长度不能超过512个字符")
    private String profile;

}
