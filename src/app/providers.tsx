// 指定这是一个客户端组件，将在客户端执行
'use client';

// 从react导入useEffect钩子
import { useEffect } from 'react';
// 从react-redux导入Provider组件，用于提供Redux store给整个应用
import { Provider } from 'react-redux';
// 从本地store文件导入配置好的Redux store
import { store } from './store';
// CSRFサービスをインポート
import csrfService from './services/csrfService';

// CSRF初期化コンポーネント
function CsrfInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // アプリケーション起動時にCSRFトークンを初期化
    csrfService.initializeCsrfToken();
  }, []);

  return <>{children}</>;
}

// 定义Providers组件，接收children属性（React节点）
export function Providers({ children }: { children: React.ReactNode }) {
  // 使用Redux Provider包装children，并传入store
  // CSRFInitializerでCSRFトークンの初期化も行う
  return (
    <Provider store={store}>
      <CsrfInitializer>
        {children}
      </CsrfInitializer>
    </Provider>
  );
}