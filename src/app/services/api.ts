import axios from 'axios';
import { csrfService } from './csrfService';

// API設定の型定義
interface ApiConfig {
  baseURL: string;
  timeout: number;
}

// APIエラーレスポンスの型定義
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// APIクライアントクラス
class ApiClient {
  private axiosInstance;
  private config: ApiConfig;

  constructor() {
    this.config = this.getApiConfig();
    this.axiosInstance = this.createAxiosInstance();
  }

  /**
   * 環境に応じたAPI設定を取得
   */
  private getApiConfig(): ApiConfig {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

    console.log('API設定環境変数チェック:', { envUrl, environment });

    return {
      baseURL: envUrl || this.getDefaultBaseUrl(environment),
      timeout: 30000 // 30秒
    };
  }

  /**
   * 環境に応じたデフォルトのベースURLを取得
   */
  private getDefaultBaseUrl(environment: string): string {
    if (environment === 'production') {
      return 'https://api.kaikyou.dpdns.org';
    }
    return 'https://localhost:443/api';
  }

  /**
   * Axiosインスタンスを作成
   */
  private createAxiosInstance() {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // リクエストインターセプター
    instance.interceptors.request.use(
      async (config) => {
        try {
          // CSRFトークンを取得してヘッダーに追加
          const csrfToken = await csrfService.getCsrfToken();
          if (csrfToken && config.headers) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
          }
        } catch (error) {
          console.error('CSRFトークンの取得に失敗しました:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // 認証エラーの場合、トークンをクリア
          csrfService.clearToken();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }

  /**
   * GETリクエスト
   */
  public async get<T>(url: string, params?: any): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      const response = await this.axiosInstance.get(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POSTリクエスト
   */
  public async post<T>(url: string, data?: any): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      const response = await this.axiosInstance.post(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PUTリクエスト
   */
  public async put<T>(url: string, data?: any): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      const response = await this.axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETEリクエスト
   */
  public async delete<T>(url: string): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      const response = await this.axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * エラー処理
   */
  private handleError(error: any): ApiErrorResponse {
    console.error('APIエラー:', error);
    
    if (error.response) {
      // サーバーからのレスポンスがある場合
      return {
        success: false,
        message: error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`,
        code: error.response.status.toString()
      };
    } else if (error.request) {
      // リクエストは送ったがレスポンスがない場合
      return {
        success: false,
        message: 'サーバーに接続できません。ネットワークを確認してください。',
        code: 'NETWORK_ERROR'
      };
    } else {
      // リクエストの準備中にエラーが発生した場合
      return {
        success: false,
        message: error.message || 'リクエストの送信中にエラーが発生しました。',
        code: 'REQUEST_ERROR'
      };
    }
  }
}

// シングルトンインスタンスをエクスポート
const apiClient = new ApiClient();
export default apiClient;