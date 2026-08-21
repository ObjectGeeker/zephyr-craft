package com.object.ai.craft.domain.agent.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.service.AiServices;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AiCodeGeneratorStreamingServiceTest {

    @Test
    void shouldExposeStreamingModelPartialResponsesAsFluxForBothModes() {
        StreamingChatModel streamingChatModel = new StreamingChatModel() {
            @Override
            public void doChat(ChatRequest request, StreamingChatResponseHandler handler) {
                handler.onPartialResponse("chunk-1");
                handler.onPartialResponse("chunk-2");
                handler.onCompleteResponse(ChatResponse.builder()
                        .aiMessage(AiMessage.from("完成"))
                        .build());
            }
        };

        AiCodeGeneratorStreamingService service = AiServices.create(
                AiCodeGeneratorStreamingService.class,
                streamingChatModel
        );

        List<String> htmlChunks = service.generateHtmlCodeStream("生成一个主页")
                .collectList()
                .block(Duration.ofSeconds(2));
        List<String> multiFileChunks = service.generateMultiHtmlCodeStream("生成一个主页")
                .collectList()
                .block(Duration.ofSeconds(2));

        assertEquals(List.of("chunk-1", "chunk-2"), htmlChunks);
        assertEquals(List.of("chunk-1", "chunk-2"), multiFileChunks);
    }

}
