package com.object.ai.craft.domain.user.service;

import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserUpdateRequest;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;

import java.util.Collection;
import java.util.List;

/**
 * 用户领域服务，负责用户认证、资料管理与后台用户管理。
 */
public interface UserService {

    /**
     * 注册用户并自动登录。
     *
     * @param request 注册请求
     * @return 已注册并建立登录会话的用户
     * @throws com.object.ai.craft.types.exception.BusinessException 两次密码不一致或账号已存在时抛出
     */
    User register(RegisterRequest request);

    /**
     * 管理员创建普通用户，不创建登录会话。
     *
     * @param request 注册请求
     * @return 已创建的普通用户
     * @throws com.object.ai.craft.types.exception.BusinessException 两次密码不一致或账号已存在时抛出
     */
    User createByAdmin(RegisterRequest request);

    /**
     * 用户登录。
     *
     * @param request 登录请求
     * @return 已登录的用户
     * @throws com.object.ai.craft.types.exception.BusinessException 账号或密码错误时抛出
     */
    User login(LoginRequest request);

    /**
     * 退出登录，注销当前会话；未登录时静默处理。
     */
    void logout();

    /**
     * 获取当前登录用户，未登录时抛出未登录异常。
     *
     * @return 当前登录用户
     * @throws com.object.ai.craft.types.exception.BusinessException 当前用户未登录时抛出
     */
    User getLoginUser();

    /**
     * 保存用户。
     *
     * @param user 用户
     * @return {@code true} 保存成功
     */
    boolean save(User user);

    /**
     * 根据主键删除用户。
     *
     * @param id 主键
     * @return {@code true} 删除成功
     */
    boolean removeById(String id);

    /**
     * 根据主键更新用户。
     *
     * @param user 用户
     * @return {@code true} 更新成功
     */
    boolean updateById(User user);

    /**
     * 更新用户资料，不修改账号、密码和角色。
     *
     * @param request 用户资料更新请求
     * @return {@code true} 表示更新成功
     * @throws com.object.ai.craft.types.exception.BusinessException 用户不存在时抛出
     */
    boolean updateProfile(UserUpdateRequest request);

    /**
     * 查询所有用户。
     *
     * @return 用户列表
     */
    List<User> list();

    /**
     * 根据主键批量查询用户。
     *
     * @param ids 用户主键集合
     * @return 用户列表
     */
    List<User> listByIds(Collection<String> ids);

    /**
     * 根据主键获取用户。
     *
     * @param id 主键
     * @return 用户；不存在时返回 {@code null}
     */
    User getById(String id);

    /**
     * 分页查询用户。
     *
     * @param request 分页请求
     * @return 分页结果
     */
    PageResult<User> page(PageRequest<?> request);

}
