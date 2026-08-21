package com.object.ai.craft.api.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.object.ai.craft.api.model.app.AppAddRequest;
import com.object.ai.craft.api.model.app.AppAdminPageRequest;
import com.object.ai.craft.api.model.app.AppAdminUpdateRequest;
import com.object.ai.craft.api.model.app.AppPageRequest;
import com.object.ai.craft.api.model.app.AppUpdateRequest;
import com.object.ai.craft.api.model.app.AppVO;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.app.service.AppService;
import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.PageResult;
import com.object.ai.craft.types.common.ResultUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 应用管理接口。
 */
@RestController
@RequestMapping("/app")
@RequiredArgsConstructor
public class AppController {

    private final AppService appService;

    @PostMapping("save")
    public BaseResponse<AppVO> save(@Valid @RequestBody AppAddRequest request) {
        return ResultUtil.success(AppVO.from(appService.create(request)));
    }

    @PutMapping("update")
    public BaseResponse<Boolean> update(@Valid @RequestBody AppUpdateRequest request) {
        return ResultUtil.success(appService.updateMy(request));
    }

    @DeleteMapping("remove/{id}")
    public BaseResponse<Boolean> remove(@PathVariable String id) {
        return ResultUtil.success(appService.removeMy(id));
    }

    @GetMapping("getInfo/{id}")
    public BaseResponse<AppVO> getInfo(@PathVariable String id) {
        return ResultUtil.success(AppVO.from(appService.getMyById(id)));
    }

    @GetMapping("my/page")
    public BaseResponse<PageResult<AppVO>> pageMy(@Valid AppPageRequest request) {
        return ResultUtil.success(toVOPage(appService.pageMy(request)));
    }

    @GetMapping("featured/page")
    public BaseResponse<PageResult<AppVO>> pageFeatured(@Valid AppPageRequest request) {
        PageResult<App> result = appService.pageFeatured(request);
        return ResultUtil.success(PageResult.of(
                result.getRecords().stream().map(AppVO::fromFeatured).toList(),
                result.getTotal(),
                result.getCurrent(),
                result.getPageSize()
        ));
    }

    @SaCheckRole("admin")
    @PutMapping("admin/update")
    public BaseResponse<Boolean> updateByAdmin(@Valid @RequestBody AppAdminUpdateRequest request) {
        return ResultUtil.success(appService.updateByAdmin(request));
    }

    @SaCheckRole("admin")
    @DeleteMapping("admin/remove/{id}")
    public BaseResponse<Boolean> removeByAdmin(@PathVariable String id) {
        return ResultUtil.success(appService.removeByAdmin(id));
    }

    @SaCheckRole("admin")
    @GetMapping("admin/getInfo/{id}")
    public BaseResponse<AppVO> getInfoByAdmin(@PathVariable String id) {
        return ResultUtil.success(AppVO.from(appService.getByIdForAdmin(id)));
    }

    @SaCheckRole("admin")
    @GetMapping("admin/page")
    public BaseResponse<PageResult<AppVO>> pageByAdmin(@Valid AppAdminPageRequest request) {
        return ResultUtil.success(toVOPage(appService.pageByAdmin(request)));
    }

    private PageResult<AppVO> toVOPage(PageResult<App> result) {
        return PageResult.of(
                result.getRecords().stream().map(AppVO::from).toList(),
                result.getTotal(),
                result.getCurrent(),
                result.getPageSize()
        );
    }

}
