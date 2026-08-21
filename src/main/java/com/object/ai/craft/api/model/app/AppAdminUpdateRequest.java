package com.object.ai.craft.api.model.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员更新应用请求体。
 */
@Data
public class AppAdminUpdateRequest {

    @NotBlank(message = "应用ID不能为空")
    private String id;

    @Size(min = 1, max = 256, message = "应用名称长度必须在1到256个字符之间")
    private String appName;

    @Size(max = 512, message = "应用封面长度不能超过512个字符")
    private String cover;

    private Integer priority;

}
