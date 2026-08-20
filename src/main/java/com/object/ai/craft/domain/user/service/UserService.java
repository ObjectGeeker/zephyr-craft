package com.object.ai.craft.domain.user.service;

import cn.hutool.crypto.digest.BCrypt;
import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserUpdateRequest;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.model.UserRole;
import com.object.ai.craft.domain.user.repository.UserRepository;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import com.object.ai.craft.types.exception.ThrowUtil;
import cn.dev33.satoken.stp.StpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户 领域服务
 *
 * @author Object
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 注册用户并自动登录。
     */
    public User register(RegisterRequest request) {
        User user = createUser(request);
        StpUtil.login(user.getId());
        return user;
    }

    /**
     * 管理员创建普通用户，不创建登录会话。
     */
    public User createByAdmin(RegisterRequest request) {
        return createUser(request);
    }

    /**
     * 用户登录。
     */
    public User login(LoginRequest request) {
        User user = userRepository.getByAccount(request.getAccount());
        if (user == null || !BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号或密码错误");
        }
        StpUtil.login(user.getId());
        return user;
    }

    /**
     * 退出登录，注销当前会话；未登录时静默处理。
     */
    public void logout() {
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
    }

    /**
     * 获取当前登录用户，未登录时抛出未登录异常。
     */
    public User getLoginUser() {
        StpUtil.checkLogin();
        return userRepository.getById(StpUtil.getLoginIdAsString());
    }

    private User createUser(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "两次输入的密码不一致");
        }
        ThrowUtil.throwIf(userRepository.getByAccount(request.getAccount()) != null,
                ErrorCode.OPERATION_ERROR, "账号已存在");

        User user = User.builder()
                .account(request.getAccount())
                .password(BCrypt.hashpw(request.getPassword()))
                .username(request.getAccount())
                .role(UserRole.USER.getValue())
                .build();
        try {
            userRepository.save(user);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "账号已存在");
        }

        User savedUser = userRepository.getByAccount(request.getAccount());
        if (savedUser == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "用户创建失败");
        }
        return savedUser;
    }

    /**
     * 保存用户
     *
     * @param user 用户
     * @return {@code true} 保存成功
     */
    public boolean save(User user) {
        return userRepository.save(user);
    }

    /**
     * 根据主键删除用户
     *
     * @param id 主键
     * @return {@code true} 删除成功
     */
    public boolean removeById(String id) {
        return userRepository.removeById(id);
    }

    /**
     * 根据主键更新用户
     *
     * @param user 用户
     * @return {@code true} 更新成功
     */
    public boolean updateById(User user) {
        return userRepository.updateById(user);
    }

    /**
     * 更新用户资料，不修改账号、密码和角色。
     */
    public boolean updateProfile(UserUpdateRequest request) {
        User user = userRepository.getById(request.getId());
        ThrowUtil.throwIfNull(user, ErrorCode.NOT_FOUND_ERROR);
        user.setUsername(request.getUsername());
        user.setAvatar(request.getAvatar());
        user.setProfile(request.getProfile());
        return userRepository.updateById(user);
    }

    /**
     * 查询所有用户
     *
     * @return 用户列表
     */
    public List<User> list() {
        return userRepository.list();
    }

    /**
     * 根据主键获取用户
     *
     * @param id 主键
     * @return 用户
     */
    public User getById(String id) {
        return userRepository.getById(id);
    }

    /**
     * 分页查询用户
     *
     * @param request 分页请求
     * @return 分页结果
     */
    public PageResult<User> page(PageRequest<?> request) {
        return userRepository.page(request);
    }

}
