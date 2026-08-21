package com.object.ai.craft.api.controller;

import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.ResultUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 健康检查接口
 */
@Tag(name = "健康检查", description = "服务存活状态检查接口")
@RestController
@RequestMapping("/healthy")
public class HealthyController {

    @Operation(summary = "健康检查", description = "确认后端服务可正常响应")
    @GetMapping
    public BaseResponse<String> healthy() {
        return ResultUtil.success("ok");
    }

}
