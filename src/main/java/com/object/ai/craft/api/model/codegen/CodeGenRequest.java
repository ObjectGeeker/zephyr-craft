package com.object.ai.craft.api.model.codegen;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * AI 代码生成请求体。
 */
@Data
public class CodeGenRequest {

    @NotBlank(message = "用户消息不能为空！")
    private String userMessage;

    @NotNull(message = "必须指定生成类型！")
    private CodeGenEnum type;

}
