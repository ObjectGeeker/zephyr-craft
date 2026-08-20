package com.object.ai.craft.app.config;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * LangChain4j + DeepSeek
 */
@Configuration
public class DeepSeekConfig {

    @Value("${DEEPSEEK_API}")
    private String deepSeekApi;

    @Value("${DEEPSEEK_BASE_URL}")
    private String baseUrl;

    @Value("${DEEPSEEK_MODEL_NAME}")
    private String modelName;

    @Bean
    public ChatModel deepseekChatModel() {
        return OpenAiChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(deepSeekApi)
                .modelName(modelName)
                .maxTokens(100000)
                .strictJsonSchema(true)
                .responseFormat(ResponseFormat.JSON)
                .logRequests(true)
                .logResponses(true)
                .build();
    }

    /**
     * 创建流式聊天模型。
     *
     * <p>流式代码生成使用 Markdown 代码块作为输出协议，因此不启用同步模型使用的 JSON
     * response format。</p>
     */
    @Bean
    public StreamingChatModel deepseekStreamingChatModel() {
        return OpenAiStreamingChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(deepSeekApi)
                .modelName(modelName)
                .maxTokens(100000)
                .logRequests(true)
                .logResponses(true)
                .build();
    }

}
