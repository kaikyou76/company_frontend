# Implementation Plan

## Backend Tasks

- [ ] 1. バックエンドCSRFController修正
  - CsrfController.javaのgetCsrfTokenメソッドからJWT認証要求を削除
  - セッションIDの代わりに一意識別子（UUID等）を使用
  - 未認証ユーザーでもCSRFトークンを取得可能にする
  - _Requirements: 1.1, 4.4_

## Frontend Tasks

- [ ] 2. CSRFサービス実装
  - [ ] 2.1 CSRFサービスの基本構造作成
    - src/app/services/csrfService.tsファイルを作成
    - CSRFトークン取得、管理、有効性チェック機能を実装
    - TypeScript型定義を追加
    - _Requirements: 1.1, 2.2_

  - [ ] 2.2 CSRFトークン管理機能実装
    - トークンのメモリ内保存機能
    - トークン有効期限管理（30分）
    - 自動リフレッシュ機能
    - _Requirements: 1.2, 2.2_

- [ ] 3. API Service拡張
  - [ ] 3.1 リクエストインターセプター拡張
    - api.tsのリクエストインターセプターにCSRFトークン自動追加機能を実装
    - X-CSRF-TOKENヘッダーの自動設定
    - CSRFトークンが存在しない場合の自動取得
    - _Requirements: 1.1, 4.3_

  - [ ] 3.2 レスポンスインターセプター拡張
    - 403エラー時のCSRF関連エラー判定機能
    - CSRF失敗時の自動リトライ機能（最大1回）
    - エラー分類とハンドリングの改善
    - _Requirements: 1.3, 2.1, 3.1_

- [ ] 4. 認証サービス統合
  - [ ] 4.1 authService.ts拡張
    - 登録・ログイン前のCSRFトークン確保機能
    - CSRF関連エラーハンドリングの改善
    - 日本語エラーメッセージの追加
    - _Requirements: 2.1, 2.2_

- [ ] 5. 型定義拡張
  - [ ] 5.1 CSRF関連型定義追加
    - src/app/types/auth.tsにCSRF関連インターフェース追加
    - CsrfTokenResponse、CsrfErrorResponse型の定義
    - エラーハンドリング用の型定義
    - _Requirements: 1.1, 2.1_

- [ ] 6. Redux Store統合
  - [ ] 6.1 CSRF状態管理追加
    - store.tsにCSRF関連状態を追加
    - CSRFトークン取得・更新のasyncThunk作成
    - CSRF関連エラー状態の管理
    - _Requirements: 1.2, 2.2_

- [ ] 7. ユーザーエクスペリエンス改善
  - [ ] 7.1 エラーメッセージ改善
    - CSRF関連エラーの日本語メッセージ追加
    - ユーザーフレンドリーなエラー表示
    - ローディング状態の適切な管理
    - _Requirements: 2.1, 2.2_

  - [ ] 7.2 自動リトライ機能
    - CSRFトークン期限切れ時の透明な再試行
    - ユーザーに対する適切なフィードバック
    - ネットワークエラー時の処理改善
    - _Requirements: 2.2, 1.3_

## Testing Tasks

- [ ] 8. 統合テスト
  - [ ] 8.1 登録フロー統合テスト
    - 正常な登録フローのテスト
    - CSRFトークン期限切れ時の処理テスト
    - ネットワークエラー時の処理テスト
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 8.2 エラーハンドリングテスト
    - 403 Forbiddenエラーの適切な処理確認
    - CSRF関連エラーメッセージの表示確認
    - 自動リトライ機能の動作確認
    - _Requirements: 2.1, 2.2, 3.1_

## Security Verification

- [ ] 9. セキュリティ検証
  - [ ] 9.1 CSRF保護機能確認
    - Double Submit Cookie パターンの実装確認
    - CSRFトークンの適切な検証確認
    - セキュリティヘッダーの設定確認
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 9.2 トークン管理セキュリティ確認
    - トークンの安全な保存確認
    - 適切な有効期限管理確認
    - ページリロード時の処理確認
    - _Requirements: 1.2, 2.2_