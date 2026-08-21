package com.object.ai.craft.domain.agent.core;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import com.object.ai.craft.domain.agent.parser.CodeParserFactory;
import com.object.ai.craft.domain.agent.saver.CodeFileSaverFactory;
import com.object.ai.craft.domain.agent.service.AiCodeGeneratorService;
import com.object.ai.craft.domain.agent.service.AiCodeGeneratorStreamingService;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

import java.io.File;
import java.io.IOException;

/**
 * AI 代码生成门面类，整合代码生成，文件保存
 */
@Component
public class AiCodeGeneratorFacade {

    @Resource
    private AiCodeGeneratorService aiCodeGeneratorService;

    @Resource
    private AiCodeGeneratorStreamingService aiCodeGeneratorStreamingService;

    @Resource
    private CodeParserFactory codeParserFactory;

    @Resource
    private CodeFileSaverFactory codeFileSaverFactory;

    /**
     * 统一入口：根据类型生成并保存代码
     *
     * @param userMessage 用户消息
     * @param codeGenEnum 生成类型
     * @return 保存的目录
     */
    public File generateAndSaveCode(String userMessage, CodeGenEnum codeGenEnum, String appId) {
        if (null == codeGenEnum) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "必须指定生成类型！");
        }

        return switch (codeGenEnum) {
            case HTML -> generateAndSaveHtmlCode(userMessage, appId);
            case MULTI_FILE -> generateAndSaveMultiHtmlCode(userMessage, appId);
            default -> throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的生成类型！");
        };
    }

    /**
     * 统一流式入口：根据类型返回 AI 生成的原始文本片段。
     *
     * <p>调用方可在流结束后通过 {@code CodeParserFactory} 选择策略，提取单文件 HTML，
     * 或提取多文件模式下的 HTML、CSS 和 JavaScript。</p>
     *
     * @param userMessage 用户消息
     * @param codeGenEnum 生成类型
     * @return AI 返回的文本片段
     */
    public Flux<String> generateCodeStream(String userMessage, CodeGenEnum codeGenEnum) {
        if (null == codeGenEnum) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "必须指定生成类型！");
        }

        return switch (codeGenEnum) {
            case HTML -> aiCodeGeneratorStreamingService.generateHtmlCodeStream(userMessage);
            case MULTI_FILE -> aiCodeGeneratorStreamingService.generateMultiHtmlCodeStream(userMessage);
            default -> throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的生成类型！");
        };
    }

    /**
     * 通过 SSE 推送生成过程，并在流结束后解析和保存代码。
     *
     * <p>每个模型片段以 {@code code} 事件推送；完整响应解析并保存成功后，
     * 通过 {@code complete} 事件推送保存目录。生成或解析失败时推送 {@code error}
     * 事件并结束 SSE。</p>
     *
     * @param userMessage 用户消息
     * @param codeGenEnum 生成类型
     * @param emitter SSE 响应发送器
     */
    public void generateCodeStream(String userMessage, CodeGenEnum codeGenEnum, SseEmitter emitter, String appId) {
        if (emitter == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "SseEmitter 不能为空！");
        }

        StringBuilder fullResponse = new StringBuilder();
        generateCodeStream(userMessage, codeGenEnum).subscribe(
                chunk -> handleStreamChunk(emitter, fullResponse, chunk),
                error -> handleStreamError(emitter, error),
                () -> handleStreamComplete(emitter, codeGenEnum, fullResponse.toString(), appId)
        );
    }

    private void handleStreamChunk(SseEmitter emitter, StringBuilder fullResponse, String chunk) {
        fullResponse.append(chunk);
        try {
            emitter.send(SseEmitter.event()
                    .name("code")
                    .data(chunk));
        } catch (IOException e) {
            throw new IllegalStateException("发送 SSE 代码片段失败！", e);
        }
    }

    private void handleStreamComplete(SseEmitter emitter, CodeGenEnum codeGenEnum, String fullResponse, String appId) {
        try {
            File outputDirectory = parseAndSaveCode(fullResponse, codeGenEnum, appId);
            emitter.send(SseEmitter.event()
                    .name("complete")
                    .data(outputDirectory.getAbsolutePath()));
            emitter.complete();
        } catch (Throwable error) {
            handleStreamError(emitter, error);
        }
    }

    private void handleStreamError(SseEmitter emitter, Throwable error) {
        try {
            emitter.send(SseEmitter.event()
                    .name("error")
                    .data(error.getMessage() == null ? "流式生成失败！" : error.getMessage()));
        } catch (Throwable ignored) {
            // SSE 连接已经不可用时，只能尝试结束连接。
        } finally {
            try {
                emitter.completeWithError(error);
            } catch (IllegalStateException ignored) {
                // SSE 连接可能已经由客户端断开或完成。
            }
        }
    }

    private File parseAndSaveCode(String fullResponse, CodeGenEnum codeGenEnum, String appId) {
        Object result = codeParserFactory.getParser(codeGenEnum).parse(fullResponse);
        return codeFileSaverFactory.getSaver(codeGenEnum).save(result, appId);
    }

    private File generateAndSaveMultiHtmlCode(String userMessage, String appId) {
        MultiHtmlCodeResult multiHtmlCodeResult = aiCodeGeneratorService.generateMultiHtmlCode(userMessage);
        return codeFileSaverFactory.getSaver(CodeGenEnum.MULTI_FILE).save(multiHtmlCodeResult, appId);
    }

    private File generateAndSaveHtmlCode(String userMessage, String appId) {
        HtmlCodeResult htmlCodeResult = aiCodeGeneratorService.generateHtmlCode(userMessage);
        return codeFileSaverFactory.getSaver(CodeGenEnum.HTML).save(htmlCodeResult, appId);
    }

}
