package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 代码解析策略工厂：按生成类型路由到对应的 {@link CodeParser} 策略。
 */
@Component
public class CodeParserFactory {

    private final Map<CodeGenEnum, CodeParser<?>> parserMap;

    public CodeParserFactory(List<CodeParser<?>> parsers) {
        Map<CodeGenEnum, CodeParser<?>> map = new EnumMap<>(CodeGenEnum.class);
        for (CodeParser<?> parser : parsers) {
            map.put(parser.supportType(), parser);
        }
        this.parserMap = map;
    }

    /**
     * 获取指定生成类型对应的解析策略。
     *
     * @param codeGenEnum 生成类型
     * @return 对应的解析策略
     */
    public CodeParser<?> getParser(CodeGenEnum codeGenEnum) {
        CodeParser<?> parser = codeGenEnum == null ? null : parserMap.get(codeGenEnum);
        if (parser == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的生成类型！");
        }
        return parser;
    }

}
