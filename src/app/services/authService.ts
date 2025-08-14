// 从本地apiファイル导入配置好的axios实例
import api from "./api";
// 从本地类型定义ファイル导入注册请求和响应のタイプ
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse
} from "../types/auth";

// リフレッシュトークンを使用して新しいアクセストークンを取得する関数
export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    // /auth/refresh エンドポイントにリフレッシュトークンを送信
    const response = await api.post<LoginResponse>("/auth/refresh", {
      refreshToken: refreshToken
    });
    // 成功したレスポンスデータを返す
    return response.data;
  } catch (error: unknown) {
    // エラー処理
    console.error("トークンリフレッシュエラー:", error);
    // errorがAxiosErrorかどうかを確認
    if (error && typeof error === 'object' && 'response' in error && error.response && (error.response as any).data) {
      // サーバーからのエラーレスポンスがある場合
      return (error.response as any).data;
    } else if (error && typeof error === 'object' && 'request' in error) {
      // ネットワークエラーまたはサーバー未応答
      return {
        success: false,
        message: "サーバーに接続できません。ネットワーク接続を確認してください。",
      };
    }
    // デフォルトのエラーレスポンス
    return {
      success: false,
      message: "トークンの更新中にエラーが発生しました。しばらく待ってから再試行してください。",
    };
  }
};

// 検查访问令牌是否过期并刷新
export const checkAndRefreshToken = async (refreshToken: string | null): Promise<LoginResponse | null> => {
  if (!refreshToken) {
    return null;
  }

  // 検查当前トークン是否过期の簡単方法
  // 在实际应用中，您可能需要更复杂的逻辑来确定トークン是否即将过期
  try {
    const response = await refreshAccessToken(refreshToken);
    return response;
  } catch (error) {
    console.error("チェック和刷新トークン時出错:", error);
    return null;
  }
};

// 検查JWTトークン是否即将过期
export const isTokenExpiringSoon = (token: string | null, thresholdSeconds: number = 300): boolean => {
  if (!token) return true;
  
  try {
    // 解码JWTトークン
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // 转换为毫秒
    const now = Date.now();
    
    // 検查是否即将过期（デフォルト5分内）
    return (expiry - now) < (thresholdSeconds * 1000);
  } catch (error) {
    console.error("トークン解析エラー:", error);
    return true; // 如果解析失败，假设トークン已過期
  }
};

// ユーザー登録API関数
// ユーザーデータをパラメータとして受け取り、Promise<RegisterResponse>を返します
export const registerUser = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  try {

    // 使用axiosインスタンス向/auth/registerエンドポイントにPOSTリクエストを送信します
    // 注意：apiはaxios.create()によって作成されたインスタンスで、axiosのすべてのメソッド（post、getなど）を継承しています
    // 泛型パラメータ<RegisterResponse>はレスポンスデータの型を指定します
    const response = await api.post<RegisterResponse>(
      "/auth/register",
      userData
    );
    // レスポンスデータを返します
    return response.data;
  } catch (error: unknown) {
    // エラー処理
    console.error("登録エラー:", error);
    // errorがAxiosErrorかどうかを確認
    if (error && typeof error === 'object' && 'response' in error && error.response && (error.response as any).data) {
      // 特別に403エラーを処理します
      const response = (error.response as any);
      if (response.status === 403) {
        // CSRF関連エラーかどうかを判定
        const errorMessage = response.data.message || '';
        const isCsrfError = errorMessage.includes('CSRF') ||
          errorMessage.includes('token') ||
          response.data.csrfError === true;

        if (isCsrfError) {
          return {
            success: false,
            message: "セキュリティトークンの検証に失敗しました。ページを再読み込みして再試行してください。",
            csrfError: true
          };
        } else {
          return {
            success: false,
            message: "アクセスが拒否されました。権限を確認してください。",
          };
        }
      }

      // バックエンドバリデーションエラーを処理します
      if (response.data.errors) {
        const errors = response.data.errors;
        const errorMessages = Object.keys(errors).map(
          (key) => `${key}: ${errors[key].join(", ")}`
        );
        return {
          success: false,
          message: `入力内容に問題があります: ${errorMessages.join("; ")}`,
        };
      }

      // エラーレスポンスデータがある場合、それを返します
      return response.data;
    } else if (error && typeof error === 'object' && 'request' in error) {
      // ネットワークエラーまたはサーバー未応答
      return {
        success: false,
        message: "サーバーに接続できません。ネットワーク接続を確認してください。",
      };
    }
    // デフォルトのエラーレスポンス
    return {
      success: false,
      message: "ネットワークエラーが発生しました。しばらく待ってから再試行してください。",
    };
  }
};

// ユーザー名チェックレスポンスの型定義
interface UsernameCheckResponse {
  available: boolean;
  csrfError?: boolean;
}

// ユーザー名が利用可能かどうかをチェックするAPI関数
// ユーザー名をパラメータとして受け取り、Promise<UsernameCheckResponse>を返します
export const checkUsername = async (username: string): Promise<UsernameCheckResponse> => {
  try {
    // 使用axiosインスタンスに/auth/check-usernameエンドポイントにGETリクエストを送信します
    // クエリパラメータとしてユーザー名を渡します
    const response = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);

    // レスポンスデータのavailableフィールドを返します
    return { available: response.data.available };
  } catch (error: unknown) {
    // エラー処理
    console.error('ユーザー名チェック時にエラーが発生しました:', error);

    // errorがAxiosErrorかどうかを確認
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response;
      
      // CSRF関連エラーのチェック
      if (response?.status === 403) {
        const errorMessage = response.data.message || '';
        const isCsrfError = errorMessage.includes('CSRF') ||
          errorMessage.includes('token') ||
          response.data.csrfError === true;

        if (isCsrfError) {
          return {
            available: false,
            csrfError: true
          };
        }
      }

      // エラーレスポンスにavailableフィールドがある場合、その値を返します
      if (response?.data?.available !== undefined) {
        return { available: response.data.available };
      }
    }

    // ネットワークエラーまたはその他の異常な場合、デフォルトでユーザー名が利用不可とします
    return { available: false };
  }
};

// ユーザー登出API関数
// Promise<LogoutResponse>を返します
export const logoutUser = async (): Promise<LogoutResponse> => {
  try {
    // 使用axiosインスタンスに/auth/logoutエンドポイントにPOSTリクエストを送信します
    const response = await api.post<LogoutResponse>("/auth/logout");
    // レスポンスデータを返します
    return response.data;
  } catch (error: unknown) {
    // エラー処理
    console.error("ログアウトエラー:", error);
    // errorがAxiosErrorかどうかを確認
    if (error && typeof error === 'object' && 'response' in error && error.response && (error.response as any).data) {
      const response = (error.response as any);
      
      // 特別に403エラー（CSRFエラー）を処理します
      if (response.status === 403) {
        // CSRF関連エラーかどうかを判定
        const errorMessage = response.data.message || '';
        const isCsrfError = errorMessage.includes('CSRF') ||
          errorMessage.includes('token') ||
          response.data.csrfError === true;

        if (isCsrfError) {
          return {
            success: false,
            message: "セキュリティトークンの検証に失敗しました。ページを再読み込みして再試行してください。",
          };
        } else {
          return {
            success: false,
            message: "アクセスが拒否されました。権限を確認してください。",
          };
        }
      }
      
      // エラーレスポンスデータがある場合、それを返します
      return response.data;
    } else if (error && typeof error === 'object' && 'request' in error) {
      // ネットワークエラーまたはサーバー未応答
      return {
        success: false,
        message: "サーバーに接続できません。ネットワーク接続を確認してください。",
      };
    }
    // デフォルトのエラーレスポンス
    return {
      success: false,
      message: "ネットワークエラーが発生しました。しばらく待ってから再試行してください。",
    };
  }
};

// 用户登录API函数
// 接收登录数据作为参数，返回Promise<LoginResponse>
export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    // 使用axiosインスタンス向/auth/login端点发送POSTリクエスト
    // 注意：apiは通过axios.create()作成されたインスタンスで、axiosのすべてのメソッド（post、getなど）を継承しています
    // 泛型パラメータ<LoginResponse>はレスポンスデータの型を指定します
    const response = await api.post<LoginResponse>("/auth/login", loginData);
    // レスポンスデータを返します
    return response.data;
  } catch (error: unknown) {
    // エラー処理
    console.error("ログインエラー:", error);
    // errorがAxiosErrorかどうかを確認
    if (error && typeof error === 'object' && 'response' in error && error.response && (error.response as any).data) {
      // エラーレスポンスデータがある場合、それを返します
      return (error.response as any).data;
    } else if (error && typeof error === 'object' && 'request' in error) {
      // ネットワークエラーまたはサーバー未応答
      return {
        success: false,
        message: "サーバーに接続できません。ネットワーク接続を確認してください。",
      };
    }
    // デフォルトのエラーレスポンス
    return {
      success: false,
      message: "ネットワークエラーが発生しました。しばらく待ってから再試行してください。",
    };
  }
};
