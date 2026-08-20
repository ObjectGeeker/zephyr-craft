package com.object.ai.craft.api.controller;

import com.object.ai.craft.api.model.codegen.CodeGenRequest;
import com.object.ai.craft.domain.agent.core.AiCodeGeneratorFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * AI 代码生成接口。
 */
@Tag(name = "AI 代码生成")
@RestController
@RequestMapping("/codegen")
@RequiredArgsConstructor
public class CodeGenController {

    /**
     * SSE 连接超时时间：AI 生成耗时较长，设为 5 分钟。
     */
    private static final long SSE_TIMEOUT = 5 * 60 * 1000L;

    private final AiCodeGeneratorFacade aiCodeGeneratorFacade;

    /**
     * 流式生成代码，通过 SSE 推送生成过程。
     */
    @Operation(summary = "流式生成代码（SSE）")
    @PostMapping(value = "generateStream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generateStream(@Valid @RequestBody CodeGenRequest request) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        emitter.onTimeout(emitter::complete);
        emitter.onError(error -> emitter.complete());
        aiCodeGeneratorFacade.generateCodeStream(
                request.getUserMessage(), request.getType(), emitter);
        return emitter;
    }

}
