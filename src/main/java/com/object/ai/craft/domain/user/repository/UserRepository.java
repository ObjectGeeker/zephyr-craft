package com.object.ai.craft.domain.user.repository;

import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;

import java.util.Collection;
import java.util.List;

/**
 * 用户 仓储接口
 *
 * @author Object
 */
public interface UserRepository {

    /**
     * 保存用户
     *
     * @param user 用户
     * @return {@code true} 保存成功
     */
    boolean save(User user);

    /**
     * 批量保存用户。
     *
     * @param users 用户集合
     * @return {@code true} 表示所有用户均保存成功
     */
    boolean saveBatch(Collection<User> users);

    /**
     * 根据账号获取用户。
     *
     * @param account 账号
     * @return 用户，不存在时返回 {@code null}
     */
    User getByAccount(String account);

    /**
     * 根据主键删除用户
     *
     * @param id 主键
     * @return {@code true} 删除成功
     */
    boolean removeById(String id);

    /**
     * 根据主键批量删除用户。
     *
     * @param ids 用户主键集合
     * @return {@code true} 表示所有指定用户均已删除
     */
    boolean removeByIds(Collection<String> ids);

    /**
     * 根据主键更新用户
     *
     * @param user 用户
     * @return {@code true} 更新成功
     */
    boolean updateById(User user);

    /**
     * 根据主键批量更新用户资料。
     *
     * @param users 待更新用户集合
     * @return {@code true} 表示所有用户均更新成功
     */
    boolean updateBatchById(Collection<User> users);

    /**
     * 根据主键批量查询用户。
     *
     * @param ids 用户主键集合
     * @return 用户列表
     */
    List<User> listByIds(Collection<String> ids);

    /**
     * 根据主键获取用户
     *
     * @param id 主键
     * @return 用户
     */
    User getById(String id);

    /**
     * 分页查询用户
     *
     * @param request 分页请求
     * @return 分页结果
     */
    PageResult<User> page(PageRequest<?> request);

}
