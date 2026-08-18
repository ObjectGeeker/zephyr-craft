package com.object.ai.craft.service.impl;

import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.object.ai.craft.model.entity.User;
import com.object.ai.craft.mapper.UserMapper;
import com.object.ai.craft.service.UserService;
import org.springframework.stereotype.Service;

/**
 * 用户表 服务层实现。
 *
 * @author Object
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>  implements UserService{

}
