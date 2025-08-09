// CSRF保護対応のAPI呼び出しユーティリティ

class ApiClient {
  constructor(baseUrl = 'http://localhost:8091/api') {
    this.baseUrl = baseUrl;
    this.csrfToken = null;
  }

  // CSRFトークンを取得
  async getCsrfToken() {
    try {
      const response = await fetch(`${this.baseUrl}/csrf/token`, {
        method: 'GET',
        credentials: 'include', // Cookieを含める
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
        console.log('CSRF token取得成功:', this.csrfToken);
        return this.csrfToken;
      } else {
        throw new Error(`CSRF token取得失敗: ${response.status}`);
      }
    } catch (error) {
      console.error('CSRF token取得エラー:', error);
      throw error;
    }
  }

  // CSRFトークンを確保してからAPIを呼び出す
  async makeRequest(url, options = {}) {
    // CSRFトークンがない場合は取得
    if (!this.csrfToken) {
      await this.getCsrfToken();
    }

    // デフォルトヘッダーを設定
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    // CSRFトークンをヘッダーに追加
    if (this.csrfToken) {
      headers['X-CSRF-TOKEN'] = this.csrfToken;
    }

    const requestOptions = {
      credentials: 'include', // Cookieを含める
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseUrl}${url}`, requestOptions);
      
      // CSRF token無効の場合は再取得して再試行
      if (response.status === 403) {
        console.log('CSRF token無効、再取得して再試行');
        await this.getCsrfToken();
        headers['X-CSRF-TOKEN'] = this.csrfToken;
        
        const retryResponse = await fetch(`${this.baseUrl}${url}`, {
          ...requestOptions,
          headers
        });
        
        return retryResponse;
      }
      
      return response;
    } catch (error) {
      console.error('API呼び出しエラー:', error);
      throw error;
    }
  }

  // ユーザー登録
  async registerUser(userData) {
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('ユーザー登録成功:', data);
        return data;
      } else {
        throw new Error(data.message || 'ユーザー登録に失敗しました');
      }
    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      throw error;
    }
  }

  // ログイン
  async loginUser(credentials) {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('ログイン成功:', data);
        return data;
      } else {
        throw new Error(data.message || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  }

  // ユーザー名重複チェック
  async checkUsername(username) {
    try {
      const response = await this.makeRequest(`/auth/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET'
      });

      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'ユーザー名チェックに失敗しました');
      }
    } catch (error) {
      console.error('ユーザー名チェックエラー:', error);
      throw error;
    }
  }
}

// 使用例
const apiClient = new ApiClient();

// ユーザー登録の例
async function handleUserRegistration(formData) {
  try {
    const userData = {
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      fullName: formData.fullName,
      locationType: formData.locationType || 'office',
      clientLatitude: formData.clientLatitude,
      clientLongitude: formData.clientLongitude,
      departmentId: formData.departmentId,
      positionId: formData.positionId,
      managerId: formData.managerId
    };

    const result = await apiClient.registerUser(userData);
    
    // 成功時の処理
    alert('ユーザー登録が完了しました！');
    console.log('登録結果:', result);
    
    return result;
  } catch (error) {
    // エラー時の処理
    alert(`登録エラー: ${error.message}`);
    console.error('登録失敗:', error);
    throw error;
  }
}

// ログインの例
async function handleUserLogin(credentials) {
  try {
    const result = await apiClient.loginUser({
      employeeCode: credentials.employeeCode,
      password: credentials.password
    });
    
    // 成功時の処理
    localStorage.setItem('accessToken', result.accessToken);
    alert('ログインしました！');
    
    return result;
  } catch (error) {
    // エラー時の処理
    alert(`ログインエラー: ${error.message}`);
    console.error('ログイン失敗:', error);
    throw error;
  }
}

// ユーザー名チェックの例
async function handleUsernameCheck(username) {
  try {
    const result = await apiClient.checkUsername(username);
    
    if (result.available) {
      console.log('ユーザー名は利用可能です');
    } else {
      console.log('ユーザー名は既に使用されています');
    }
    
    return result;
  } catch (error) {
    console.error('ユーザー名チェック失敗:', error);
    throw error;
  }
}

// エクスポート（モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiClient, handleUserRegistration, handleUserLogin, handleUsernameCheck };
}