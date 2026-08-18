package com.object.ai.craft.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 通用响应体
 *
 * @param <T> 数据类型
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseResponse<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     */
    private int code;

    /**
     * 返回数据
     */
    private T data;

    /**
     * 提示信息
     */
    private String message;

}
