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
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8091/api';
  }

  /**
   * CSRFトークンを取得する
   * 既存のトークンが有効な場合はそれを返し、無効な場合は新しいトークンを取得
   */
  async getCsrfToken(): Promise<string> {
    // 既存のトークンが有効かチェック
    if (this.isTokenValid()) {
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

        // CSRFトークンをCookieからも確認（Double Submit Cookie パターン）
        if (typeof window !== 'undefined') {
          const cookieToken = this.getCsrfTokenFromCookie();
          if (cookieToken && cookieToken !== this.token) {
            console.warn('CSRFトークンがCookieと一致しません。Cookieのトークンを使用します。');
            this.token = cookieToken;
          }
        }

        console.log('CSRFトークン取得成功:', this.token);
        return this.token;
      } else {
        throw new Error(response.data.message || 'CSRFトークンの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('CSRFトークン取得エラー:', error);

      // エラーメッセージを日本語化
      let errorMessage = 'CSRFトークンの取得に失敗しました';

      if (error.response) {
        // サーバーからのエラーレスポンス
        if (error.response.status === 401) {
          errorMessage = '認証が必要です。ログインしてください。';
        } else if (error.response.status === 403) {
          errorMessage = 'アクセスが拒否されました。';
        } else if (error.response.status >= 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // ネットワークエラー
        errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
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
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'CSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * アプリケーション初期化時にCSRFトークンを事前取得
   */
  async initializeCsrfToken(): Promise<void> {
    try {
      await this.getCsrfToken();
      console.log('CSRF初期化完了');
    } catch (error) {
      console.error('CSRF初期化失敗:', error);
      // 初期化失敗は致命的ではないため、エラーをスローしない
    }
  }
}

// シングルトンインスタンスを作成・エクスポート
export const csrfService = new CsrfService();
export default csrfService;