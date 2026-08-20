package com.object.ai.craft.domain.agent.service;

import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import dev.langchain4j.service.SystemMessage;

public interface AiCodeGeneratorService {

    /**
     * 原生单文件生成模式
     *
     * @param userMessage 用户消息
     * @return 响应
     */
    @SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
    HtmlCodeResult generateHtmlCode(String userMessage);

    /**
     * 原生多文件生成模式
     *
     * @param userMessage 用户消息
     * @return 响应
     */
    @SystemMessage(fromResource = "prompt/codegen-multi-file-system-prompt.txt")
    MultiHtmlCodeResult generateMultiHtmlCode(String userMessage);

}
