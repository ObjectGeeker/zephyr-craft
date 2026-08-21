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
                // /sites/** 为部署产物静态预览，iframe 跨源加载不携带 cookie，凭不可猜测的 deployKey 控制访问
                .excludePathPatterns("/user/login", "/user/register", "/sites/**");
    }

}
