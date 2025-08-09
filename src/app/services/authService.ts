// 从本地api文件导入配置好的axios实例
import api from "./api";
// 从本地类型定义文件导入注册请求和响应的类型
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "../types/auth";

// 用户登录API函数
// 接收登录数据作为参数，返回Promise<LoginResponse>
export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    // 使用axios实例向/auth/login端点发送POST请求
    // 注意：api是通过axios.create()创建的实例，它继承了axios的所有方法如post、get等
    // 泛型参数<LoginResponse>指定响应数据的类型
    const response = await api.post<LoginResponse>("/auth/login", loginData);
    // 返回响应数据
    return response.data;
  } catch (error: any) {
    // 处理错误响应
    console.error("登录错误:", error);
    if (error.response && error.response.data) {
      // 如果有错误响应数据，返回该数据
      return error.response.data;
    } else if (error.request) {
      // 网络错误或服务器未响应
      return {
        success: false,
        message: "无法连接到服务器，请检查网络连接或稍后再试",
      };
    }
    // 返回默认错误响应
    return {
      success: false,
      message: "网络错误，请稍后重试",
    };
  }
};

// 用户注册API函数
// 接收用户数据作为参数，返回Promise<RegisterResponse>
export const registerUser = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  try {

    // 使用axios实例向/auth/register端点发送POST请求
    // 注意：api是通过axios.create()创建的实例，它继承了axios的所有方法如post、get等
    // 泛型参数<RegisterResponse>指定响应数据的类型
    const response = await api.post<RegisterResponse>(
      "/auth/register",
      userData
    );
    // 返回响应数据
    return response.data;
  } catch (error: any) {
    // 处理错误响应
    console.error("注册错误:", error);
    if (error.response && error.response.data) {
      // 特别处理403错误
      if (error.response.status === 403) {
        // CSRF関連エラーかどうかを判定
        const errorMessage = error.response.data.message || '';
        const isCsrfError = errorMessage.includes('CSRF') ||
          errorMessage.includes('token') ||
          error.response.data.csrfError === true;

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

      // 处理后端验证错误
      if (error.response.data.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.keys(errors).map(
          (key) => `${key}: ${errors[key].join(", ")}`
        );
        return {
          success: false,
          message: `入力内容に問題があります: ${errorMessages.join("; ")}`,
        };
      }

      // 如果有错误响应数据，返回该数据
      return error.response.data;
    } else if (error.request) {
      // 网络错误或服务器未响应
      return {
        success: false,
        message: "サーバーに接続できません。ネットワーク接続を確認してください。",
      };
    }
    // 返回默认错误响应
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

// 检查用户名是否可用的API函数
// 接收用户名作为参数，返回Promise<UsernameCheckResponse>
export const checkUsername = async (username: string): Promise<UsernameCheckResponse> => {
  try {
    // 使用axios实例向/auth/check-username端点发送GET请求
    // 通过查询参数传递用户名
    const response = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);

    // 返回响应数据中的available字段
    return { available: response.data.available };
  } catch (error: any) {
    // 统一错误处理逻辑
    console.error('检查用户名时出错:', error);

    // CSRF関連エラーのチェック
    if (error.response?.status === 403) {
      const errorMessage = error.response.data.message || '';
      const isCsrfError = errorMessage.includes('CSRF') ||
        errorMessage.includes('token') ||
        error.response.data.csrfError === true;

      if (isCsrfError) {
        return {
          available: false,
          csrfError: true
        };
      }
    }

    // 如果错误响应中包含available字段，返回该值
    if (error.response?.data?.available !== undefined) {
      return { available: error.response.data.available };
    }

    // 网络错误或其他异常情况，默认返回用户名不可用
    return { available: false };
  }
};
