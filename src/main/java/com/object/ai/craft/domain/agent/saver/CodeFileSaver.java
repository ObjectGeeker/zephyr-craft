package com.object.ai.craft.domain.agent.saver;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.types.constant.AppConstant;
import com.object.ai.craft.types.exception.BusinessException;
import com.object.ai.craft.types.exception.ErrorCode;

import java.io.File;

/**
 * 文件保存器抽象基类，固化「建目录 -> 写文件 -> 返回目录」的模板骨架。
 *
 * @param <T> 保存的解析结果类型
 */
public abstract class CodeFileSaver<T> {

    public static final String FILE_SAVE_ROOT_DIR = AppConstant.APP_CODE_OUTPUT_DIR;

    /**
     * 该保存器支持的生成类型。
     *
     * @return 生成类型枚举
     */
    public abstract CodeGenEnum supportType();

    /**
     * 支持的解析结果类型，用于运行时类型校验。
     *
     * @return 解析结果类型
     */
    protected abstract Class<T> resultType();

    /**
     * 钩子方法：将解析结果写入目标目录下的文件。
     *
     * @param dirPath 目标目录
     * @param result  解析结果
     */
    protected abstract void writeFiles(String dirPath, T result);

    /**
     * 模板方法：保存解析结果并返回输出目录。
     *
     * @param result 解析结果
     * @return 保存目录
     */
    public final File save(Object result, String appId) {
        if (result == null || !resultType().isInstance(result)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的保存结果类型！");
        }

        String dirPath = buildUniqueDir(supportType().name(), appId);
        writeFiles(dirPath, resultType().cast(result));
        return new File(dirPath);
    }

    /**
     * 保存单个文件
     *
     * @param dirPath  目录
     * @param filename 文件名
     * @param content  文件内容
     */
    protected final void writeToFile(String dirPath, String filename, String content) {
        String filePath = dirPath + File.separator + filename;
        FileUtil.writeUtf8String(content, filePath);
    }

    /**
     * 创建并返回文件目录
     *
     * @param bizType 业务类型
     * @return 文件目录
     */
    private String buildUniqueDir(String bizType, String appId) {
        String uniqueDir = FILE_SAVE_ROOT_DIR + File.separator + bizType + "_" + appId;
        FileUtil.mkdir(uniqueDir);
        return uniqueDir;
    }

}
