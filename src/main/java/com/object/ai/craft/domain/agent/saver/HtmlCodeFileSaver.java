package com.object.ai.craft.domain.agent.saver;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import org.springframework.stereotype.Component;

/**
 * 单文件保存器：将单文件 HTML 结果写入 index.html。
 */
@Component
public class HtmlCodeFileSaver extends CodeFileSaver<HtmlCodeResult> {

    @Override
    public CodeGenEnum supportType() {
        return CodeGenEnum.HTML;
    }

    @Override
    protected Class<HtmlCodeResult> resultType() {
        return HtmlCodeResult.class;
    }

    @Override
    protected void writeFiles(String dirPath, HtmlCodeResult result) {
        writeToFile(dirPath, "index.html", result.getHtmlCode());
    }

}
