package com.object.ai.craft.domain.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserUpdateRequest;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.model.UserRole;
import com.object.ai.craft.domain.user.repository.UserRepository;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import com.object.ai.craft.types.exception.ThrowUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 用户领域服务实现。
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User register(RegisterRequest request) {
        User user = createUser(request);
        // 注册成功即建立当前用户会话，保持与登录入口一致的认证状态。
        StpUtil.login(user.getId());
        return user;
    }

    @Override
    public User createByAdmin(RegisterRequest request) {
        return createUser(request);
    }

    @Override
    public User login(LoginRequest request) {
        User user = userRepository.getByAccount(request.getAccount());
        if (user == null || !BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号或密码错误");
        }
        StpUtil.login(user.getId());
        return user;
    }

    @Override
    public void logout() {
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
    }

    @Override
    public User getLoginUser() {
        StpUtil.checkLogin();
        return userRepository.getById(StpUtil.getLoginIdAsString());
    }

    /**
     * 创建普通用户，并同时处理预检查与数据库唯一索引竞争两种重复账号情况。
     */
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

    @Override
    public boolean save(User user) {
        return userRepository.save(user);
    }

    @Override
    public boolean removeById(String id) {
        return userRepository.removeById(id);
    }

    @Override
    public boolean updateById(User user) {
        return userRepository.updateById(user);
    }

    @Override
    public boolean updateProfile(UserUpdateRequest request) {
        User user = userRepository.getById(request.getId());
        ThrowUtil.throwIfNull(user, ErrorCode.NOT_FOUND_ERROR);
        // 后台资料更新不得改变登录凭据和授权角色。
        user.setUsername(request.getUsername());
        user.setAvatar(request.getAvatar());
        user.setProfile(request.getProfile());
        return userRepository.updateById(user);
    }

    @Override
    public List<User> list() {
        return userRepository.list();
    }

    @Override
    public List<User> listByIds(Collection<String> ids) {
        return userRepository.listByIds(ids);
    }

    @Override
    public User getById(String id) {
        return userRepository.getById(id);
    }

    @Override
    public PageResult<User> page(PageRequest<?> request) {
        return userRepository.page(request);
    }

}
