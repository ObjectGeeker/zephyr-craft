package com.object.ai.craft.domain.app.repository;

import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.types.common.PageResult;

/**
 * 应用仓储接口。
 */
public interface AppRepository {

    boolean save(App app);

    boolean updateById(App app);

    boolean removeById(String id);

    App getById(String id);

    App getByIdIncludeDeleted(String id);

    PageResult<App> pageMy(AppPageRequest request, String userId);

    PageResult<App> pageFeatured(AppPageRequest request);

    PageResult<App> pageAdmin(AppAdminPageRequest request);

}
