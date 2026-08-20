package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;

import java.util.regex.Pattern;

/**
 * 代码解析策略公共基类，收敛代码块匹配与参数校验逻辑。
 *
 * @param <T> 解析结果类型
 */
public abstract class AbstractCodeParser<T> implements CodeParser<T> {

    /**
     * Markdown 代码块匹配规则：捕获语言标识与代码内容。
     */
    protected static final Pattern CODE_BLOCK_PATTERN = Pattern.compile(
            "(?is)```\\s*([a-z0-9+#-]+)\\s*\\R(.*?)```"
    );

    /**
     * 校验 AI 输出非空。
     *
     * @param output 完整的 AI 输出文本
     */
    protected void requireNonBlank(String output) {
        if (output == null || output.isBlank()) {
            throw invalidOutput("AI 输出不能为空！");
        }
    }

    /**
     * 赋值代码块内容，同一语言的代码块不允许重复出现。
     *
     * @param language     语言名称，用于错误提示
     * @param existingCode 已解析到的同语言代码，可为空
     * @param code         当前代码块内容
     * @return 当前代码块内容
     */
    protected String assignCode(String language, String existingCode, String code) {
        if (existingCode != null) {
            throw invalidOutput(language + " 代码块不能重复！");
        }
        return code;
    }

    /**
     * 构造 AI 输出不合法的业务异常。
     *
     * @param message 错误信息
     * @return 业务异常
     */
    protected BusinessException invalidOutput(String message) {
        return new BusinessException(ErrorCode.PARAMS_ERROR, message);
    }

}
