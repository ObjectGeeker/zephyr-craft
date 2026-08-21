package com.object.ai.craft.domain.app.repository;

import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.types.common.PageResult;

import java.util.Collection;

/**
 * 应用仓储接口。
 */
public interface AppRepository {

    boolean save(App app);

    boolean updateById(App app);

    /**
     * 批量更新应用。
     *
     * @param apps 应用集合
     * @return {@code true} 表示全部应用更新成功
     */
    boolean updateBatchById(Collection<App> apps);

    boolean removeById(String id);

    /**
     * 根据主键批量删除应用。
     *
     * @param ids 应用主键集合
     * @return {@code true} 表示全部应用删除成功
     */
    boolean removeByIds(Collection<String> ids);

    App getById(String id);

    App getByIdIncludeDeleted(String id);

    PageResult<App> pageMy(AppPageRequest request, String userId);

    PageResult<App> pageFeatured(AppPageRequest request);

    PageResult<App> pageAdmin(AppAdminPageRequest request);

}
