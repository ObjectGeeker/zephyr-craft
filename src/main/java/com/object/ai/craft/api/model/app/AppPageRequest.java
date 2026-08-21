package com.object.ai.craft.api.model.app;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 普通用户应用分页查询参数。
 */
@Data
public class AppPageRequest {

    @Min(value = 1, message = "页码必须大于0")
    private long current = 1;

    @Min(value = 1, message = "每页条数必须大于0")
    @Max(value = 20, message = "每页条数不能超过20")
    private long pageSize = 10;

    private String appName;

}
