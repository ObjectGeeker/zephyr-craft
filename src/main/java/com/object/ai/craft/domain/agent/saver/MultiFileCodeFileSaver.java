package com.object.ai.craft.domain.agent.saver;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import org.springframework.stereotype.Component;

/**
 * 多文件保存器：将 HTML、CSS 和 JavaScript 结果分别写入 index.html、style.css 和 main.js。
 */
@Component
public class MultiFileCodeFileSaver extends CodeFileSaver<MultiHtmlCodeResult> {

    @Override
    public CodeGenEnum supportType() {
        return CodeGenEnum.MULTI_FILE;
    }

    @Override
    protected Class<MultiHtmlCodeResult> resultType() {
        return MultiHtmlCodeResult.class;
    }

    @Override
    protected void writeFiles(String dirPath, MultiHtmlCodeResult result) {
        writeToFile(dirPath, "index.html", result.getHtmlCode());
        writeToFile(dirPath, "style.css", result.getCssCode());
        writeToFile(dirPath, "main.js", result.getJsCode());
    }

}
