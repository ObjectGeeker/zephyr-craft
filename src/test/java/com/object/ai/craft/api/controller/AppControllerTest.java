package com.object.ai.craft.api.controller;

import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.api.model.app.AppVO;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.model.AppPriority;
import com.object.ai.craft.domain.app.service.AppService;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.PageResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 应用控制器测试。
 */
@ExtendWith(MockitoExtension.class)
class AppControllerTest {

    @Mock
    private AppService appService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AppController appController;

    @Test
    void pageMyShouldBatchLoadCreatorsAndReturnDesensitizedUser() {
        AppPageRequest request = new AppPageRequest();
        List<App> apps = List.of(
                App.builder().id("app-1").appName("应用一").userId("user-1").build(),
                App.builder().id("app-2").appName("应用二").userId("user-1").build()
        );
        when(appService.pageMy(request)).thenReturn(PageResult.of(apps, 2, 1, 10));
        when(userService.listByIds(any())).thenReturn(List.of(
                User.builder().id("user-1").account("account").password("secret").username("用户").build()
        ));

        BaseResponse<PageResult<AppVO>> response = appController.pageMy(request);

        ArgumentCaptor<Collection<String>> idsCaptor = ArgumentCaptor.captor();
        verify(userService).listByIds(idsCaptor.capture());
        assertEquals(List.of("user-1"), idsCaptor.getValue().stream().sorted().toList());
        assertEquals("用户", response.getData().getRecords().getFirst().getUser().getUsername());
        assertEquals("account", response.getData().getRecords().getFirst().getUser().getAccount());
    }

    @Test
    void pageFeaturedShouldReturnFeaturedAppsWithCreatorAndHiddenPrompt() {
        AppPageRequest request = new AppPageRequest();
        App app = App.builder()
                .id("app-featured")
                .appName("精选应用")
                .initPrompt("不应公开")
                .priority(AppPriority.FEATURED)
                .userId("user-1")
                .build();
        when(appService.pageFeatured(request)).thenReturn(PageResult.of(List.of(app), 1, 1, 10));
        when(userService.listByIds(any())).thenReturn(List.of(
                User.builder().id("user-1").account("account").username("用户").build()
        ));

        BaseResponse<PageResult<AppVO>> response = appController.pageFeatured(request);

        AppVO result = response.getData().getRecords().getFirst();
        assertEquals(AppPriority.FEATURED, result.getPriority());
        assertEquals("用户", result.getUser().getUsername());
        assertNull(result.getInitPrompt());
        verify(appService).pageFeatured(request);
    }

}
