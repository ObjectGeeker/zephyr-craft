package com.object.ai.craft.app.config;

import cn.dev33.satoken.stp.StpInterface;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Sa-Token 角色与权限数据提供器。
 */
@Component
@RequiredArgsConstructor
public class SaTokenPermissionImpl implements StpInterface {

    private final UserRepository userRepository;

    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        return List.of();
    }

    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        User user = userRepository.getById(String.valueOf(loginId));
        if (user == null || user.getRole() == null) {
            return List.of();
        }
        return List.of(user.getRole());
    }

}
