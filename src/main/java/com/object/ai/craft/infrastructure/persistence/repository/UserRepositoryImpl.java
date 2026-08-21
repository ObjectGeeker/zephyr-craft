package com.object.ai.craft.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.repository.UserRepository;
import com.object.ai.craft.infrastructure.persistence.mapper.UserMapper;
import com.object.ai.craft.infrastructure.persistence.po.UserPO;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * 用户 仓储实现（基于 MyBatis-Flex）
 *
 * @author Object
 */
@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserMapper userMapper;

    @Override
    public boolean save(User user) {
        // 使用 insertSelective 忽略 null 字段，交由数据库默认值填充（如 create_time）
        return userMapper.insertSelective(toPO(user)) > 0;
    }

    @Override
    public User getByAccount(String account) {
        UserPO userPO = userMapper.selectOneByQuery(
                QueryWrapper.create().eq(UserPO::getAccount, account)
        );
        return toDomain(userPO);
    }

    @Override
    public boolean removeById(String id) {
        return userMapper.deleteById(id) > 0;
    }

    @Override
    public boolean updateById(User user) {
        return userMapper.update(toPO(user)) > 0;
    }

    @Override
    public List<User> list() {
        return userMapper.selectAll().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<User> listByIds(Collection<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return userMapper.selectListByQuery(
                        QueryWrapper.create().in(UserPO::getId, ids)
                ).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public User getById(String id) {
        return toDomain(userMapper.selectOneById(id));
    }

    @Override
    public PageResult<User> page(PageRequest<?> request) {
        Page<UserPO> page = userMapper.paginate(Page.<UserPO>of(request.getCurrent(), request.getPageSize()), QueryWrapper.create());
        List<User> records = page.getRecords().stream()
                .map(this::toDomain)
                .toList();
        return PageResult.of(records, page.getTotalRow(), page.getPageNumber(), page.getPageSize());
    }

    /**
     * 领域实体转持久化对象
     */
    private UserPO toPO(User user) {
        return BeanUtil.copyProperties(user, UserPO.class);
    }

    /**
     * 持久化对象转领域实体
     */
    private User toDomain(UserPO po) {
        if (po == null) {
            return null;
        }
        return BeanUtil.copyProperties(po, User.class);
    }

}
