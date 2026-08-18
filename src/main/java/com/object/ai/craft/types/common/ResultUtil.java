package com.object.ai.craft.types.common;

import com.object.ai.craft.types.exception.ErrorCode;

/**
 * 响应返回工具类
 */
public class ResultUtil {

    /**
     * 成功响应（带数据）
     *
     * @param data 返回数据
     * @param <T>  数据类型
     */
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(0, data, "ok");
    }

    /**
     * 成功响应（无数据）
     *
     * @param <T> 数据类型
     */
    public static <T> BaseResponse<T> success() {
        return success(null);
    }

    /**
     * 失败响应（使用错误码默认信息）
     *
     * @param errorCode 错误码
     * @param <T>       数据类型
     */
    public static <T> BaseResponse<T> error(ErrorCode errorCode) {
        return new BaseResponse<>(errorCode.getCode(), null, errorCode.getMessage());
    }

    /**
     * 失败响应（自定义错误信息）
     *
     * @param errorCode 错误码
     * @param message   自定义错误信息
     * @param <T>       数据类型
     */
    public static <T> BaseResponse<T> error(ErrorCode errorCode, String message) {
        return new BaseResponse<>(errorCode.getCode(), null, message);
    }

    /**
     * 失败响应（自定义状态码与信息）
     *
     * @param code    状态码
     * @param message 错误信息
     * @param <T>     数据类型
     */
    public static <T> BaseResponse<T> error(int code, String message) {
        return new BaseResponse<>(code, null, message);
    }

}
