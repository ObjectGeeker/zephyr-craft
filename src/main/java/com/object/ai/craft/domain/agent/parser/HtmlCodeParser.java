package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 从流式生成完成后的 Markdown 文本中提取 HTML、CSS 和 JavaScript 代码。
 */
@Component
public class HtmlCodeParser {

    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile(
            "(?is)```\\s*([a-z0-9+#-]+)\\s*\\R(.*?)```"
    );

    /**
     * 解析多文件代码生成结果。
     *
     * @param output 完整的 AI 输出文本
     * @return 三文件代码结果
     */
    public MultiHtmlCodeResult parse(String output) {
        if (output == null || output.isBlank()) {
            throw invalidOutput("AI 输出不能为空！");
        }

        String htmlCode = null;
        String cssCode = null;
        String jsCode = null;

        Matcher matcher = CODE_BLOCK_PATTERN.matcher(output);
        while (matcher.find()) {
            String language = matcher.group(1).toLowerCase(Locale.ROOT);
            String code = matcher.group(2).strip();

            if (code.isEmpty()) {
                throw invalidOutput("代码块内容不能为空！");
            }

            switch (language) {
                case "html", "htm" -> htmlCode = assignCode("HTML", htmlCode, code);
                case "css" -> cssCode = assignCode("CSS", cssCode, code);
                case "js", "javascript" -> jsCode = assignCode("JavaScript", jsCode, code);
                default -> {
                    // 忽略提示词之外的代码块，最终仍会校验三种目标代码是否齐全。
                }
            }
        }

        if (htmlCode == null || cssCode == null || jsCode == null) {
            throw invalidOutput("AI 输出必须包含 html、css 和 javascript 三个代码块！");
        }

        MultiHtmlCodeResult result = new MultiHtmlCodeResult();
        result.setHtmlCode(htmlCode);
        result.setCssCode(cssCode);
        result.setJsCode(jsCode);
        result.setDescription("");
        return result;
    }

    /**
     * 解析单文件 HTML 生成结果。
     *
     * @param output 完整的 AI 输出文本
     * @return 单文件 HTML 代码结果
     */
    public HtmlCodeResult parseHtmlCode(String output) {
        if (output == null || output.isBlank()) {
            throw invalidOutput("AI 输出不能为空！");
        }

        String htmlCode = null;
        Matcher matcher = CODE_BLOCK_PATTERN.matcher(output);
        while (matcher.find()) {
            String language = matcher.group(1).toLowerCase(Locale.ROOT);
            if (!language.equals("html") && !language.equals("htm")) {
                continue;
            }

            String code = matcher.group(2).strip();
            if (code.isEmpty()) {
                throw invalidOutput("HTML 代码块内容不能为空！");
            }
            htmlCode = assignCode("HTML", htmlCode, code);
        }

        if (htmlCode == null) {
            throw invalidOutput("AI 输出必须包含 html 代码块！");
        }

        HtmlCodeResult result = new HtmlCodeResult();
        result.setHtmlCode(htmlCode);
        result.setDescription("");
        return result;
    }

    private String assignCode(String language, String existingCode, String code) {
        if (existingCode != null) {
            throw invalidOutput(language + " 代码块不能重复！");
        }
        return code;
    }

    private BusinessException invalidOutput(String message) {
        return new BusinessException(ErrorCode.PARAMS_ERROR, message);
    }

}
