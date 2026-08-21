package com.object.ai.craft.api.controller;

import com.object.ai.craft.api.model.codegen.CodeGenRequest;
import com.object.ai.craft.domain.agent.core.AiCodeGeneratorFacade;
import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.service.AppService;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * AI 代码生成控制器测试。
 */
@ExtendWith(MockitoExtension.class)
class CodeGenControllerTest {

    @Mock
    private AiCodeGeneratorFacade aiCodeGeneratorFacade;

    @Mock
    private AppService appService;

    @InjectMocks
    private CodeGenController codeGenController;

    @Test
    void generateStreamShouldVerifyAppBeforeStartingGeneration() {
        CodeGenRequest request = new CodeGenRequest();
        request.setUserMessage("生成一个主页");
        request.setType(CodeGenEnum.HTML);
        request.setAppId("app-1");
        when(appService.getMyById("app-1")).thenReturn(App.builder().id("app-1").build());

        codeGenController.generateStream(request);

        InOrder inOrder = inOrder(appService, aiCodeGeneratorFacade);
        inOrder.verify(appService).getMyById("app-1");
        inOrder.verify(aiCodeGeneratorFacade).generateCodeStream(
                request.getUserMessage(), request.getType(), any(), request.getAppId());
        verifyNoMoreInteractions(appService, aiCodeGeneratorFacade);
    }

    @Test
    void generateStreamShouldNotStartGenerationWhenAppDoesNotExist() {
        CodeGenRequest request = new CodeGenRequest();
        request.setUserMessage("生成一个主页");
        request.setType(CodeGenEnum.HTML);
        request.setAppId("missing-app");
        when(appService.getMyById("missing-app"))
                .thenThrow(new BusinessException(ErrorCode.NOT_FOUND_ERROR));

        assertThrows(BusinessException.class, () -> codeGenController.generateStream(request));

        verifyNoInteractions(aiCodeGeneratorFacade);
    }

}
