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
 * 部署产物静态托管配置。
 *
 * <p>开发阶段不部署 nginx 时，由后端直接托管 {@code tmp/code_deploy} 下的部署产物，
 * 路径形态与 nginx 保持一致（/sites/{部署目录}），上线后切换 deploy.nginx-base-url 即可。</p>
 */
@Configuration
public class PreviewResourceConfig implements WebMvcConfigurer {

    private static final String INDEX_FILE = "index.html";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/sites/**")
                .addResourceLocations("file:" + AppConstant.APP_CODE_DEPLOY_DIR + File.separator)
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
                        // 不带尾斜杠的目录路径（如 /sites/{部署目录}）
                        return resolveIndex(location, resourcePath);
                    }

                    private Resource resolveIndex(Resource location, String resourcePath) throws IOException {
                        Resource index = location.createRelative(resourcePath + "/" + INDEX_FILE);
                        return index.exists() && index.isReadable() ? index : null;
                    }
                });
    }

}
