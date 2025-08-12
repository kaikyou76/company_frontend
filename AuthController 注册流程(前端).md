# AuthController 注册流程(前端)

根据我的查找，我找到了`userData`变量在注册页面中的对应部分：

在注册页面 [page.tsx]`/company_frontend/src/app/auth/register/page.tsx` 中，[onSubmit]函数接收一个名为 [data] 的参数，这个参数就是传递给 [registerUserAsync] 的 `userData`。

具体位置在 [page.tsx] 文件的第 153 行：

```typescript
// 定义表单提交处理函数
const onSubmit = async (data: RegisterRequest) => {
  // 清除之前的错误信息
  dispatch(clearError());
  setCsrfError(null);

  try {
    // 调用注册异步操作
    const result = await dispatch(registerUserAsync(data)); // 这里的data就是userData
```

这个 [data]变量是通过 react-hook-form 的 [handleSubmit]函数传递给 [onSubmit] 函数的，包含了表单中所有通过 [register]) 注册的字段值。

在 [store.ts]`/company_frontend/src/app/store.ts` 中，[registerUserAsync] 接收这个 [data] 并将其作为 `userData` 参数传递给 [registerUser] 函数：

```typescript
export const registerUserAsync = createAsyncThunk<
  RegisterResponse, // 返回类型
  RegisterRequest,  // 参数类型
  { rejectValue: string } // 配置对象，定义reject时的返回值类型
>(
  'auth/register', // action类型前缀
  async (userData, { rejectWithValue }) => { // 这里的userData就是从onSubmit传入的data
    // 调用注册API
    const response = await registerUser(userData); // 将userData传递给authService
```

然后在 [authService.ts]`/company_frontend/src/app/services/authService.ts` 中，[registerUser]函数接收这个 `userData` 并将其作为 POST 请求的主体发送到后端：

```typescript
export const registerUser = async (
  userData: RegisterRequest // 这里的userData来自registerUserAsync
): Promise<RegisterResponse> => {
  try {
    // 使用axios实例向/auth/register端点发送POST请求
    const response = await api.post<RegisterResponse>(
      "/auth/register",
      userData // 将userData作为请求体发送
    );
    return response.data;
  }
  // ... 错误处理
}
```

所以，`userData` 变量在注册页面中就是通过表单收集的 [data] 对象。

## 前端发送注册请求的流程

```bash
    A[用户在注册表单中填写数据并点击提交] --> B[react-hook-form handleSubmit 捕获表单提交]
    B --> C[调用在RegisterPage中定义的onSubmit函数]
    C --> D[data参数包含所有已注册的表单字段值]
    D --> E[onSubmit函数中调用 dispatch(registerUserAsync(data))]
    E --> F[Redux Toolkit createAsyncThunk 执行registerUserAsync]
    F --> G[registerUserAsync接收data作为userData参数]
    G --> H[调用authService.ts中的registerUser(userData)函数]
    H --> I[registerUser函数使用axios向/api/auth/register发送POST请求]
    I --> J[请求体包含userData对象]
    J --> K[发送HTTP POST请求到后端]
```


