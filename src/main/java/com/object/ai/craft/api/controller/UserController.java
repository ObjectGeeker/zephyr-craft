package com.object.ai.craft.api.controller;

import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.PageRequest;
import com.object.ai.craft.types.common.PageResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户表 控制层。
 *
 * @author Object
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 保存用户表。
     *
     * @param user 用户表
     * @return {@code true} 保存成功，{@code false} 保存失败
     */
    @PostMapping("save")
    public boolean save(@RequestBody User user) {
        return userService.save(user);
    }

    /**
     * 根据主键删除用户表。
     *
     * @param id 主键
     * @return {@code true} 删除成功，{@code false} 删除失败
     */
    @DeleteMapping("remove/{id}")
    public boolean remove(@PathVariable String id) {
        return userService.removeById(id);
    }

    /**
     * 根据主键更新用户表。
     *
     * @param user 用户表
     * @return {@code true} 更新成功，{@code false} 更新失败
     */
    @PutMapping("update")
    public boolean update(@RequestBody User user) {
        return userService.updateById(user);
    }

    /**
     * 查询所有用户表。
     *
     * @return 所有数据
     */
    @GetMapping("list")
    public List<User> list() {
        return userService.list();
    }

    /**
     * 根据主键获取用户表。
     *
     * @param id 用户表主键
     * @return 用户表详情
     */
    @GetMapping("getInfo/{id}")
    public User getInfo(@PathVariable String id) {
        return userService.getById(id);
    }

    /**
     * 分页查询用户表。
     *
     * @param request 分页请求
     * @return 分页结果
     */
    @GetMapping("page")
    public PageResult<User> page(PageRequest<Void> request) {
        return userService.page(request);
    }

}
