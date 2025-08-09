# Design Document

## Overview

このプロジェクトでは、Spring BootアプリケーションにCORS（Cross-Origin Resource Sharing）設定を追加して、フロントエンド（localhost:3000）からバックエンドAPI（localhost:8091）への認証リクエストを可能にします。

現在のSecurityConfigクラスにはCORS設定が含まれておらず、これがCORSポリシー違反の原因となっています。認証情報を含むリクエストに対してワイルドカード（`*`）を使用することはできないため、特定のオリジンを明示的に許可する必要があります。

## Architecture

### Current Architecture Issue
- フロントエンド（Next.js on localhost:3000）→ バックエンド（Spring Boot on localhost:8091）
- CORSヘッダーが設定されていないため、ブラウザがリクエストをブロック
- 特に認証情報を含むリクエスト（withCredentials: true）で問題が発生

### Solution Architecture
- Spring BootのCorsConfigurationSourceを使用してCORS設定を追加
- SecurityConfigクラスにCORS設定を統合
- 開発環境と本番環境で異なるオリジンを許可する設定

## Components and Interfaces

### 1. CorsConfig クラス（新規作成）
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 許可するオリジンの設定
        // 許可するHTTPメソッドの設定
        // 許可するヘッダーの設定
        // 認証情報の許可設定
        return source;
    }
}
```

### 2. SecurityConfig クラス（既存を修正）
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 既存の設定...
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // その他の設定...
        return http.build();
    }
}
```

### 3. Environment-based Configuration
- `application.yml`または`application.properties`でオリジンを設定
- 開発環境: `http://localhost:3000`
- 本番環境: 実際のフロントエンドドメイン

## Data Models

### CORS Configuration Parameters
```yaml
cors:
  allowed-origins:
    - http://localhost:3000
    - http://localhost:3001  # 追加の開発環境
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers:
    - "*"
  allow-credentials: true
  max-age: 3600
```

## Error Handling

### 1. CORS Preflight Handling
- OPTIONSリクエストに対する適切なレスポンス
- 必要なCORSヘッダーの設定

### 2. Invalid Origin Handling
- 許可されていないオリジンからのリクエストの拒否
- 適切なエラーレスポンスの返却

### 3. Credentials Handling
- `Access-Control-Allow-Credentials: true`の設定
- ワイルドカードの使用禁止（認証情報を含む場合）

## Testing Strategy

### 1. Unit Tests
- CorsConfigurationSourceの設定値テスト
- 許可されたオリジンの検証
- 認証情報設定の検証

### 2. Integration Tests
- 実際のHTTPリクエストでのCORSヘッダー検証
- プリフライトリクエストのテスト
- 認証付きリクエストのテスト

### 3. Manual Testing
- ブラウザでの実際のリクエスト確認
- Developer Toolsでのネットワークタブ確認
- 異なるオリジンからのリクエストテスト

### 4. Test Scenarios
```
Scenario 1: 許可されたオリジンからのGETリクエスト
- Origin: http://localhost:3000
- Expected: 200 OK with CORS headers

Scenario 2: 認証情報を含むPOSTリクエスト
- Origin: http://localhost:3000
- Credentials: include
- Expected: 200 OK with Access-Control-Allow-Credentials: true

Scenario 3: プリフライトリクエスト
- Method: OPTIONS
- Origin: http://localhost:3000
- Expected: 200 OK with appropriate preflight headers

Scenario 4: 許可されていないオリジンからのリクエスト
- Origin: http://malicious-site.com
- Expected: CORS error, request blocked
```

## Implementation Notes

### 1. Security Considerations
- 本番環境では特定のドメインのみを許可
- ワイルドカード（`*`）の使用を避ける（認証情報を含む場合）
- 必要最小限のHTTPメソッドのみを許可

### 2. Performance Considerations
- プリフライトリクエストのキャッシュ設定（max-age）
- 不要なCORSチェックの回避

### 3. Configuration Management
- 環境変数またはプロパティファイルでの設定管理
- 開発・ステージング・本番環境での設定分離