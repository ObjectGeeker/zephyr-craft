package com.object.ai.craft.domain.agent.service;

import reactor.core.publisher.Flux;

import dev.langchain4j.service.SystemMessage;

/**
 * AI 代码生成流式服务。
 */
public interface AiCodeGeneratorStreamingService {

    /**
     * 流式生成单文件网站代码。
     *
     * @param userMessage 用户消息
     * @return AI 返回的原始文本片段
     */
    @SystemMessage(fromResource = "prompt/codegen-html-streaming-system-prompt.txt")
    Flux<String> generateHtmlCodeStream(String userMessage);

    /**
     * 流式生成多文件网站代码。
     *
     * @param userMessage 用户消息
     * @return AI 返回的原始文本片段
     */
    @SystemMessage(fromResource = "prompt/codegen-multi-file-streaming-system-prompt.txt")
    Flux<String> generateMultiHtmlCodeStream(String userMessage);

}
