package com.object.ai.craft.domain.agent.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum CodeGenEnum {
    /**
     * 原生html模式
     */
    HTML,
    /**
     * 原生多文件模式
     */
    MULTI_FILE

}
