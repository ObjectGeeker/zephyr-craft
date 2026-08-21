package com.object.ai.craft.domain.user.service;

import com.object.ai.craft.api.model.user.LoginRequest;
import com.object.ai.craft.api.model.user.RegisterRequest;
import com.object.ai.craft.api.model.user.UserBatchSaveRequest;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.types.common.DataContainer;
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

    /**
     * 管理员批量管理用户
     *
     * @param dataContainer 批量新增、修改和删除数据容器
     * @return {@code true} 表示全部操作成功
     * @throws com.object.ai.craft.types.exception.BusinessException 当前用户不是管理员、请求数据无效或目标用户不存在时抛出
     */
    boolean batchSaveAdmin(DataContainer<UserBatchSaveRequest> dataContainer);
}
