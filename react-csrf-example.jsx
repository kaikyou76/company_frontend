// React/Next.jsでのCSRF対応登録フォームの例

import React, { useState, useEffect } from 'react';

// APIクライアントクラス（上記のApiClientを使用）
class ApiClient {
  constructor(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8091/api') {
    this.baseUrl = baseUrl;
    this.csrfToken = null;
  }

  async getCsrfToken() {
    try {
      const response = await fetch(`${this.baseUrl}/csrf/token`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
        return this.csrfToken;
      } else {
        throw new Error(`CSRF token取得失敗: ${response.status}`);
      }
    } catch (error) {
      console.error('CSRF token取得エラー:', error);
      throw error;
    }
  }

  async makeRequest(url, options = {}) {
    if (!this.csrfToken) {
      await this.getCsrfToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    if (this.csrfToken) {
      headers['X-CSRF-TOKEN'] = this.csrfToken;
    }

    const requestOptions = {
      credentials: 'include',
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseUrl}${url}`, requestOptions);
      
      if (response.status === 403) {
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

  async registerUser(userData) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'ユーザー登録に失敗しました');
    }
  }
}

// グローバルAPIクライアントインスタンス
const apiClient = new ApiClient();

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    locationType: 'office',
    clientLatitude: null,
    clientLongitude: null,
    departmentId: 1,
    positionId: 1,
    managerId: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // コンポーネントマウント時にCSRFトークンを取得
  useEffect(() => {
    const initializeCsrf = async () => {
      try {
        await apiClient.getCsrfToken();
        console.log('CSRF token初期化完了');
      } catch (error) {
        console.error('CSRF token初期化失敗:', error);
        setError('セキュリティトークンの取得に失敗しました');
      }
    };

    initializeCsrf();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // バリデーション
      if (formData.password !== formData.confirmPassword) {
        throw new Error('パスワードと確認用パスワードが一致しません');
      }

      if (formData.password.length < 6) {
        throw new Error('パスワードは6文字以上で入力してください');
      }

      // ユーザー登録API呼び出し
      const result = await apiClient.registerUser(formData);
      
      console.log('登録成功:', result);
      setSuccess(true);
      
      // フォームをリセット
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        locationType: 'office',
        clientLatitude: null,
        clientLongitude: null,
        departmentId: 1,
        positionId: 1,
        managerId: null
      });

    } catch (error) {
      console.error('登録エラー:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ユーザー登録</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ユーザー登録が完了しました！
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            ユーザー名（メールアドレス）
          </label>
          <input
            type="email"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            氏名
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            パスワード確認
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            minLength="6"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="locationType" className="block text-sm font-medium text-gray-700">
            勤務形態
          </label>
          <select
            id="locationType"
            name="locationType"
            value={formData.locationType}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="office">オフィス勤務</option>
            <option value="remote">リモート勤務</option>
            <option value="hybrid">ハイブリッド勤務</option>
          </select>
        </div>

        <div>
          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
            部署ID
          </label>
          <input
            type="number"
            id="departmentId"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleInputChange}
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="positionId" className="block text-sm font-medium text-gray-700">
            役職ID
          </label>
          <input
            type="number"
            id="positionId"
            name="positionId"
            value={formData.positionId}
            onChange={handleInputChange}
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? '登録中...' : 'ユーザー登録'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;