'use client';

import { useState, useEffect } from 'react';
import csrfService from '@/app/services/csrfService';
import api from '@/app/services/api';

const CsrfTestPage = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [csrfStatus, setCsrfStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初期化時にCSRFトークンを取得
    loadCsrfToken();
  }, []);

  const loadCsrfToken = async () => {
    try {
      const token = await csrfService.getCsrfToken();
      setCsrfToken(token);
      console.log('CSRFトークン取得:', token);
    } catch (error) {
      console.error('CSRFトークン取得エラー:', error);
      setTestResult(`CSRFトークン取得エラー: ${error}`);
    }
  };

  const checkCsrfStatus = async () => {
    try {
      const response = await api.get('/csrf/status');
      setCsrfStatus(response.data);
      setTestResult('CSRF状態確認成功');
    } catch (error: any) {
      console.error('CSRF状態確認エラー:', error);
      setTestResult(`CSRF状態確認エラー: ${error.response?.data?.message || error.message}`);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const testData = {
        username: `test${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
        fullName: 'テストユーザー',
        locationType: 'office',
        departmentId: 1,
        positionId: 1
      };

      console.log('登録テスト開始:', testData);
      
      const response = await api.post('/auth/register', testData);
      setTestResult(`登録テスト成功: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('登録テストエラー:', error);
      
      let errorDetails = '';
      if (error.response) {
        errorDetails = `
ステータス: ${error.response.status}
ヘッダー: ${JSON.stringify(error.response.headers, null, 2)}
データ: ${JSON.stringify(error.response.data, null, 2)}
        `;
      } else if (error.request) {
        errorDetails = `リクエストエラー: ${error.request}`;
      } else {
        errorDetails = `エラー: ${error.message}`;
      }
      
      setTestResult(`登録テストエラー:\n${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshCsrfToken = async () => {
    try {
      csrfService.clearToken();
      const newToken = await csrfService.refreshCsrfToken();
      setCsrfToken(newToken);
      setTestResult('CSRFトークン更新成功');
    } catch (error) {
      console.error('CSRFトークン更新エラー:', error);
      setTestResult(`CSRFトークン更新エラー: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">CSRF保護テストページ</h1>
      
      {/* CSRFトークン表示 */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">現在のCSRFトークン</h2>
        <p className="font-mono text-sm break-all">
          {csrfToken || 'トークンが取得されていません'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          有効期限: {csrfService.getTokenExpiration()?.toLocaleString() || '不明'}
        </p>
        <p className="text-sm text-gray-600">
          有効性: {csrfService.isTokenValid() ? '有効' : '無効'}
        </p>
      </div>

      {/* CSRF状態表示 */}
      {csrfStatus && (
        <div className="mb-6 p-4 bg-blue-100 rounded">
          <h2 className="text-lg font-semibold mb-2">CSRF状態</h2>
          <pre className="text-sm">{JSON.stringify(csrfStatus, null, 2)}</pre>
        </div>
      )}

      {/* テスト結果表示 */}
      {testResult && (
        <div className="mb-6 p-4 bg-yellow-100 rounded">
          <h2 className="text-lg font-semibold mb-2">テスト結果</h2>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      {/* ボタン群 */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadCsrfToken}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            CSRFトークン取得
          </button>
          
          <button
            onClick={refreshCsrfToken}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            CSRFトークン更新
          </button>
          
          <button
            onClick={checkCsrfStatus}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            CSRF状態確認
          </button>
        </div>

        <div>
          <button
            onClick={testRegistration}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '登録テスト中...' : '登録テスト実行'}
          </button>
        </div>
      </div>

      {/* 使用方法の説明 */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h2 className="text-lg font-semibold mb-2">使用方法</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>「CSRFトークン取得」でトークンを取得します</li>
          <li>「CSRF状態確認」でサーバー側の状態を確認します</li>
          <li>「登録テスト実行」で実際の登録APIをテストします</li>
          <li>「CSRFトークン更新」でトークンを強制更新します</li>
        </ol>
      </div>
    </div>
  );
};

export default CsrfTestPage;