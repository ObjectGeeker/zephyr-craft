package com.object.ai.craft.domain.agent.core;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import com.object.ai.craft.domain.agent.service.AiCodeGeneratorService;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * AI 代码生成门面类，整合代码生成，文件保存
 */
@Component
public class AiCodeGeneratorFacade {

    @Resource
    private AiCodeGeneratorService aiCodeGeneratorService;

    /**
     * 统一入口：根据类型生成并保存代码
     *
     * @param userMessage 用户消息
     * @param codeGenEnum 生成类型
     * @return 保存的目录
     */
    public File generateAndSaveCode(String userMessage, CodeGenEnum codeGenEnum) {
        if (null == codeGenEnum) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "必须指定生成类型！");
        }

        return switch (codeGenEnum) {
            case HTML -> generateAndSaveHtmlCode(userMessage);
            case MULTI_FILE -> generateAndSaveMultiHtmlCode(userMessage);
            default -> throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的生成类型！");
        };
    }

    private File generateAndSaveMultiHtmlCode(String userMessage) {
        MultiHtmlCodeResult multiHtmlCodeResult = aiCodeGeneratorService.generateMultiHtmlCode(userMessage);
        return CodeFileSaver.saveMultiHtmlCodeResult(multiHtmlCodeResult);
    }

    private File generateAndSaveHtmlCode(String userMessage) {
        HtmlCodeResult htmlCodeResult = aiCodeGeneratorService.generateHtmlCode(userMessage);
        return CodeFileSaver.saveHtmlCodeResult(htmlCodeResult);
    }

}
