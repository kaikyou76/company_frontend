// 从@reduxjs/toolkit导入必要な函数
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// 从本地服务文件导入认证相关的API调用函数
import { registerUser, checkUsername, logoutUser, refreshAccessToken, isTokenExpiringSoon, loginUser } from './services/authService';
// 从本地类型定义ファイル导入认证相关的类型
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, AuthState, LogoutResponse } from './types/auth';

// AuthStateは既にtypes/auth.tsで定義されているため、ここでは削除

// 定义初始状态
const initialState: AuthState = {
  user: null, // 初期時没有用户信息
  token: null, // 初期時没有令牌
  refreshToken: null, // 初期時没有刷新トークン
  isAuthenticated: false, // 初期時未认证
  loading: false, // 初期時不在加载状态
  error: null, // 初期時没有错误
  registerSuccess: false, // 初期時注册未成功
};

// 创建异步操作 - 检查并刷新访问令牌
export const checkAndRefreshTokenAsync = createAsyncThunk<
  { token: string | null; refreshToken: string | null } | null, // 返回类型
  void, // 参数类型
  { rejectValue: string; state: RootState } // 配置对象
>(
  'auth/checkAndRefreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      
      // 检查是否有刷新令牌
      if (!state.auth.refreshToken) {
        return null;
      }
      
      // 检查访问令牌是否即将过期
      if (isTokenExpiringSoon(state.auth.token)) {
        // 刷新トークン
        const response = await refreshAccessToken(state.auth.refreshToken);
        if (response.success && response.token) {
          return {
            token: response.token,
            refreshToken: response.refreshToken || state.auth.refreshToken
          };
        } else {
          // 刷新失败
          return rejectWithValue(response.message || 'トークンの更新に失敗しました');
        }
      }
      
      // トークン未过期、不需要刷新
      return null;
    } catch (error) {
      console.error('トークンチェックエラー:', error);
      return rejectWithValue('トークンのチェック中にエラーが発生しました');
    }
  }
);

// 创建异步操作 - 刷新アクセストークン
export const refreshAccessTokenAsync = createAsyncThunk<
  LoginResponse, // 返回类型
  string,        // パラメータタイプ（刷新トークン）
  { rejectValue: string } // 配置オブジェクト
>(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await refreshAccessToken(refreshToken);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message || 'トークンの更新に失敗しました');
      }
    } catch (error) {
      console.error('トークン更新エラー:', error);
      return rejectWithValue('トークンの更新中にエラーが発生しました');
    }
  }
);

// 创建异步操作 - ユーザー登録
// createAsyncThunk用于创建処理異步ロジックのthunk
export const registerUserAsync = createAsyncThunk<
  RegisterResponse, // 返回タイプ
  RegisterRequest,  // パラメータタイプ
  { rejectValue: string } // 配置オブジェクト、reject時の戻り値の型を定義
>(
  'auth/register', // actionタイプ前缀
  async (userData, { rejectWithValue }) => { // 非同期関数の実装
    // 登録APIを呼び出す
    const response = await registerUser(userData);
    // API呼び出しが成功した場合
    if (response.success) {
      // 成功したレスポンスデータを返す
      return response;
    } else {
      // API呼び出しが失敗した場合、拒否された値（エラーメッセージ）を返す
      return rejectWithValue(response.message || '登録失敗');
    }
  }
);

// 创建异步操作 - ユーザーログイン
// createAsyncThunk用于创建処理異步ロジックのthunk
export const loginUserAsync = createAsyncThunk<
  LoginResponse, // 返回タイプ
  LoginRequest,  // パラメータタイプ
  { rejectValue: string } // 配置オブジェクト、reject時の戻り値の型を定義
>(
  'auth/login', // actionタイプ前缀
  async (loginData, { rejectWithValue }) => { // 非同期関数の実装
    // ログインAPIを呼び出す
    const response = await loginUser(loginData);
    // API呼び出しが成功した場合
    if (response.success) {
      // 成功したレスポンスデータを返す
      return response;
    } else {
      // API呼び出しが失敗した場合、拒否された値（エラーメッセージ）を返す
      return rejectWithValue(response.message || 'ログイン失敗');
    }
  }
);

// 创建异步操作 - ユーザー登出
// createAsyncThunk用于创建処理異步ロジックのthunk
export const logoutUserAsync = createAsyncThunk<
  LogoutResponse, // 返回タイプ（登出レスポンス）
  void,    // パラメータタイプ（無パラメータ）
  { rejectValue: string } // 配置オブジェクト
>(
  'auth/logout', // actionタイプ前缀
  async (_, { rejectWithValue }) => { // 异步関数実装
    try {
      // 調用登出API
      const response = await logoutUser();
      // 返回登出結果
      return response;
    } catch (error) {
      // 处理API呼び出しエラー
      console.error('登出時发生エラー:', error);
      return rejectWithValue('登出時发生エラー');
    }
  }
);

// 创建异步操作 - ユーザ名が利用可能かどうかをチェック
// この非同期操作の処理ロジックはregisterUserAsyncとは異なります。理由は以下の通りです：
// 1. checkUsername APIは { success: boolean, available: boolean, message: string } 構造を返します
// 2. しかし、available フィールドの値（true/false）のみに関心があります
// 3. したがって、available フィールドを抽出して戻り値として返します
// 4. registerUserAsyncは、コンポーネントが複数のフィールドにアクセスできるように、完全なレスポンスオブジェクトを返す必要があります
export const checkUsernameAsync = createAsyncThunk<
  boolean, // 戻り値の型（ユーザーネームが利用可能かどうか）
  string,  // パラメータの型（ユーザーネーム）
  { rejectValue: string } // 設定オブジェクト
>(
  'auth/checkUsername', // アクションタイプのプレフィックス
  // このusernameパラメータはcheckUsernameAsyncを呼び出すときに渡されます
  // 例：dispatch(checkUsernameAsync("test@example.com"))
  // ここで"test@example.com"がこのusernameパラメータです
  async (username, { rejectWithValue }) => { // 非同期関数の実装
    // ユーザーネームが空の場合
    if (!username) {
      // 拒否された値（エラーメッセージ）を返す
      return rejectWithValue('ユーザーネームが空です');
    }
    
    try {
      // ユーザーネームチェックAPIを呼び出す
      // checkUsername関数は { available: boolean } オブジェクトを返します
      const result = await checkUsername(username);
      // availableフィールドの値のみを返します
      return result.available;
    } catch (error) {
      // API呼び出しエラーを処理
      console.error('ユーザーネームチェック時にエラーが発生しました:', error);
      return rejectWithValue('ユーザーネームチェック時にエラーが発生しました');
    }
  }
);

// 作成auth slice（Redux Toolkitの概念で、状態スライスを管理します）
const authSlice = createSlice({
  name: 'auth', // slice名称
  initialState, // 初期状態
  reducers: { // 同期reducers
    // 清除错误情報のreducer
    clearError: (state) => {
      // 将错误情報設定为null
      state.error = null;
    },
    // 清除注册成功状态のreducer
    clearRegisterSuccess: (state) => {
      // 将注册成功状态設定为false
      state.registerSuccess = false;
    },
    // 登出のreducer
    logout: (state) => {
      // 清除用户信息
      state.user = null;
      // 清除令牌
      state.token = null;
      // 清除刷新トークン
      state.refreshToken = null;
      // 设置为未認証状态
      state.isAuthenticated = false;
    },
    // 更新認証トークンのreducer
    updateTokens: (state, action) => {
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
  extraReducers: (builder) => { // 异步操作のreducers
    // 处理用户登录の各个状态
    builder.addCase(loginUserAsync.pending, (state) => { // 处理登录pending状态（请求发送中）
      state.loading = true; // 设置为加载状态
      state.error = null; // 清除之前的错误情報
    });
    
    builder.addCase(loginUserAsync.fulfilled, (state, action) => { // 处理登录fulfilled状态（请求成功）
      state.loading = false; // 结束加载状态
      
      // If login is successful
      if (action.payload.success && action.payload.token && action.payload.user) {
        // 保存ユーザー情報
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
        // 保存アクセストークン
        state.token = action.payload.token;
        // 保存リフレッシュトークン（もし存在する場合）
        state.refreshToken = action.payload.refreshToken || null;
        // 認証済み状態に設定
        state.isAuthenticated = true;
      }
    });
    
    builder.addCase(loginUserAsync.rejected, (state, action) => { // 处理登录rejected状态（请求失败）
      state.loading = false; // 结束加载状态
      state.error = action.payload || 'ログイン失敗'; // 设置错误情報为reject時返回の値或默认情報
    });
    
    // 处理刷新トークンの各个状态
    builder.addCase(refreshAccessTokenAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(refreshAccessTokenAsync.fulfilled, (state, action) => {
      state.loading = false;
      
      if (action.payload.success && action.payload.token) {
        // 更新アクセストークン
        state.token = action.payload.token;
        // If a new refresh token is returned, update it
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        // Ensure the user remains authenticated
        state.isAuthenticated = true;
      }
    });

    builder.addCase(refreshAccessTokenAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'トークンの更新に失敗しました';
      // 刷新トークン失败時、清除認証状態
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });
    
    // 处理チェック并刷新トークンの各个状态
    builder.addCase(checkAndRefreshTokenAsync.fulfilled, (state, action) => {
      if (action.payload) {
        // 更新トークン
        if (action.payload.token) {
          state.token = action.payload.token;
        }
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      }
    });

    builder.addCase(checkAndRefreshTokenAsync.rejected, (state) => {
      // 検查和刷新トークン失败時、清除認証状態
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });

    // 处理ユーザー登出の各个状態
    builder.addCase(logoutUserAsync.pending, (state) => { // ログアウトpending状態（リクエスト送信中）を処理
      state.loading = true; // ローディング状態に設定
      state.error = null; // 以前のエラーメッセージをクリア
    });

    builder.addCase(logoutUserAsync.fulfilled, (state) => { // ログアウトfulfilled状態（リクエスト成功）を処理
      state.loading = false; // ローディング状態を終了
      
      // バックエンドが成功したかどうかに関わらず、フロントエンドは状態をクリアする必要があります
      // ユーザー情報をクリア
      state.user = null;
      // トークンをクリア
      state.token = null;
      // リフレッシュトークンをクリア
      state.refreshToken = null;
      // 未認証状態に設定
      state.isAuthenticated = false;
    });

    builder.addCase(logoutUserAsync.rejected, (state, action) => { // ログアウトrejected状態（リクエスト失敗）を処理
      state.loading = false; // ローディング状態を終了
      
      // ログアウトリクエストが失敗した場合でも、ローカル状態をクリアする必要があります
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // エラーメッセージはオプションでユーザーに表示できます
      state.error = action.payload || 'ログアウト失敗';
    });
    
    // ユーザーレジスタの各状態を処理
    builder.addCase(registerUserAsync.pending, (state) => { // レジスタpending状態（リクエスト送信中）を処理
      state.loading = true; // ローディング状態に設定
      state.error = null; // 以前のエラーメッセージをクリア
      state.registerSuccess = false; // レジスタ成功状態をリセット
    });
    
    builder.addCase(registerUserAsync.fulfilled, (state, action) => { // レジスタfulfilled状態（リクエスト成功）を処理
      state.loading = false; // ローディング状態を終了
      
      // レジスタが成功した場合
      if (action.payload.success) {
        // レジスタ成功状態を設定
        state.registerSuccess = true;
      }
    });
    
    builder.addCase(registerUserAsync.rejected, (state, action) => { // レジスタrejected状態（リクエスト失敗）を処理
      state.loading = false; // ローディング状態を終了
      state.error = action.payload || 'レジスタ失敗'; // リジェクト時に返された値またはデフォルトメッセージをエラーメッセージに設定
    });
    
    // ユーザーネームチェックの各状態を処理
    builder.addCase(checkUsernameAsync.pending, (state) => { // ユーザーネームチェックpending状態（リクエスト送信中）を処理
      state.loading = true; // ローディング状態に設定
      state.error = null; // 以前のエラーメッセージをクリア
    });
    
    builder.addCase(checkUsernameAsync.fulfilled, (state) => { // ユーザーネームチェックfulfilled状態（リクエスト成功）を処理
      state.loading = false; // ローディング状態を終了
      state.error = null; // 以前のエラーメッセージを確実にクリア
    });
    
    builder.addCase(checkUsernameAsync.rejected, (state, action) => { // ユーザーネームチェックrejected状態（リクエスト失敗）を処理
      state.loading = false; // ローディング状態を終了
      // よりフレンドリーなエラーメッセージを使用
      const errorMessage = action.payload === 'ユーザーネームチェック時にエラーが発生しました' 
        ? 'ユーザーネームチェックを完了できませんでした。後ほどお試しください' 
        : action.payload || 'ユーザーネームチェック失敗';
      state.error = errorMessage;
    });
  },
});

// actionsをエクスポートし、コンポーネントで使用できるようにする
export const { clearError, clearRegisterSuccess, logout } = authSlice.actions;

// 選択器関数をエクスポートし、Redux storeから特定の状態を選択するために使用する
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
export const selectRegisterSuccess = (state: RootState) => state.auth.registerSuccess;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// storeのgetStateメソッドから推論されるstoreのgetStateの戻り値の型を更新
export type RootState = ReturnType<typeof store.getState>;
// Redux storeを作成し、configureStoreを使用してRedux storeを構成
// 注意：このstoreはここで定義され、他の場所からインポートされません
// configureStoreはRedux Toolkitが提供する関数で、Redux storeを作成するために使用されます
export const store = configureStore({
  reducer: {
    // storeにauth sliceのreducerを追加する
    auth: authSlice.reducer,
  },
});

// storeのdispatchメソッドから推論されるAppDispatchの型を定義
export type AppDispatch = typeof store.dispatch;


// auth sliceのreducerをデフォルトでエクスポート
export default authSlice.reducer;