package com.object.ai.craft.api.model.app;

import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 管理员应用分页查询参数。
 */
@Data
public class AppAdminPageRequest {

    @Min(value = 1, message = "页码必须大于0")
    private long current = 1;

    @Min(value = 1, message = "每页条数必须大于0")
    private long pageSize = 10;

    private String id;
    private String appName;
    private String cover;
    private String initPrompt;
    private String codeGenType;
    private String deployKey;
    private Integer priority;
    private String userId;

}
