package com.object.ai.craft.domain.agent.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

/**
 * 原生多文件结构化输出
 */
@Data
@Description("原生多文件结构化输出")
public class MultiHtmlCodeResult {

    /**
     * HTML代码
     */
    @Description("HTML代码")
    private String htmlCode;

    /**
     * CSS代码
     */
    @Description("CSS代码")
    private String cssCode;

    /**
     * JS代码
     */
    @Description("JS代码")
    private String jsCode;

    /**
     * 简单介绍生成的逻辑（100字以内）
     */
    @Description("简单介绍生成的逻辑（100字以内）")
    private String description;

}
