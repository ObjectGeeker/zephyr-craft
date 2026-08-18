package com.object.ai.craft.exception;

import java.util.Objects;

/**
 * 异常抛出工具类
 */
public class ThrowUtil {

    /**
     * 条件成立时抛出业务异常
     *
     * @param condition 抛出条件
     * @param errorCode 错误码
     */
    public static void throwIf(boolean condition, ErrorCode errorCode) {
        throwIf(condition, errorCode, errorCode.getMessage());
    }

    /**
     * 条件成立时抛出业务异常（自定义错误信息）
     *
     * @param condition 抛出条件
     * @param errorCode 错误码
     * @param message   错误信息
     */
    public static void throwIf(boolean condition, ErrorCode errorCode, String message) {
        if (condition) {
            throw new BusinessException(errorCode, message);
        }
    }

    /**
     * 对象为 null 时抛出业务异常
     *
     * @param obj       待校验对象
     * @param errorCode 错误码
     */
    public static void throwIfNull(Object obj, ErrorCode errorCode) {
        throwIf(Objects.isNull(obj), errorCode);
    }

}
