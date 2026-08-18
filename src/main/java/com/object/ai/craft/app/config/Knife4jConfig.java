package com.object.ai.craft.app.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Knife4j接口文档配置
 */
@Configuration
public class Knife4jConfig {

    /**
     * 接口文档基本信息（OpenAPI3通过该Bean渲染文档标题，knife4j.openapi.*不生效）
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Zephyr Craft接口文档")
                        .version("1.0")
                        .description("Zephyr Craft后端接口文档")
                        .contact(new Contact().name("object-ai")));
    }

}
