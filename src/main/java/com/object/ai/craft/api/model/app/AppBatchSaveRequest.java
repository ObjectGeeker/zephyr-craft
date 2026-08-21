package com.object.ai.craft.api.model.app;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员批量管理应用的数据项。
 */
@Data
public class AppBatchSaveRequest {

    private String id;

    @Size(min = 1, max = 256, message = "应用名称长度必须在1到256个字符之间")
    private String appName;

    @Size(max = 512, message = "应用封面长度不能超过512个字符")
    private String cover;

    private Integer priority;

}
