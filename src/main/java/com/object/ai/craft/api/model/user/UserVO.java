package com.object.ai.craft.api.model.user;

import com.object.ai.craft.domain.user.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户脱敏响应体。
 */
@Data
@Builder
public class UserVO {

    private String id;

    private String account;

    private String username;

    private String avatar;

    private String profile;

    private String role;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    public static UserVO from(User user) {
        if (user == null) {
            return null;
        }
        return UserVO.builder()
                .id(user.getId())
                .account(user.getAccount())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .profile(user.getProfile())
                .role(user.getRole())
                .createTime(user.getCreateTime())
                .updateTime(user.getUpdateTime())
                .build();
    }

}
