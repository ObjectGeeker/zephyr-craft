package com.object.ai.craft.api.model.app;

import com.object.ai.craft.api.model.user.UserVO;
import com.object.ai.craft.domain.app.model.App;
import com.object.ai.craft.domain.user.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 应用响应体。
 */
@Data
@Builder
public class AppVO {

    private String id;
    private String appName;
    private String cover;
    private String initPrompt;
    private String codeGenType;
    private String deployKey;
    private LocalDateTime deployedTime;
    private Integer priority;
    private String userId;
    private LocalDateTime editTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;

    /**
     * 创建者的脱敏用户信息。
     */
    private UserVO user;

    public static AppVO from(App app) {
        return from(app, null);
    }

    public static AppVO from(App app, User user) {
        if (app == null) {
            return null;
        }
        return AppVO.builder()
                .id(app.getId())
                .appName(app.getAppName())
                .cover(app.getCover())
                .initPrompt(app.getInitPrompt())
                .codeGenType(app.getCodeGenType())
                .deployKey(app.getDeployKey())
                .deployedTime(app.getDeployedTime())
                .priority(app.getPriority())
                .userId(app.getUserId())
                .editTime(app.getEditTime())
                .createTime(app.getCreateTime())
                .updateTime(app.getUpdateTime())
                .isDelete(app.getIsDelete())
                .user(UserVO.from(user))
                .build();
    }

    /**
     * 精选列表不暴露其他用户的初始化提示词。
     */
    public static AppVO fromFeatured(App app) {
        return fromFeatured(app, null);
    }

    public static AppVO fromFeatured(App app, User user) {
        AppVO appVO = from(app, user);
        if (appVO != null) {
            appVO.setInitPrompt(null);
        }
        return appVO;
    }

}
