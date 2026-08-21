package com.object.ai.craft.api.controller;

import com.object.ai.craft.api.model.user.UserBatchSaveRequest;
import com.object.ai.craft.api.model.user.UserVO;
import com.object.ai.craft.domain.user.model.User;
import com.object.ai.craft.domain.user.service.UserService;
import com.object.ai.craft.types.common.BaseResponse;
import com.object.ai.craft.types.common.DataContainer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 用户管理控制器测试。
 */
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    void batchSaveAdminShouldDelegateBatchRequest() {
        DataContainer<UserBatchSaveRequest> request = DataContainer.<UserBatchSaveRequest>builder()
                .createData(java.util.List.of(new UserBatchSaveRequest()))
                .build();
        when(userService.batchSaveAdmin(request)).thenReturn(true);

        BaseResponse<Boolean> response = userController.batchSaveAdmin(request);

        ArgumentCaptor<DataContainer<UserBatchSaveRequest>> captor = ArgumentCaptor.captor();
        verify(userService).batchSaveAdmin(captor.capture());
        assertEquals(request, captor.getValue());
        assertTrue(response.getData());
    }

    @Test
    void onlyBatchEndpointRemainsForAdministratorWrites() {
        assertFalse(Arrays.stream(UserController.class.getDeclaredMethods())
                .map(Method::getName)
                .anyMatch(name -> name.equals("save") || name.equals("update") || name.equals("remove") || name.equals("list")));

        Method batchMethod = Arrays.stream(UserController.class.getDeclaredMethods())
                .filter(method -> method.getName().equals("batchSaveAdmin"))
                .findFirst()
                .orElseThrow();
        PostMapping mapping = batchMethod.getAnnotation(PostMapping.class);
        assertNotNull(mapping);
        assertEquals("admin/batchSave", mapping.value()[0]);
    }

    @Test
    void getUserByIdShouldExposeDesensitizedUserWithoutAdminAnnotation() throws NoSuchMethodException {
        User user = User.builder().id("user-1").account("account").username("用户").password("secret").build();
        when(userService.getById("user-1")).thenReturn(user);

        BaseResponse<UserVO> response = userController.getUserById("user-1");

        assertEquals("user-1", response.getData().getId());
        assertEquals("account", response.getData().getAccount());
        Method method = UserController.class.getDeclaredMethod("getUserById", String.class);
        GetMapping mapping = method.getAnnotation(GetMapping.class);
        assertNotNull(mapping);
        assertEquals("getInfo/{id}", mapping.value()[0]);
        assertFalse(method.isAnnotationPresent(cn.dev33.satoken.annotation.SaCheckRole.class));
    }
}
