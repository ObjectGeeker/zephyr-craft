package com.object.ai.craft.api.advice;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import cn.dev33.satoken.exception.NotRoleException;
import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.ResultUtil;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Optional;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
@Hidden
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public BaseResponse<?> businessExceptionHandler(BusinessException e) {
        log.error("BusinessException", e);
        return ResultUtil.error(e.getCode(), e.getMessage());
    }

    /**
     * 请求体字段校验异常。
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public BaseResponse<?> methodArgumentNotValidExceptionHandler(MethodArgumentNotValidException e) {
        String message = Optional.ofNullable(e.getBindingResult().getFieldError())
                .map(FieldError::getDefaultMessage)
                .orElse(ErrorCode.PARAMS_ERROR.getMessage());
        return ResultUtil.error(ErrorCode.PARAMS_ERROR, message);
    }

    /**
     * 方法参数校验异常。
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public BaseResponse<?> constraintViolationExceptionHandler(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse(ErrorCode.PARAMS_ERROR.getMessage());
        return ResultUtil.error(ErrorCode.PARAMS_ERROR, message);
    }

    /**
     * Sa-Token 未登录异常。
     */
    @ExceptionHandler(NotLoginException.class)
    public BaseResponse<?> notLoginExceptionHandler(NotLoginException e) {
        return ResultUtil.error(ErrorCode.NOT_LOGIN_ERROR);
    }

    /**
     * Sa-Token 角色或权限异常。
     */
    @ExceptionHandler({NotRoleException.class, NotPermissionException.class})
    public BaseResponse<?> forbiddenExceptionHandler(RuntimeException e) {
        return ResultUtil.error(ErrorCode.FORBIDDEN_ERROR);
    }

    /**
     * 运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public BaseResponse<?> runtimeExceptionHandler(RuntimeException e) {
        log.error("RuntimeException", e);
        return ResultUtil.error(ErrorCode.SYSTEM_ERROR);
    }

}
