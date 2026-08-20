package com.object.ai.craft.api.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserUpdateRequest;
import com.object.ai.craft.api.model.user.UserVO;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.common.ResultUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户认证与管理接口。
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 用户注册并自动登录。
     */
    @PostMapping("register")
    public BaseResponse<UserVO> register(@Valid @RequestBody RegisterRequest request) {
        return ResultUtil.success(UserVO.from(userService.register(request)));
    }

    /**
     * 用户登录。
     */
    @PostMapping("login")
    public BaseResponse<UserVO> login(@Valid @RequestBody LoginRequest request) {
        return ResultUtil.success(UserVO.from(userService.login(request)));
    }

    /**
     * 退出登录。
     */
    @PostMapping("logout")
    public BaseResponse<Boolean> logout() {
        userService.logout();
        return ResultUtil.success(true);
    }

    /**
     * 获取当前登录用户信息。
     */
    @GetMapping("getLoginUser")
    public BaseResponse<UserVO> getLoginUser() {
        return ResultUtil.success(UserVO.from(userService.getLoginUser()));
    }

    /**
     * 管理员创建普通用户。
     */
    @SaCheckRole("admin")
    @PostMapping("save")
    public BaseResponse<UserVO> save(@Valid @RequestBody RegisterRequest request) {
        return ResultUtil.success(UserVO.from(userService.createByAdmin(request)));
    }

    /**
     * 管理员删除用户。
     */
    @SaCheckRole("admin")
    @DeleteMapping("remove/{id}")
    public BaseResponse<Boolean> remove(@PathVariable String id) {
        return ResultUtil.success(userService.removeById(id));
    }

    /**
     * 管理员更新用户资料。
     */
    @SaCheckRole("admin")
    @PutMapping("update")
    public BaseResponse<Boolean> update(@Valid @RequestBody UserUpdateRequest request) {
        return ResultUtil.success(userService.updateProfile(request));
    }

    /**
     * 管理员查询所有用户。
     */
    @SaCheckRole("admin")
    @GetMapping("list")
    public BaseResponse<List<UserVO>> list() {
        return ResultUtil.success(userService.list().stream().map(UserVO::from).toList());
    }

    /**
     * 管理员获取用户详情。
     */
    @SaCheckRole("admin")
    @GetMapping("getInfo/{id}")
    public BaseResponse<UserVO> getInfo(@PathVariable String id) {
        return ResultUtil.success(UserVO.from(userService.getById(id)));
    }

    /**
     * 管理员分页查询用户。
     */
    @SaCheckRole("admin")
    @GetMapping("page")
    public BaseResponse<PageResult<UserVO>> page(PageRequest<Void> request) {
        PageResult<User> result = userService.page(request);
        return ResultUtil.success(PageResult.of(
                result.getRecords().stream().map(UserVO::from).toList(),
                result.getTotal(),
                result.getCurrent(),
                result.getPageSize()
        ));
    }

}
