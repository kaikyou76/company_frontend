import axios from 'axios';

// CSRF関連の型定義
export interface CsrfTokenResponse {
  success: boolean;
  csrfToken: string;
  expiresIn: number;
  message: string;
}

export interface CsrfErrorResponse {
  success: false;
  message: string;
  code?: string;
}

// CSRFトークン管理クラス
class CsrfService {
  private token: string | null = null;
  private expiresAt: number | null = null;
  private readonly baseURL: string;

  constructor() {
    this.baseURL = this.getApiBaseUrl();
  }

  /**
   * 環境に応じたAPI Base URLを取得
   */
  private getApiBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

    console.log('環境変数チェック:', { envUrl, environment });

    // 環境変数が設定されている場合はそれを使用
    if (envUrl) {
      console.log('環境変数からURLを使用:', envUrl);
      return envUrl;
    }

    // フォールバック: 現在のプロトコルに基づいて自動判定
    if (typeof window !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      if (isHttps && environment === 'production') {
        return 'https://ec2-35-75-6-50.ap-northeast-1.compute.amazonaws.com/api';
      }
    }

    // デフォルトは開発環境
    console.log('デフォルトの開発環境URLを使用');
    return 'https://localhost:8443/api';
  }

  /**
   * CSRFトークンを取得する
   * 既存のトークンが有効な場合はそれを返し、無効な場合は新しいトークンを取得
   */
  async getCsrfToken(): Promise<string> {
    // 既存のトークンが有効かチェック
    if (this.isTokenValid()) {
      // 有効なトークンがある場合はそれを返すが、Cookieからも確認する
      const cookieToken = this.getCsrfTokenFromCookie();
      if (cookieToken) {
        return cookieToken;
      }
      return this.token!;
    }

    // 新しいトークンを取得
    return await this.refreshCsrfToken();
  }

  /**
   * 新しいCSRFトークンを取得する
   */
  async refreshCsrfToken(): Promise<string> {
    try {
      // CSRFトークン取得用の専用axiosインスタンスを作成
      // 通常のAPIインスタンスを使うと循環参照が発生する可能性があるため
      const csrfAxios = axios.create({
        baseURL: this.baseURL,
        timeout: 10000,
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const response = await csrfAxios.get<CsrfTokenResponse>('/csrf/token');

      if (response.data.success) {
        this.token = response.data.csrfToken;
        // 有効期限を現在時刻 + expiresIn秒で設定
        this.expiresAt = Date.now() + (response.data.expiresIn * 1000);

        // Double Submit Cookie パターン: Cookieのトークンを優先使用
        if (typeof window !== 'undefined') {
          const cookieToken = this.getCsrfTokenFromCookie();
          console.log('Cookieからのトークン:', cookieToken ? cookieToken.substring(0, 10) + '...' : 'なし');
          console.log('レスポンスからのトークン:', this.token ? this.token.substring(0, 10) + '...' : 'なし');

          // Cookieのトークンが存在する場合は必ずそれを使用
          if (cookieToken) {
            this.token = cookieToken;
            console.log('CookieのCSRFトークンを使用します');
          } else {
            console.warn('CookieにCSRFトークンがありません。レスポンストークンを使用します。');
          }
        }

        console.log('CSRFトークン取得成功:', this.token);
        console.log('使用したエンドポイント:', this.baseURL + '/csrf/token');
        console.log('現在のプロトコル:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');
        return this.token;
      } else {
        throw new Error(response.data.message || 'CSRFトークンの取得に失敗しました');
      }
    } catch (error: unknown) {
      console.error('CSRFトークン取得エラー:', error);

      // エラーメッセージを日本語化
      let errorMessage = 'CSRFトークンの取得に失敗しました';

      // errorがAxiosErrorかどうかを確認
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        // サーバーからのエラーレスポンス
        if (response.status === 401) {
          errorMessage = '認証が必要です。ログインしてください。';
        } else if (response.status === 403) {
          errorMessage = 'アクセスが拒否されました。';
        } else if (response.status >= 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        // ネットワークエラー（混合コンテンツエラーを含む）
        const axiosError = error as any;
        if (axiosError.code === 'ERR_NETWORK') {
          // 混合コンテンツエラーの可能性を検出
          if (typeof window !== 'undefined' && window.location.protocol === 'https:' &&
            this.baseURL.startsWith('http:')) {
            errorMessage = '混合コンテンツエラー: HTTPSページからHTTPリクエストはブロックされます。サーバーのHTTPS設定を確認してください。';
          } else {
            errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
          }
        } else {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * 現在のトークンが有効かどうかをチェック
   */
  isTokenValid(): boolean {
    if (!this.token || !this.expiresAt) {
      return false;
    }

    // 有効期限の1分前をバッファとして設定（自動更新のため）
    const bufferTime = 60 * 1000; // 1分
    return Date.now() < (this.expiresAt - bufferTime);
  }

  /**
   * 現在のトークンを取得（有効性チェックなし）
   */
  getCurrentToken(): string | null {
    // 常にCookieから最新のトークンを取得
    const cookieToken = this.getCsrfTokenFromCookie();
    if (cookieToken) {
      return cookieToken;
    }
    return this.token;
  }

  /**
   * トークンをクリア
   */
  clearToken(): void {
    this.token = null;
    this.expiresAt = null;
  }

  /**
   * トークンの有効期限を取得
   */
  getTokenExpiration(): Date | null {
    return this.expiresAt ? new Date(this.expiresAt) : null;
  }

  /**
   * CookieからCSRFトークンを取得
   */
  private getCsrfTokenFromCookie(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        console.log(`Cookie発見: ${name} = ${value ? value.substring(0, 10) + '...' : 'empty'}`);
        return decodeURIComponent(value || '');
      }
    }

    console.log('XSRF-TOKEN Cookieが見つかりません');
    return null;
  }

  /**
   * アプリケーション初期化時にCSRFトークンを事前取得
   */
  async initializeCsrfToken(): Promise<void> {
    try {
      // まずCookieから既存のトークンを確認
      const cookieToken = this.getCsrfTokenFromCookie();
      if (cookieToken) {
        this.token = cookieToken;
        this.expiresAt = Date.now() + (30 * 60 * 1000); // 30分
        console.log('CSRF初期化完了（Cookieから）:', cookieToken.substring(0, 10) + '...');
        return;
      }

      // Cookieにない場合は新しいトークンを取得
      await this.getCsrfToken();
      console.log('CSRF初期化完了（新規取得）');
    } catch (error) {
      console.error('CSRF初期化失敗:', error);
      // 初期化失敗は致命的ではないため、エラーをスローしない
    }
  }
}

// シングルトンインスタンスを作成・エクスポート
export const csrfService = new CsrfService();
export default csrfService;