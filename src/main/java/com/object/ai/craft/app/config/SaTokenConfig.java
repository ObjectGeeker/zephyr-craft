package com.object.ai.craft.app.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 注解鉴权配置。
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor())
                .addPathPatterns("/**")
                // /preview/** 为生成产物的静态预览，iframe 跨源加载不携带 cookie，凭不可猜测的路径控制访问
                .excludePathPatterns("/user/login", "/user/register", "/preview/**");
    }

}
