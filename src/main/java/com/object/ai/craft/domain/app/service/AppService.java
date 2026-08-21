package com.object.ai.craft.domain.app.service;

import com.object.ai.craft.api.model.app.AppAddRequest;
import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppAdminUpdateRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.api.model.app.AppUpdateRequest;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.types.common.PageResult;

/**
 * 应用领域服务，负责应用的创建、个人管理、精选展示和管理员管理。
 */
public interface AppService {

    /**
     * 为当前登录用户创建应用。
     *
     * <p>未提供有效应用名称时使用默认名称，并将当前登录用户设置为创建者。</p>
     *
     * @param request 应用创建请求
     * @return 已持久化的应用
     * @throws com.object.ai.craft.types.exception.BusinessException 当前用户未登录或应用创建失败时抛出
     */
    App create(AppAddRequest request);

    /**
     * 更新当前登录用户拥有的应用名称。
     *
     * @param request 应用更新请求
     * @return {@code true} 表示更新成功
     * @throws com.object.ai.craft.types.exception.BusinessException 应用不存在、用户未登录或无权操作时抛出
     */
    boolean updateMy(AppUpdateRequest request);

    /**
     * 删除当前登录用户拥有的应用。
     *
     * @param id 应用主键
     * @return {@code true} 表示删除成功
     * @throws com.object.ai.craft.types.exception.BusinessException 应用不存在、用户未登录或无权操作时抛出
     */
    boolean removeMy(String id);

    /**
     * 获取当前登录用户拥有的应用详情。
     *
     * @param id 应用主键
     * @return 应用详情
     * @throws com.object.ai.craft.types.exception.BusinessException 应用不存在、用户未登录或无权查看时抛出
     */
    App getMyById(String id);

    /**
     * 分页查询当前登录用户创建的应用。
     *
     * @param request 分页查询条件
     * @return 当前用户的应用分页结果
     * @throws com.object.ai.craft.types.exception.BusinessException 当前用户未登录时抛出
     */
    PageResult<App> pageMy(AppPageRequest request);

    /**
     * 分页查询对外展示的精选应用。
     *
     * @param request 分页查询条件
     * @return 精选应用分页结果
     */
    PageResult<App> pageFeatured(AppPageRequest request);

    /**
     * 由管理员更新应用的名称、封面或优先级。
     *
     * @param request 管理员更新请求
     * @return {@code true} 表示更新成功
     * @throws com.object.ai.craft.types.exception.BusinessException 没有待更新字段、名称为空或应用不存在时抛出
     */
    boolean updateByAdmin(AppAdminUpdateRequest request);

    /**
     * 由管理员删除指定应用。
     *
     * @param id 应用主键
     * @return {@code true} 表示删除成功
     * @throws com.object.ai.craft.types.exception.BusinessException 应用不存在时抛出
     */
    boolean removeByAdmin(String id);

    /**
     * 获取应用详情，包含逻辑删除的记录，供管理员管理使用。
     *
     * @param id 应用主键
     * @return 应用详情
     * @throws com.object.ai.craft.types.exception.BusinessException 应用不存在时抛出
     */
    App getByIdForAdmin(String id);

    /**
     * 分页查询管理员可管理的全部应用。
     *
     * @param request 管理员分页查询条件
     * @return 应用分页结果
     */
    PageResult<App> pageByAdmin(AppAdminPageRequest request);

    /**
     * 部署当前登录用户拥有的应用。
     *
     * <p>校验应用归属后，复用或随机生成部署标识，将代码生成产物复制到部署目录，
     * 回写部署信息并返回基于 nginx 的访问地址。</p>
     *
     * @param appId 应用主键
     * @return 部署后的访问 URL
     * @throws com.object.ai.craft.types.exception.BusinessException 应用不存在、用户未登录或无权操作、尚未生成代码时抛出
     */
    String deployApp(String appId);

}
