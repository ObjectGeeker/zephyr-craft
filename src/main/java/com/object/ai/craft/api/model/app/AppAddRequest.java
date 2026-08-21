package com.object.ai.craft.api.model.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建应用请求体。
 */
@Data
public class AppAddRequest {

    @Size(max = 256, message = "应用名称长度不能超过256个字符")
    private String appName;

    @NotBlank(message = "初始化提示词不能为空")
    private String initPrompt;

}
