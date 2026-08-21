package com.object.ai.craft.app.config;

import com.object.ai.craft.types.constant.AppConstant;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.File;
import java.io.IOException;

/**
 * 生成产物静态托管配置，用于部署前的应用预览。
 *
 * <p>将 /preview/** 映射到 {@code tmp/code_output} 生成产物目录；部署产物
 * （{@code tmp/code_deploy}）不经过后端，由 nginx 通过 /sites/** 直接对外提供。</p>
 */
@Configuration
public class PreviewResourceConfig implements WebMvcConfigurer {

    private static final String INDEX_FILE = "index.html";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/preview/**")
                .addResourceLocations("file:" + AppConstant.APP_CODE_OUTPUT_DIR + File.separator)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource resource = location.createRelative(resourcePath);
                        if (resource.exists() && resource.isReadable()) {
                            // 访问目录时回落到 index.html，与 nginx 的 index 行为保持一致
                            if (resource.getFile().isDirectory()) {
                                return resolveIndex(location, resourcePath);
                            }
                            return resource;
                        }
                        // 不带尾斜杠的目录路径（如 /preview/{codeGenType}_{appId}）
                        return resolveIndex(location, resourcePath);
                    }

                    private Resource resolveIndex(Resource location, String resourcePath) throws IOException {
                        Resource index = location.createRelative(resourcePath + "/" + INDEX_FILE);
                        return index.exists() && index.isReadable() ? index : null;
                    }
                });
    }

}
