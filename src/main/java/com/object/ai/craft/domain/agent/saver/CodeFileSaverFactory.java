package com.object.ai.craft.domain.agent.saver;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 文件保存器工厂：按生成类型路由到对应的 {@link CodeFileSaver} 保存器。
 */
@Component
public class CodeFileSaverFactory {

    private final Map<CodeGenEnum, CodeFileSaver<?>> saverMap;

    public CodeFileSaverFactory(List<CodeFileSaver<?>> savers) {
        Map<CodeGenEnum, CodeFileSaver<?>> map = new EnumMap<>(CodeGenEnum.class);
        for (CodeFileSaver<?> saver : savers) {
            map.put(saver.supportType(), saver);
        }
        this.saverMap = map;
    }

    /**
     * 获取指定生成类型对应的保存器。
     *
     * @param codeGenEnum 生成类型
     * @return 对应的保存器
     */
    public CodeFileSaver<?> getSaver(CodeGenEnum codeGenEnum) {
        CodeFileSaver<?> saver = codeGenEnum == null ? null : saverMap.get(codeGenEnum);
        if (saver == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的生成类型！");
        }
        return saver;
    }

}
