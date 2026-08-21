package com.object.ai.craft.types.common;

import cn.hutool.core.collection.CollUtil;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 增删改数据容器
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DataContainer<T> {

    /**
     * 新增数据
     */
    @Valid
    private List<T> createData = new ArrayList<>();

    /**
     * 更新数据
     */
    @Valid
    private List<T> modifyData = new ArrayList<>();

    /**
     * 删除数据
     */
    @Valid
    private List<T> removeData = new ArrayList<>();

    public List<T> mergeData() {
        Collection<T> mergeData = CollUtil.addAll(this.createData, this.modifyData);
        return CollUtil.newArrayList(CollUtil.addAll(mergeData, this.removeData));
    }

}
