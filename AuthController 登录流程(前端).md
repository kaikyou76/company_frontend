# AuthController 登录流程(前端)

根据我的查找，我找到了`loginData`变量在登录页面中的对应部分：

在登录页面 [page.tsx]`/company_frontend/src/app/auth/login/page.tsx` 中，[onSubmit]函数接收一个名为 [data] 的参数，这个参数就是传递给 [loginUserAsync] 的 `loginData`。

具体位置在 [page.tsx] 文件的第 46 行：

```typescript
// 定义表单提交处理函数
const onSubmit = async (data: LoginRequest) => {
  // 清除之前的错误信息
  dispatch(clearError());
  
  // 调用登录异步操作
  const result = await dispatch(loginUserAsync(data)); // 这里的data就是loginData
  
  // 如果登录成功，跳转到仪表板页面
  if (loginUserAsync.fulfilled.match(result)) {
    if (result.payload.success) {
      router.push('/dashboard');
    }
  }
}
```

这个 [data]变量是通过 react-hook-form 的 [handleSubmit]函数传递给 [onSubmit] 函数的，包含了表单中所有通过 [register]) 注册的字段值。

在 [store.ts]`/company_frontend/src/app/store.ts` 中，[loginUserAsync] 接收这个 [data] 并将其作为 `loginData` 参数传递给 [loginUser] 函数：

```typescript
export const loginUserAsync = createAsyncThunk<
  LoginResponse, // 返回类型
  LoginRequest,  // 参数类型
  { rejectValue: string } // 配置对象，定义reject时的返回值类型
>(
  'auth/login', // action类型前缀
  async (loginData, { rejectWithValue }) => { // 这里的loginData就是从onSubmit传入的data
    // 调用登录API
    const response = await loginUser(loginData); // 将loginData传递给authService
    // 如果API调用成功
    if (response.success) {
      // 返回成功的响应数据
      return response;
    } else {
      // 如果API调用失败，返回被拒绝的值（错误信息）
      return rejectWithValue(response.message || '登录失败');
    }
  }
);
```

然后在 [authService.ts]`/company_frontend/src/app/services/authService.ts` 中，[loginUser]函数接收这个 `loginData` 并将其作为 POST 请求的主体发送到后端：

```typescript
export const loginUser = async (
  loginData: LoginRequest // 这里的loginData来自loginUserAsync
): Promise<LoginResponse> => {
  try {
    // 使用axios实例向/auth/login端点发送POST请求
    const response = await api.post<LoginResponse>("/auth/login", loginData);
    return response.data;
  } catch (error: any) {
    // ... 错误处理
  }
}
```

所以，`loginData` 变量在登录页面中就是通过表单收集的 [data] 对象。

## 前端发送登录请求的流程

```bash
    A[用户在登录表单中填写数据并点击提交] --> B[react-hook-form handleSubmit 捕获表单提交]
    B --> C[调用在LoginPage中定义的onSubmit函数]
    C --> D[data参数包含所有已注册的表单字段值]
    D --> E[onSubmit函数中调用 dispatch(loginUserAsync(data))]
    E --> F[Redux Toolkit createAsyncThunk 执行loginUserAsync]
    F --> G[loginUserAsync接收data作为loginData参数]
    G --> H[调用authService.ts中的loginUser(loginData)函数]
    H --> I[loginUser函数使用axios向/api/auth/login发送POST请求]
    I --> J[请求体包含loginData对象]
    J --> K[发送HTTP POST请求到后端]
    K --> L{登录是否成功}
    L -->|成功| M[跳转到/dashboard页面]
    L -->|失败| N[显示错误信息]
```