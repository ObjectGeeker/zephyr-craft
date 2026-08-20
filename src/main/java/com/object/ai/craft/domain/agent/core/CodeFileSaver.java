package com.object.ai.craft.domain.agent.core;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import com.object.ai.craft.domain.agent.model.CodeGenEnum;
import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;

import java.io.File;

/**
 * 文件保存器
 * 用于保存AI生成的代码文件
 */
public class CodeFileSaver {

    public static final String FILE_SAVE_ROOT_DIR = System.getProperty("user.dir") + "/tmp/code_output";

    /**
     * 写入结果
     *
     * @param htmlCodeResult 执行结果
     * @return 目录
     */
    public static File saveHtmlCodeResult(HtmlCodeResult htmlCodeResult) {
        String dirPath = buildUniqueDir(CodeGenEnum.HTML.name());
        writeToFile(dirPath, "index.html", htmlCodeResult.getHtmlCode());
        return new File(dirPath);
    }

    /**
     * 写入结果
     *
     * @param multiHtmlCodeResult 执行结果
     * @return 目录
     */
    public static File saveMultiHtmlCodeResult(MultiHtmlCodeResult multiHtmlCodeResult) {
        String dirPath = buildUniqueDir(CodeGenEnum.MULTI_FILE.name());
        writeToFile(dirPath, "index.html", multiHtmlCodeResult.getHtmlCode());
        writeToFile(dirPath, "style.css", multiHtmlCodeResult.getCssCode());
        writeToFile(dirPath, "main.js", multiHtmlCodeResult.getJsCode());
        return new File(dirPath);
    }

    /**
     * 保存单个文件
     *
     * @param dirPath  目录
     * @param filename 文件名
     * @param content  文件内容
     */
    private static void writeToFile(String dirPath, String filename, String content) {
        String filePath = dirPath + File.separator + filename;
        FileUtil.writeUtf8String(content, filePath);
    }

    /**
     * 创建并返回文件目录
     *
     * @param bizType 业务类型
     * @return 文件目录
     */
    private static String buildUniqueDir(String bizType) {
        String uniqueDir = FILE_SAVE_ROOT_DIR + File.separator + bizType + "_" + IdUtil.getSnowflakeNextIdStr();
        FileUtil.mkdir(uniqueDir);
        return uniqueDir;
    }

}
