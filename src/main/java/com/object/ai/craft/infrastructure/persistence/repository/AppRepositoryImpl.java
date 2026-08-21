package com.object.ai.craft.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.mybatisflex.core.logicdelete.LogicDeleteManager;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.row.Db;
import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.model.AppPriority;
import com.object.ai.craft.domain.app.repository.AppRepository;
import com.object.ai.craft.infrastructure.persistence.mapper.AppMapper;
import com.object.ai.craft.infrastructure.persistence.po.AppPO;
import com.object.ai.craft.types.common.PageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * 应用仓储实现（基于 MyBatis-Flex）。
 */
@Repository
@RequiredArgsConstructor
public class AppRepositoryImpl implements AppRepository {

    private final AppMapper appMapper;

    @Override
    public boolean save(App app) {
        AppPO appPO = toPO(app);
        boolean saved = appMapper.insertSelective(appPO) > 0;
        if (saved) {
            app.setId(appPO.getId());
        }
        return saved;
    }

    @Override
    public boolean updateById(App app) {
        return LogicDeleteManager.execWithoutLogicDelete(() -> appMapper.update(toPO(app)) > 0);
    }

    @Override
    public boolean updateBatchById(Collection<App> apps) {
        if (apps == null || apps.isEmpty()) {
            return true;
        }
        List<AppPO> appPOs = apps.stream().map(this::toPO).toList();
        return LogicDeleteManager.execWithoutLogicDelete(() -> Db.updateEntitiesBatch(appPOs) == apps.size());
    }

    @Override
    public boolean removeById(String id) {
        return appMapper.deleteById(id) > 0;
    }

    @Override
    public boolean removeByIds(Collection<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return true;
        }
        return appMapper.deleteBatchByIds(ids) == ids.size();
    }

    @Override
    public App getById(String id) {
        return toDomain(appMapper.selectOneById(id));
    }

    @Override
    public App getByIdIncludeDeleted(String id) {
        AppPO appPO = LogicDeleteManager.execWithoutLogicDelete(() -> appMapper.selectOneById(id));
        return toDomain(appPO);
    }

    @Override
    public PageResult<App> pageMy(AppPageRequest request, String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .eq(AppPO::getUserId, userId)
                .like(AppPO::getAppName, request.getAppName(), value -> value != null && !value.isBlank())
                .orderBy(AppPO::getEditTime, false);
        return paginate(request.getCurrent(), request.getPageSize(), queryWrapper);
    }

    @Override
    public PageResult<App> pageFeatured(AppPageRequest request) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .eq(AppPO::getPriority, AppPriority.FEATURED)
                .like(AppPO::getAppName, request.getAppName(), value -> value != null && !value.isBlank())
                .orderBy(AppPO::getPriority, false)
                .orderBy(AppPO::getEditTime, false);
        return paginate(request.getCurrent(), request.getPageSize(), queryWrapper);
    }

    @Override
    public PageResult<App> pageAdmin(AppAdminPageRequest request) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .eq(AppPO::getId, request.getId(), value -> value != null && !value.isBlank())
                .like(AppPO::getAppName, request.getAppName(), value -> value != null && !value.isBlank())
                .like(AppPO::getCover, request.getCover(), value -> value != null && !value.isBlank())
                .like(AppPO::getInitPrompt, request.getInitPrompt(), value -> value != null && !value.isBlank())
                .like(AppPO::getCodeGenType, request.getCodeGenType(), value -> value != null && !value.isBlank())
                .like(AppPO::getDeployKey, request.getDeployKey(), value -> value != null && !value.isBlank())
                .eq(AppPO::getPriority, request.getPriority(), value -> value != null)
                .eq(AppPO::getUserId, request.getUserId(), value -> value != null && !value.isBlank())
                .orderBy(AppPO::getPriority, false)
                .orderBy(AppPO::getEditTime, false);
        // 管理员列表仍遵循逻辑删除约束，不展示已删除应用。
        return paginate(request.getCurrent(), request.getPageSize(), queryWrapper);
    }

    private PageResult<App> paginate(long current, long pageSize, QueryWrapper queryWrapper) {
        Page<AppPO> page = appMapper.paginate(Page.of(current, pageSize), queryWrapper);
        List<App> records = page.getRecords().stream().map(this::toDomain).toList();
        return PageResult.of(records, page.getTotalRow(), page.getPageNumber(), page.getPageSize());
    }

    private AppPO toPO(App app) {
        return BeanUtil.copyProperties(app, AppPO.class);
    }

    private App toDomain(AppPO appPO) {
        if (appPO == null) {
            return null;
        }
        return BeanUtil.copyProperties(appPO, App.class);
    }

}
