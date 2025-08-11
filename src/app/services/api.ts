// 从axios库导入axios
import axios from 'axios';
// CSRFサービスをインポート
import csrfService from './csrfService';

// CookieからCSRFトークンを直接取得する関数
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value || '');
    }
  }
  return null;
}

// 创建axios实例，配置基础URL和超时时间
// 通过axios.create()创建的实例继承了axios的所有方法，包括get、post、put、delete等
const api = axios.create({
  // 从环境变量获取API基础URL，如果没有则使用默认值
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8091/api',
  // 设置请求超时时间为10秒
  timeout: 10000,
  // 添加withCredentials以支持跨域请求时发送cookies
  withCredentials: true,
});

// 请求拦截器
// 在请求发送之前执行
api.interceptors.request.use(
  // 这个函数会在每个HTTP请求发送之前被调用
  // config参数是由axios自动提供的，包含了即将发送的请求的所有配置信息
  // 包括：url、method、headers、data、params等
  async (config) => {
    // 在发送请求之前做些什么
    // 从localStorage中获取token（仅在浏览器环境中）
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // 如果存在token，则添加到请求头中
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRFトークンの自動追加
    // CSRFトークン取得エンドポイント以外の場合にCSRFトークンを追加
    if (config.url && !config.url.includes('/csrf/token')) {
      try {
        // Cookieから直接CSRFトークンを取得（最優先）
        let csrfToken = getCsrfTokenFromCookie();
        
        // Cookieにない場合はサービスから取得
        if (!csrfToken) {
          csrfToken = await csrfService.getCsrfToken();
        }
        
        // Spring SecurityのデフォルトCSRFヘッダー名を使用
        if (csrfToken) {
          config.headers['X-XSRF-TOKEN'] = csrfToken;
          console.log('CSRFトークンをリクエストに追加:', csrfToken.substring(0, 10) + '...');
        } else {
          console.warn('CSRFトークンが利用できません');
        }
      } catch (error) {
        console.error('CSRFトークン取得エラー:', error);
        // CSRFトークン取得に失敗した場合、エラーをスローしてリクエストを中止
        throw error;
      }
    }

    // 确保Content-Type设置正确
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // 返回配置对象，这个对象将被用于实际的HTTP请求
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    // 返回被拒绝的Promise
    return Promise.reject(error);
  }
);

// 响应拦截器
// 在收到响应之后执行
api.interceptors.response.use(
  // 这个函数会在每个HTTP响应返回后被调用
  // response参数是由axios自动提供的，包含了服务器返回的响应信息
  // 包括：data、status、statusText、headers、config等
  (response) => {
    // 对响应数据做点什么
    // 直接返回响应
    return response;
  },
  async (error) => {
    // 对响应错误做点什么
    // error参数包含了错误信息，如响应状态码、错误消息等
    const originalRequest = error.config;

    // 如果是401未授权错误
    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储并跳转到登录页
      if (typeof window !== 'undefined') {
        // 在浏览器环境中，移除本地存储的token
        localStorage.removeItem('token');
        // CSRFトークンもクリア
        csrfService.clearToken();
        // 如果有路由可以使用，可以在这里添加跳转逻辑
        // router.push('/login');
      }
    }

    // 403エラーの場合、かつリトライ回数が上限に達していない場合にCSRFトークンを再取得してリクエストを再試行
    if (error.response?.status === 403 && !originalRequest._retry &&
        !(originalRequest.retryCount > 0)) { // 最大1回のリトライのみ許可
      console.log('403エラー検出、CSRFトークンを再取得します');
      console.log('元のリクエスト:', {
        url: originalRequest.url,
        method: originalRequest.method,
        headers: originalRequest.headers
      });

      originalRequest._retry = true;
      originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;

      try {
        // CSRFトークンを再取得
        const newCsrfToken = await csrfService.refreshCsrfToken();
        console.log('CSRFトークン再取得成功、リクエストを再実行します');
        console.log('新しいCSRFトークン:', newCsrfToken ? newCsrfToken.substring(0, 10) + '...' : 'null');

        // 新しいCSRFトークンをリクエストヘッダーに設定
        originalRequest.headers['X-XSRF-TOKEN'] = newCsrfToken;

        // リクエストを再実行
        return api(originalRequest);
      } catch (refreshError) {
        console.error('CSRFトークン再取得失敗:', refreshError);
        // リフレッシュに失敗した場合はエラーを返す
        return Promise.reject(refreshError);
      }
    }

    // 返回被拒绝的Promise
    return Promise.reject(error);
  }
);

// 导出配置好的axios实例
// 这个实例包含了axios的所有HTTP方法：
// - api.get(url, config)
// - api.post(url, data, config)
// - api.put(url, data, config)
// - api.delete(url, config)
// - api.patch(url, data, config)
// 等等...
export default api;