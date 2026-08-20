package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;

/**
 * 代码解析策略接口：从流式生成完成后的 AI 输出文本中提取目标代码。
 *
 * @param <T> 解析结果类型
 */
public interface CodeParser<T> {

    /**
     * 该策略支持的生成类型。
     *
     * @return 生成类型枚举
     */
    CodeGenEnum supportType();

    /**
     * 解析 AI 完整输出文本。
     *
     * @param output 完整的 AI 输出文本
     * @return 解析结果
     */
    T parse(String output);

}
