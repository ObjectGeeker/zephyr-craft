package com.object.ai.craft.domain.agent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.object.ai.craft.domain.agent.core.AiCodeGeneratorFacade;
import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.domain.agent.service.AiCodeGeneratorService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;

@SpringBootTest
@Slf4j
public class AiCodeGenerateTest {

    @Resource
    private AiCodeGeneratorService aiCodeGeneratorService;

    @Resource
    private AiCodeGeneratorFacade aiCodeGeneratorFacade;

    @Resource
    private ObjectMapper objectMapper;

    @Test
    void generateHtmlCode() throws JsonProcessingException {
        HtmlCodeResult response = aiCodeGeneratorService.generateHtmlCode("简单生成一个自我介绍的主页，我是一名工作三年的Java开发程序员，名字是Zephyr");
        log.info("生成结果: {}", objectMapper.writeValueAsString(response));
    }

    @Test
    void generateAndSaveCode() {
        File file = aiCodeGeneratorFacade.generateAndSaveCode("简单生成一个自我介绍的主页，我是一名工作三年的Java开发程序员，名字是Zephyr，不超过200行代码", CodeGenEnum.MULTI_FILE, "1");
        log.info("生成结果: {}", file.getAbsoluteFile());
    }

}
