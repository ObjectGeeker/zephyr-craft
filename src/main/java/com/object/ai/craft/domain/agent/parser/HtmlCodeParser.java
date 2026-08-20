package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Matcher;

/**
 * 单文件 HTML 解析策略：从流式生成完成后的 Markdown 文本中提取 HTML 代码。
 */
@Component
public class HtmlCodeParser extends AbstractCodeParser<HtmlCodeResult> {

    @Override
    public CodeGenEnum supportType() {
        return CodeGenEnum.HTML;
    }

    /**
     * 解析单文件 HTML 生成结果。
     *
     * @param output 完整的 AI 输出文本
     * @return 单文件 HTML 代码结果
     */
    @Override
    public HtmlCodeResult parse(String output) {
        requireNonBlank(output);

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

}
