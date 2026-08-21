package com.object.ai.craft.domain.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 应用领域实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class App implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

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

}
