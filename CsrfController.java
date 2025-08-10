package com.example.companybackend.controller;

import com.example.companybackend.security.CsrfTokenService;
import com.example.companybackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * CSRF保護関連のエンドポイント（改善版）
 * 
 * 機能:
 * - CSRFトークンの配布
 * - トークンの更新
 * - セキュリティ状態の確認
 */
@RestController
@RequestMapping("/api/csrf")
@RequiredArgsConstructor
public class CsrfController {

    private static final Logger log = LoggerFactory.getLogger(CsrfController.class);
    private final CsrfTokenService csrfTokenService;
    private final JwtUtil jwtUtil;

    /**
     * CSRFトークンを取得
     * Spring SecurityのCSRF設定と連携
     * 
     * @param request  HTTPリクエスト
     * @param response HTTPレスポンス
     * @return CSRFトークン情報
     */
    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> getCsrfToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            // セッションIDを生成
            String sessionId = generateSessionId(request);

            // CSRFトークンを生成
            String csrfToken = csrfTokenService.generateToken(sessionId);

            // レスポンスヘッダーにトークンを設定
            response.setHeader("X-CSRF-TOKEN", csrfToken);
            response.setHeader("X-XSRF-TOKEN", csrfToken);

            // Spring SecurityのデフォルトCookie名でCookieを設定
            Cookie xsrfCookie = new Cookie("XSRF-TOKEN", csrfToken);
            xsrfCookie.setHttpOnly(false); // JavaScriptからアクセス可能
            xsrfCookie.setSecure(false); // 開発環境ではfalse、本番環境ではtrue
            xsrfCookie.setPath("/");
            xsrfCookie.setMaxAge(30 * 60); // 30分
            response.addCookie(xsrfCookie);

            // 互換性のため、カスタムCookie名でも設定
            Cookie csrfCookie = new Cookie("CSRF-TOKEN", csrfToken);
            csrfCookie.setHttpOnly(false);
            csrfCookie.setSecure(false);
            csrfCookie.setPath("/");
            csrfCookie.setMaxAge(30 * 60);
            response.addCookie(csrfCookie);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("csrfToken", csrfToken);
            responseBody.put("expiresIn", 30 * 60); // 30分（秒）
            responseBody.put("message", "CSRF token generated successfully");
            responseBody.put("cookieNames", new String[] { "XSRF-TOKEN", "CSRF-TOKEN" });
            responseBody.put("headerNames", new String[] { "X-XSRF-TOKEN", "X-CSRF-TOKEN" });

            log.info("CSRF token generated for session: {} (token: {}...)",
                    sessionId, csrfToken.substring(0, Math.min(10, csrfToken.length())));

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            log.error("Failed to generate CSRF token", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to generate CSRF token"));
        }
    }

    /**
     * CSRFトークンを更新
     * 
     * @param request  HTTPリクエスト
     * @param response HTTPレスポンス
     * @return 更新されたCSRFトークン情報
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshCsrfToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            // 既存のトークンを無効化
            String sessionId = generateSessionId(request);
            csrfTokenService.invalidateToken(sessionId);

            log.info("CSRF token refresh requested for session: {}", sessionId);

            // 新しいトークンを生成
            return getCsrfToken(request, response);

        } catch (Exception e) {
            log.error("Failed to refresh CSRF token", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to refresh CSRF token"));
        }
    }

    /**
     * CSRF保護の状態を確認
     * 
     * @param request HTTPリクエスト
     * @return CSRF保護の状態情報
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCsrfStatus(HttpServletRequest request) {
        try {
            String sessionId = generateSessionId(request);
            String currentToken = csrfTokenService.getTokenForSession(sessionId);
            boolean hasValidToken = currentToken != null;

            // リクエストヘッダーからCSRFトークンを確認
            String headerToken = extractCsrfTokenFromHeaders(request);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("csrfProtectionEnabled", true);
            responseBody.put("hasValidToken", hasValidToken);
            responseBody.put("sessionId", sessionId);
            responseBody.put("headerToken",
                    headerToken != null ? headerToken.substring(0, Math.min(10, headerToken.length())) + "..." : null);
            responseBody.put("serverToken",
                    currentToken != null ? currentToken.substring(0, Math.min(10, currentToken.length())) + "..."
                            : null);

            if (hasValidToken) {
                responseBody.put("message", "CSRF protection is active with valid token");
            } else {
                responseBody.put("message", "CSRF protection is active but no valid token found");
            }

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            log.error("Failed to get CSRF status", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get CSRF status"));
        }
    }

    /**
     * セッションIDを生成する
     * JWTトークンが存在する場合はそれを使用し、存在しない場合はUUIDを生成
     * 
     * @param request HTTPリクエスト
     * @return セッションID
     */
    private String generateSessionId(HttpServletRequest request) {
        // Authorizationヘッダーからトークンを取得を試行
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                // JWTトークンが存在する場合はそれを使用
                String token = authHeader.substring(7);
                // JWTからユーザーIDまたはセッション情報を抽出
                return "jwt_" + Integer.toHexString(token.hashCode());
            } catch (Exception e) {
                log.debug("Failed to extract session from JWT, using UUID instead", e);
            }
        }

        // JWTトークンが存在しない場合（未認証ユーザー）はUUIDを生成
        String sessionId = "guest_" + UUID.randomUUID().toString();
        log.debug("Generated new session ID for unauthenticated user: {}", sessionId);
        return sessionId;
    }

    /**
     * リクエストヘッダーからCSRFトークンを抽出
     */
    private String extractCsrfTokenFromHeaders(HttpServletRequest request) {
        // 複数のヘッダー名をチェック
        String[] headerNames = { "X-XSRF-TOKEN", "X-CSRF-TOKEN" };

        for (String headerName : headerNames) {
            String token = request.getHeader(headerName);
            if (token != null && !token.isEmpty()) {
                return token;
            }
        }

        return null;
    }

    /**
     * エラーレスポンスを作成
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", "CSRF_TOKEN_ERROR");
        errorResponse.put("message", message);
        return errorResponse;
    }
}