package com.object.ai.craft.types.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 通用分页结果
 *
 * @param <T> 数据类型
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResult<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 数据列表
     */
    private List<T> records;

    /**
     * 总记录数
     */
    private long total;

    /**
     * 当前页码
     */
    private long current;

    /**
     * 每页条数
     */
    private long pageSize;

    /**
     * 构建分页结果
     *
     * @param records  数据列表
     * @param total    总记录数
     * @param current  当前页码
     * @param pageSize 每页条数
     * @param <T>      数据类型
     */
    public static <T> PageResult<T> of(List<T> records, long total, long current, long pageSize) {
        return new PageResult<>(records, total, current, pageSize);
    }

}
