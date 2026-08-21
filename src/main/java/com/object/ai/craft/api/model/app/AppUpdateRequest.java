package com.object.ai.craft.api.model.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户更新应用请求体。
 */
@Data
public class AppUpdateRequest {

    @NotBlank(message = "应用ID不能为空")
    private String id;

    @NotBlank(message = "应用名称不能为空")
    @Size(max = 256, message = "应用名称长度不能超过256个字符")
    private String appName;

}
