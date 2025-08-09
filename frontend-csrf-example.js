// フロントエンドでCSRFトークンを使用する例

// 1. CSRFトークンを取得
const getCsrfToken = async () => {
  try {
    const response = await fetch('http://localhost:8091/api/csrf/token', {
      method: 'GET',
      credentials: 'include', // Cookieを含める
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    }
    throw new Error('CSRF token取得に失敗しました');
  } catch (error) {
    console.error('CSRF token取得エラー:', error);
    return null;
  }
};

// 2. 登録リクエストでCSRFトークンを使用
const registerUser = async (userData) => {
  try {
    // CSRFトークンを取得
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      throw new Error('CSRF token取得に失敗しました');
    }

    const response = await fetch('http://localhost:8091/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken, // CSRFトークンをヘッダーに追加
      },
      credentials: 'include', // Cookieを含める
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || '登録に失敗しました');
    }
  } catch (error) {
    console.error('登録エラー:', error);
    throw error;
  }
};

// 使用例
const handleRegister = async (formData) => {
  try {
    const result = await registerUser(formData);
    console.log('登録成功:', result);
  } catch (error) {
    console.error('登録失敗:', error.message);
  }
};