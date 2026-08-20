package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Matcher;

/**
 * 多文件解析策略：从流式生成完成后的 Markdown 文本中提取 HTML、CSS 和 JavaScript 代码。
 */
@Component
public class MultiFileCodeParser extends AbstractCodeParser<MultiHtmlCodeResult> {

    @Override
    public CodeGenEnum supportType() {
        return CodeGenEnum.MULTI_FILE;
    }

    /**
     * 解析多文件代码生成结果。
     *
     * @param output 完整的 AI 输出文本
     * @return 三文件代码结果
     */
    @Override
    public MultiHtmlCodeResult parse(String output) {
        requireNonBlank(output);

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

}
