package com.object.ai.craft.domain.app.service.impl;

import com.object.ai.craft.api.model.app.AppAddRequest;
import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppAdminUpdateRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.api.model.app.AppUpdateRequest;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.model.AppPriority;
import com.object.ai.craft.domain.app.repository.AppRepository;
import com.object.ai.craft.domain.app.service.AppService;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.exception.ErrorCode;
import com.object.ai.craft.types.exception.ThrowUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 应用领域服务实现。
 */
@Service
@RequiredArgsConstructor
public class AppServiceImpl implements AppService {

    private static final String DEFAULT_APP_NAME = "未命名应用";

    private final AppRepository appRepository;
    private final UserService userService;

    @Override
    public App create(AppAddRequest request) {
        User loginUser = userService.getLoginUser();
        App app = App.builder()
                .appName(hasText(request.getAppName()) ? request.getAppName() : DEFAULT_APP_NAME)
                .initPrompt(request.getInitPrompt())
                .priority(AppPriority.NORMAL)
                .userId(loginUser.getId())
                .build();
        ThrowUtil.throwIf(!appRepository.save(app), ErrorCode.SYSTEM_ERROR, "应用创建失败");
        App savedApp = appRepository.getById(app.getId());
        ThrowUtil.throwIfNull(savedApp, ErrorCode.SYSTEM_ERROR);
        return savedApp;
    }

    @Override
    public boolean updateMy(AppUpdateRequest request) {
        App app = getMyApp(request.getId());
        app.setAppName(request.getAppName());
        app.setEditTime(LocalDateTime.now());
        return appRepository.updateById(app);
    }

    @Override
    public boolean removeMy(String id) {
        getMyApp(id);
        return appRepository.removeById(id);
    }

    @Override
    public App getMyById(String id) {
        return getMyApp(id);
    }

    @Override
    public PageResult<App> pageMy(AppPageRequest request) {
        return appRepository.pageMy(request, userService.getLoginUser().getId());
    }

    @Override
    public PageResult<App> pageFeatured(AppPageRequest request) {
        return appRepository.pageFeatured(request);
    }

    @Override
    public boolean updateByAdmin(AppAdminUpdateRequest request) {
        ThrowUtil.throwIf(request.getAppName() == null && request.getCover() == null && request.getPriority() == null,
                ErrorCode.PARAMS_ERROR, "至少填写一个待更新字段");
        ThrowUtil.throwIf(request.getAppName() != null && !hasText(request.getAppName()),
                ErrorCode.PARAMS_ERROR, "应用名称不能为空");
        App app = getByIdForAdmin(request.getId());
        // 管理员只能修改公开运营字段，保留创建提示词及创建者等归属信息。
        if (request.getAppName() != null) {
            app.setAppName(request.getAppName());
        }
        if (request.getCover() != null) {
            app.setCover(request.getCover());
        }
        if (request.getPriority() != null) {
            app.setPriority(request.getPriority());
        }
        app.setEditTime(LocalDateTime.now());
        return appRepository.updateById(app);
    }

    @Override
    public boolean removeByAdmin(String id) {
        ThrowUtil.throwIfNull(appRepository.getById(id), ErrorCode.NOT_FOUND_ERROR);
        return appRepository.removeById(id);
    }

    @Override
    public App getByIdForAdmin(String id) {
        App app = appRepository.getByIdIncludeDeleted(id);
        ThrowUtil.throwIfNull(app, ErrorCode.NOT_FOUND_ERROR);
        return app;
    }

    @Override
    public PageResult<App> pageByAdmin(AppAdminPageRequest request) {
        return appRepository.pageAdmin(request);
    }

    /**
     * 校验应用存在且归属于当前登录用户，防止跨用户读取或修改。
     */
    private App getMyApp(String id) {
        User loginUser = userService.getLoginUser();
        App app = appRepository.getById(id);
        ThrowUtil.throwIfNull(app, ErrorCode.NOT_FOUND_ERROR);
        ThrowUtil.throwIf(!app.getUserId().equals(loginUser.getId()),
                ErrorCode.FORBIDDEN_ERROR, "无权操作该应用");
        return app;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

}
