package com.object.ai.craft.domain.user.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserBatchSaveRequest;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.model.UserRole;
import com.object.ai.craft.domain.user.repository.UserRepository;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.DataContainer;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import com.object.ai.craft.types.exception.ThrowUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchSaveAdmin(DataContainer<UserBatchSaveRequest> dataContainer) {
        // 1. 校验当前登录用户，避免其他方法直接调用时绕过 Controller 鉴权。
        StpUtil.checkRole(UserRole.ADMIN.getValue());
        // 2. 分离新增、修改和删除数据处理。
        if (CollUtil.isNotEmpty(dataContainer.getCreateData())) {
            doBatchCreate(dataContainer.getCreateData());
        }
        if (CollUtil.isNotEmpty(dataContainer.getModifyData())) {
            doBatchUpdate(dataContainer.getModifyData());
        }
        if (CollUtil.isNotEmpty(dataContainer.getRemoveData())) {
            doBatchRemove(dataContainer.getRemoveData());
        }
        return true;
    }

    private void doBatchRemove(List<UserBatchSaveRequest> removeData) {
        // 1. 校验数据非空。
        if (CollUtil.isEmpty(removeData)) {
            return;
        }
        // 2. 根据 ID 删除数据。
        String currentUserId = StpUtil.getLoginIdAsString();
        List<String> ids = removeData.stream().map(UserBatchSaveRequest::getId).toList();
        ThrowUtil.throwIf(ids.contains(currentUserId), ErrorCode.FORBIDDEN_ERROR, "不能删除当前登录管理员");
        ThrowUtil.throwIf(!userRepository.removeByIds(ids), ErrorCode.OPERATION_ERROR, "删除用户失败");
    }

    private void doBatchUpdate(List<UserBatchSaveRequest> modifyData) {
        // 1. 校验数据非空。
        if (CollUtil.isEmpty(modifyData)) {
            return;
        }
        // 2. 校验数据准确性并保存数据。
        List<User> users = modifyData.stream()
                .map(data -> User.builder()
                        .id(data.getId())
                        .username(data.getUsername())
                        .avatar(data.getAvatar())
                        .profile(data.getProfile())
                        .build())
                .toList();
        ThrowUtil.throwIf(!userRepository.updateBatchById(users), ErrorCode.OPERATION_ERROR, "批量更新用户失败");
    }

    private void doBatchCreate(List<UserBatchSaveRequest> createData) {
        // 1. 校验数据非空。
        if (CollUtil.isEmpty(createData)) {
            return;
        }
        // 2. 校验数据准确性并保存数据。
        List<User> users = createData.stream()
                .map(data -> User.builder()
                        .account(data.getAccount())
                        .password(BCrypt.hashpw(data.getPassword()))
                        .username(data.getAccount())
                        .role(UserRole.USER.getValue())
                        .build())
                .toList();
        try {
            ThrowUtil.throwIf(!userRepository.saveBatch(users), ErrorCode.OPERATION_ERROR, "批量新增用户失败");
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "账号已存在");
        }
    }

}
