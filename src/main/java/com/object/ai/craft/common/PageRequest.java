package com.object.ai.craft.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 通用分页请求体
 *
 * @param <F> 查询条件类型
 */
@Data
@Schema(description = "通用分页请求体")
public class PageRequest<F> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 当前页码
     */
    @Schema(description = "当前页码", example = "1")
    private long current = 1;

    /**
     * 每页条数
     */
    @Schema(description = "每页条数", example = "10")
    private long pageSize = 10;

    /**
     * 查询条件
     */
    @Schema(description = "查询条件")
    private F filterInfo;

}
