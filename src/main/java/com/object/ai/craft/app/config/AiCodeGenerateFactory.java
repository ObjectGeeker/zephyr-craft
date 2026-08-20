package com.object.ai.craft.app.config;

import com.object.ai.craft.domain.agent.service.AiCodeGeneratorService;
import com.object.ai.craft.domain.agent.service.AiCodeGeneratorStreamingService;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 创建AiService工厂
 */
@Configuration
public class AiCodeGenerateFactory {

    @Resource
    private ChatModel deepseekChatModel;

    @Resource
    private StreamingChatModel deepseekStreamingChatModel;

    @Bean
    public AiCodeGeneratorService aiCodeGeneratorService() {
        return AiServices.create(AiCodeGeneratorService.class, deepseekChatModel);
    }

    @Bean
    public AiCodeGeneratorStreamingService aiCodeGeneratorStreamingService() {
        return AiServices.create(AiCodeGeneratorStreamingService.class, deepseekStreamingChatModel);
    }

}
