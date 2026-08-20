package com.object.ai.craft.domain.agent.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

/**
 * 原生单文件结构化输出
 */
@Data
@Description("原生单文件结构化输出")
public class HtmlCodeResult {

    /**
     * HTML代码
     */
    @Description("HTML代码")
    private String htmlCode;

    /**
     * 简单介绍生成的逻辑（100字以内）
     */
    @Description("简单介绍生成的逻辑（100字以内）")
    private String description;

}
