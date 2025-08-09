// 从@reduxjs/toolkit导入必要的函数
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// 从本地服务文件导入认证相关的API调用函数
import { registerUser, checkUsername, loginUser } from './services/authService';
// 从本地类型定义文件导入认证相关的类型
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, User, AuthState } from './types/auth';

// AuthStateは既にtypes/auth.tsで定義されているため、ここでは削除

// 定义初始状态
const initialState: AuthState = {
  user: null, // 初始时没有用户信息
  token: null, // 初始时没有令牌
  refreshToken: null, // 初始时没有刷新令牌
  isAuthenticated: false, // 初始时未认证
  loading: false, // 初始时不在加载状态
  error: null, // 初始时没有错误
  registerSuccess: false, // 初始时注册未成功
};

// 创建异步操作 - 用户注册
// createAsyncThunk用于创建处理异步逻辑的thunk
export const registerUserAsync = createAsyncThunk<
  RegisterResponse, // 返回类型
  RegisterRequest,  // 参数类型
  { rejectValue: string } // 配置对象，定义reject时的返回值类型
>(
  'auth/register', // action类型前缀
  async (userData, { rejectWithValue }) => { // 异步函数实现
    // 调用注册API
    const response = await registerUser(userData);
    // 如果API调用成功
    if (response.success) {
      // 返回成功的响应数据
      return response;
    } else {
      // 如果API调用失败，返回被拒绝的值（错误信息）
      return rejectWithValue(response.message || '注册失败');
    }
  }
);

// 创建异步操作 - 用户登录
// createAsyncThunk用于创建处理异步逻辑的thunk
export const loginUserAsync = createAsyncThunk<
  LoginResponse, // 返回类型
  LoginRequest,  // 参数类型
  { rejectValue: string } // 配置对象，定义reject时的返回值类型
>(
  'auth/login', // action类型前缀
  async (loginData, { rejectWithValue }) => { // 异步函数实现
    // 调用登录API
    const response = await loginUser(loginData);
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

// 创建异步操作 - 检查用户名是否可用
// 这个异步操作的处理逻辑与registerUserAsync不同，原因如下：
// 1. checkUsername API返回的是 { success: boolean, available: boolean, message: string } 结构
// 2. 但我们只关心 available 字段的值（true/false）
// 3. 所以我们将 available 字段提取出来作为返回值
// 4. 而registerUserAsync需要返回完整的响应对象，因为组件可能需要访问其中的多个字段
export const checkUsernameAsync = createAsyncThunk<
  boolean, // 返回类型（用户名是否可用）
  string,  // 参数类型（用户名）
  { rejectValue: string } // 配置对象
>(
  'auth/checkUsername', // action类型前缀
  // 这个username参数是在调用checkUsernameAsync时传入的
  // 例如：dispatch(checkUsernameAsync("test@example.com"))
  // 其中"test@example.com"就是这里的username参数
  async (username, { rejectWithValue }) => { // 异步函数实现
    // 如果用户名为空
    if (!username) {
      // 返回被拒绝的值（错误信息）
      return rejectWithValue('用户名不能为空');
    }
    
    try {
      // 调用检查用户名API
      // checkUsername函数返回的是 { available: boolean } 对象
      const result = await checkUsername(username);
      // 我们只需要返回available字段的值
      return result.available;
    } catch (error) {
      // 处理API调用错误
      console.error('检查用户名时发生错误:', error);
      return rejectWithValue('检查用户名时发生错误');
    }
  }
);

// 创建auth slice（Redux Toolkit中的概念，用于管理状态切片）
const authSlice = createSlice({
  name: 'auth', // slice名称
  initialState, // 初始状态
  reducers: { // 同步reducers
    // 清除错误信息的reducer
    clearError: (state) => {
      // 将错误信息设置为null
      state.error = null;
    },
    // 清除注册成功状态的reducer
    clearRegisterSuccess: (state) => {
      // 将注册成功状态设置为false
      state.registerSuccess = false;
    },
    // 登出的reducer
    logout: (state) => {
      // 清除用户信息
      state.user = null;
      // 清除令牌
      state.token = null;
      // 清除刷新令牌
      state.refreshToken = null;
      // 设置为未认证状态
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => { // 异步操作的reducers
    // 处理用户登录的各个状态
    builder.addCase(loginUserAsync.pending, (state) => { // 处理登录pending状态（请求发送中）
      state.loading = true; // 设置为加载状态
      state.error = null; // 清除之前的错误信息
    });
    
    builder.addCase(loginUserAsync.fulfilled, (state, action) => { // 处理登录fulfilled状态（请求成功）
      state.loading = false; // 结束加载状态
      
      // 如果登录成功
      if (action.payload.success && action.payload.token && action.payload.user) {
        // 保存用户信息
        state.user = {
          id: action.payload.user.id,
          username: action.payload.user.name,
          fullName: action.payload.user.name,
          departmentId: action.payload.user.departmentId,
          departmentName: action.payload.user.departmentName,
          positionId: action.payload.user.positionId,
          positionName: action.payload.user.positionName,
          role: action.payload.user.role,
          locationType: action.payload.user.locationType,
        };
        // 保存令牌
        state.token = action.payload.token;
        // 保存刷新令牌（如果存在）
        state.refreshToken = action.payload.refreshToken || null;
        // 设置为已认证状态
        state.isAuthenticated = true;
      }
    });
    
    builder.addCase(loginUserAsync.rejected, (state, action) => { // 处理登录rejected状态（请求失败）
      state.loading = false; // 结束加载状态
      state.error = action.payload || '登录失败'; // 设置错误信息为reject时返回的值或默认信息
    });
    
    // 处理用户注册的各个状态
    builder.addCase(registerUserAsync.pending, (state) => { // 处理注册pending状态（请求发送中）
      state.loading = true; // 设置为加载状态
      state.error = null; // 清除之前的错误信息
      state.registerSuccess = false; // 重置注册成功状态
    });
    
    builder.addCase(registerUserAsync.fulfilled, (state, action) => { // 处理注册fulfilled状态（请求成功）
      state.loading = false; // 结束加载状态
      
      // 如果注册成功
      if (action.payload.success) {
        // 设置注册成功状态
        state.registerSuccess = true;
      }
    });
    
    builder.addCase(registerUserAsync.rejected, (state, action) => { // 处理注册rejected状态（请求失败）
      state.loading = false; // 结束加载状态
      state.error = action.payload || '注册失败'; // 设置错误信息为reject时返回的值或默认信息
    });
    
    // 处理检查用户名的各个状态
    builder.addCase(checkUsernameAsync.pending, (state) => { // 处理检查用户名pending状态（请求发送中）
      state.loading = true; // 设置为加载状态
      state.error = null; // 清除之前的错误信息
    });
    
    builder.addCase(checkUsernameAsync.fulfilled, (state) => { // 处理检查用户名fulfilled状态（请求成功）
      state.loading = false; // 结束加载状态
      state.error = null; // 确保清除任何之前的错误信息
    });
    
    builder.addCase(checkUsernameAsync.rejected, (state, action) => { // 处理检查用户名rejected状态（请求失败）
      state.loading = false; // 结束加载状态
      // 使用更友好的错误信息
      const errorMessage = action.payload === '检查用户名时发生错误' 
        ? '无法完成用户名检查，请稍后再试' 
        : action.payload || '用户名检查失败';
      state.error = errorMessage;
    });
  },
});

// 导出actions，以便在组件中使用
export const { clearError, clearRegisterSuccess, logout } = authSlice.actions;

// 导出选择器函数，用于从Redux store中选择特定的状态
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
export const selectRegisterSuccess = (state: RootState) => state.auth.registerSuccess;

// 更新RootState类型，基于store的getState方法推断
export type RootState = ReturnType<typeof store.getState> & {
  auth: AuthState;
};
// 创建store，使用configureStore配置Redux store
// 注意：这个store是在这里定义的，不是从其他地方引入的
// configureStore是Redux Toolkit提供的函数，用于创建Redux store
export const store = configureStore({
  reducer: {
    // 将auth slice的reducer添加到store中
    auth: authSlice.reducer,
  },
});

// 定义AppDispatch类型，基于store的dispatch方法
export type AppDispatch = typeof store.dispatch;


// 默认导出auth slice的reducer
export default authSlice.reducer;
