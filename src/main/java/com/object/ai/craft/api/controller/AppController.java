package com.object.ai.craft.api.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.object.ai.craft.api.model.app.AppAddRequest;
import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppAdminUpdateRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.api.model.app.AppUpdateRequest;
import com.object.ai.craft.api.model.app.AppVO;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.service.AppService;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.common.ResultUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

/**
 * 应用管理接口。
 */
@Tag(name = "应用管理", description = "应用的创建、个人管理、精选展示与后台运营接口")
@RestController
@RequestMapping("/app")
@RequiredArgsConstructor
public class AppController {

    private final AppService appService;
    private final UserService userService;

    @Operation(summary = "创建应用", description = "为当前登录用户创建一个应用")
    @PostMapping("save")
    public BaseResponse<AppVO> save(@Valid @RequestBody AppAddRequest request) {
        return ResultUtil.success(toVO(appService.create(request)));
    }

    @Operation(summary = "更新我的应用", description = "仅允许当前应用创建者更新应用名称")
    @PutMapping("update")
    public BaseResponse<Boolean> update(@Valid @RequestBody AppUpdateRequest request) {
        return ResultUtil.success(appService.updateMy(request));
    }

    @Operation(summary = "删除我的应用", description = "仅允许当前应用创建者删除应用")
    @DeleteMapping("remove/{id}")
    public BaseResponse<Boolean> remove(@Parameter(description = "应用 ID", required = true) @PathVariable String id) {
        return ResultUtil.success(appService.removeMy(id));
    }

    @Operation(summary = "获取我的应用详情", description = "仅允许当前应用创建者查看应用详情")
    @GetMapping("getInfo/{id}")
    public BaseResponse<AppVO> getInfo(@Parameter(description = "应用 ID", required = true) @PathVariable String id) {
        return ResultUtil.success(toVO(appService.getMyById(id)));
    }

    @Operation(summary = "分页查询我的应用")
    @GetMapping("my/page")
    public BaseResponse<PageResult<AppVO>> pageMy(@Valid @ParameterObject AppPageRequest request) {
        return ResultUtil.success(toVOPage(appService.pageMy(request)));
    }

    @Operation(summary = "分页查询精选应用", description = "查询公开展示的精选应用")
    @GetMapping("featured/page")
    public BaseResponse<PageResult<AppVO>> pageFeatured(@Valid @ParameterObject AppPageRequest request) {
        return ResultUtil.success(toVOPage(appService.pageFeatured(request), AppVO::fromFeatured));
    }

    @SaCheckRole("admin")
    @Operation(summary = "管理员更新应用", description = "可更新应用名称、封面和优先级")
    @PutMapping("admin/update")
    public BaseResponse<Boolean> updateByAdmin(@Valid @RequestBody AppAdminUpdateRequest request) {
        return ResultUtil.success(appService.updateByAdmin(request));
    }

    @SaCheckRole("admin")
    @Operation(summary = "管理员删除应用")
    @DeleteMapping("admin/remove/{id}")
    public BaseResponse<Boolean> removeByAdmin(@Parameter(description = "应用 ID", required = true) @PathVariable String id) {
        return ResultUtil.success(appService.removeByAdmin(id));
    }

    @SaCheckRole("admin")
    @Operation(summary = "管理员获取应用详情", description = "可查询包含逻辑删除记录的应用")
    @GetMapping("admin/getInfo/{id}")
    public BaseResponse<AppVO> getInfoByAdmin(@Parameter(description = "应用 ID", required = true) @PathVariable String id) {
        return ResultUtil.success(toVO(appService.getByIdForAdmin(id)));
    }

    @SaCheckRole("admin")
    @Operation(summary = "管理员分页查询应用")
    @GetMapping("admin/page")
    public BaseResponse<PageResult<AppVO>> pageByAdmin(@Valid @ParameterObject AppAdminPageRequest request) {
        return ResultUtil.success(toVOPage(appService.pageByAdmin(request)));
    }

    private PageResult<AppVO> toVOPage(PageResult<App> result) {
        return toVOPage(result, AppVO::from);
    }

    /**
     * 分页应用的创建者信息一次性批量查询，避免逐条查询产生 N+1 问题。
     */
    private PageResult<AppVO> toVOPage(PageResult<App> result, BiFunction<App, User, AppVO> converter) {
        Set<String> userIds = result.getRecords().stream()
                .map(App::getUserId)
                .filter(userId -> userId != null && !userId.isBlank())
                .collect(Collectors.toSet());
        Map<String, User> userMap = userService.listByIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
        return PageResult.of(
                result.getRecords().stream().map(app -> converter.apply(app, userMap.get(app.getUserId()))).toList(),
                result.getTotal(),
                result.getCurrent(),
                result.getPageSize()
        );
    }

    private AppVO toVO(App app) {
        return AppVO.from(app, userService.getById(app.getUserId()));
    }

}
