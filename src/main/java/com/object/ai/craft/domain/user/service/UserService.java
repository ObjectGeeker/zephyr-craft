package com.object.ai.craft.domain.user.service;

import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.repository.UserRepository;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import lombok.RequiredArgsConstructor;
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
