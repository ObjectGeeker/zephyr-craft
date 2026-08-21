package com.object.ai.craft.api.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserBatchSaveRequest;
import com.object.ai.craft.api.model.user.UserVO;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.*;

/**
 * 用户认证与管理接口。
 */
@Tag(name = "用户管理", description = "用户注册、登录、个人会话与后台用户管理接口")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 用户注册并自动登录。
     */
    @Operation(summary = "用户注册", description = "注册普通用户并自动登录")
    @PostMapping("register")
    public BaseResponse<UserVO> register(@Valid @RequestBody RegisterRequest request) {
        return ResultUtil.success(UserVO.from(userService.register(request)));
    }

    /**
     * 用户登录。
     */
    @Operation(summary = "用户登录", description = "验证账号密码并建立登录会话")
    @PostMapping("login")
    public BaseResponse<UserVO> login(@Valid @RequestBody LoginRequest request) {
        return ResultUtil.success(UserVO.from(userService.login(request)));
    }

    /**
     * 退出登录。
     */
    @Operation(summary = "退出登录", description = "注销当前登录会话；未登录时静默处理")
    @PostMapping("logout")
    public BaseResponse<Boolean> logout() {
        userService.logout();
        return ResultUtil.success(true);
    }

    /**
     * 获取当前登录用户信息。
     */
    @Operation(summary = "获取当前登录用户")
    @GetMapping("getLoginUser")
    public BaseResponse<UserVO> getLoginUser() {
        return ResultUtil.success(UserVO.from(userService.getLoginUser()));
    }

    /**
     * 根据 ID 获取用户详情，所有用户均可访问。
     */
    @Operation(summary = "获取用户详情", description = "无需管理员权限，可根据用户 ID 查询用户公开资料")
    @GetMapping("getInfo/{id}")
    public BaseResponse<UserVO> getUserById(@Parameter(description = "用户 ID", required = true) @PathVariable String id) {
        return ResultUtil.success(UserVO.from(userService.getById(id)));
    }

    /**
     * 管理员分页查询用户。
     */
    @SaCheckRole("admin")
    @Operation(summary = "管理员分页查询用户")
    @GetMapping("page")
    public BaseResponse<PageResult<UserVO>> page(@ParameterObject PageRequest<Void> request) {
        PageResult<User> result = userService.page(request);
        return ResultUtil.success(PageResult.of(
                result.getRecords().stream().map(UserVO::from).toList(),
                result.getTotal(),
                result.getCurrent(),
                result.getPageSize()
        ));
    }

    @SaCheckRole("admin")
    @Operation(summary = "管理员批量管理用户", description = "管理员用户新增、更新与删除的唯一写入入口")
    @PostMapping("admin/batchSave")
    public BaseResponse<Boolean> batchSaveAdmin(@Valid @RequestBody DataContainer<UserBatchSaveRequest> dataContainer) {
        return ResultUtil.success(userService.batchSaveAdmin(dataContainer));
    }

}
