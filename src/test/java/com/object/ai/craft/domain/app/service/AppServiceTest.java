package com.object.ai.craft.domain.app.service;

import cn.hutool.core.io.FileUtil;
import com.object.ai.craft.api.model.app.AppAddRequest;
import com.object.ai.craft.api.model.app.AppAdminUpdateRequest;
import com.object.ai.craft.api.model.app.AppUpdateRequest;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.model.AppPriority;
import com.object.ai.craft.domain.app.repository.AppRepository;
import com.object.ai.craft.domain.app.service.impl.AppServiceImpl;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.constant.AppConstant;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 应用领域服务测试。
 */
@ExtendWith(MockitoExtension.class)
class AppServiceTest {

    @Mock
    private AppRepository appRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AppServiceImpl appService;

    private File generatedSourceDir;
    private File deployedDir;

    @AfterEach
    void cleanUpDeployFiles() {
        if (generatedSourceDir != null) {
            FileUtil.del(generatedSourceDir);
        }
        if (deployedDir != null) {
            FileUtil.del(deployedDir);
        }
    }

    @Test
    void createShouldUseDefaultNameAndCurrentUser() {
        AppAddRequest request = new AppAddRequest();
        request.setAppName(" ");
        request.setInitPrompt("生成一个作品集网站");
        when(userService.getLoginUser()).thenReturn(User.builder().id("user-1").build());
        doAnswer(invocation -> {
            ((App) invocation.getArgument(0)).setId("app-1");
            return true;
        }).when(appRepository).save(any(App.class));
        when(appRepository.getById("app-1")).thenReturn(App.builder().id("app-1").appName("未命名应用").build());

        App result = appService.create(request);

        ArgumentCaptor<App> captor = ArgumentCaptor.forClass(App.class);
        verify(appRepository).save(captor.capture());
        assertEquals("未命名应用", captor.getValue().getAppName());
        assertEquals("user-1", captor.getValue().getUserId());
        assertEquals(AppPriority.NORMAL, captor.getValue().getPriority());
        assertEquals("app-1", result.getId());
    }

    @Test
    void updateMyShouldRejectAnotherUsersApp() {
        AppUpdateRequest request = new AppUpdateRequest();
        request.setId("app-2");
        request.setAppName("新名称");
        when(appRepository.getById("app-2")).thenReturn(App.builder().id("app-2").userId("user-2").build());
        when(userService.getLoginUser()).thenReturn(User.builder().id("user-1").build());

        BusinessException exception = assertThrows(BusinessException.class, () -> appService.updateMy(request));

        assertEquals(ErrorCode.FORBIDDEN_ERROR.getCode(), exception.getCode());
    }

    @Test
    void updateByAdminShouldOnlyApplyAllowedFields() {
        AppAdminUpdateRequest request = new AppAdminUpdateRequest();
        request.setId("app-3");
        request.setAppName("管理员名称");
        request.setCover("https://example.com/cover.png");
        request.setPriority(10);
        App app = App.builder().id("app-3").appName("旧名称").initPrompt("不可修改").build();
        when(appRepository.getByIdIncludeDeleted("app-3")).thenReturn(app);
        when(appRepository.updateById(any(App.class))).thenReturn(true);

        assertTrue(appService.updateByAdmin(request));

        assertEquals("管理员名称", app.getAppName());
        assertEquals("https://example.com/cover.png", app.getCover());
        assertEquals(10, app.getPriority());
        assertEquals("不可修改", app.getInitPrompt());
        verify(appRepository).updateById(eq(app));
    }

    @Test
    void removeMyShouldUseLogicalDeleteRepositoryOperation() {
        when(appRepository.getById("app-4")).thenReturn(App.builder().id("app-4").userId("user-1").build());
        when(userService.getLoginUser()).thenReturn(User.builder().id("user-1").build());
        when(appRepository.removeById("app-4")).thenReturn(true);

        assertTrue(appService.removeMy("app-4"));

        verify(appRepository).removeById("app-4");
    }

    @Test
    void deployAppShouldRejectAnotherUsersApp() {
        when(appRepository.getById("app-5")).thenReturn(App.builder().id("app-5").userId("user-2").build());
        when(userService.getLoginUser()).thenReturn(User.builder().id("user-1").build());

        BusinessException exception = assertThrows(BusinessException.class, () -> appService.deployApp("app-5"));

        assertEquals(ErrorCode.FORBIDDEN_ERROR.getCode(), exception.getCode());
    }

    @Test
    void deployAppShouldCopyGeneratedCodeAndReturnUrl() {
        App app = App.builder().id("app-deploy").codeGenType("HTML").userId("user-1").build();
        when(appRepository.getById("app-deploy")).thenReturn(app);
        when(userService.getLoginUser()).thenReturn(User.builder().id("user-1").build());
        when(appRepository.updateById(any(App.class))).thenReturn(true);
        generatedSourceDir = FileUtil.mkdir(AppConstant.APP_CODE_OUTPUT_DIR + File.separator + "HTML_app-deploy");
        FileUtil.writeUtf8String("<html></html>", generatedSourceDir.getPath() + File.separator + "index.html");
        ReflectionTestUtils.setField(appService, "nginxBaseUrl", "http://localhost:8082");

        String url = appService.deployApp("app-deploy");

        ArgumentCaptor<App> captor = ArgumentCaptor.forClass(App.class);
        verify(appRepository).updateById(captor.capture());
        String deployKey = captor.getValue().getDeployKey();
        assertNotNull(captor.getValue().getDeployedTime());
        assertEquals(16, deployKey.length());
        assertEquals("http://localhost:8082/sites/HTML_app-deploy_" + deployKey, url);
        deployedDir = new File(AppConstant.APP_CODE_DEPLOY_DIR + File.separator + "HTML_app-deploy_" + deployKey);
        assertEquals("<html></html>", FileUtil.readUtf8String(deployedDir.getPath() + File.separator + "index.html"));
    }

    @Test
    void deployAppShouldReuseExistingDeployKey() {
        App app = App.builder().id("app-deploy").codeGenType("HTML")
                .deployKey("existingkey12345").userId("user-1").build();
        when(appRepository.getById("app-deploy")).thenReturn(app);
        when(userService.getLoginUser()).thenReturn(User.builder().id("user-1").build());
        when(appRepository.updateById(any(App.class))).thenReturn(true);
        generatedSourceDir = FileUtil.mkdir(AppConstant.APP_CODE_OUTPUT_DIR + File.separator + "HTML_app-deploy");
        FileUtil.writeUtf8String("<html></html>", generatedSourceDir.getPath() + File.separator + "index.html");
        ReflectionTestUtils.setField(appService, "nginxBaseUrl", "http://localhost:8082");

        String url = appService.deployApp("app-deploy");

        assertEquals("http://localhost:8082/sites/HTML_app-deploy_existingkey12345", url);
        deployedDir = new File(AppConstant.APP_CODE_DEPLOY_DIR + File.separator + "HTML_app-deploy_existingkey12345");
        assertTrue(FileUtil.exist(deployedDir.getPath() + File.separator + "index.html"));
    }

}
