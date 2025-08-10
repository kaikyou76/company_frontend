package com.example.companybackend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * CSRF保護関連のエンドポイント（Spring Security統合版）
 * 
 * 機能:
 * - Spring SecurityのCSRFトークンの配布
 * - セキュリティ状態の確認
 */
@RestController
@RequestMapping("/api/csrf")
public class CsrfController {

    private static final Logger log = LoggerFactory.getLogger(CsrfController.class);

    /**
     * Spring SecurityのCSRFトークンを取得
     * 
     * @param request HTTPリクエスト
     * @return CSRFトークン情報
     */
    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> getCsrfToken(HttpServletRequest request) {
        try {
            // Spring SecurityのCSRFトークンを取得
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

            if (csrfToken == null) {
                log.error("CSRF token not found in request attributes");
                return ResponseEntity.status(500).body(createErrorResponse("CSRF token not available"));
            }

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("csrfToken", csrfToken.getToken());
            responseBody.put("headerName", csrfToken.getHeaderName());
            responseBody.put("parameterName", csrfToken.getParameterName());
            responseBody.put("expiresIn", 30 * 60); // 30分（秒）
            responseBody.put("message", "CSRF token generated successfully");

            log.info("CSRF token provided: {}... (header: {}, parameter: {})",
                    csrfToken.getToken().substring(0, Math.min(10, csrfToken.getToken().length())),
                    csrfToken.getHeaderName(),
                    csrfToken.getParameterName());

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            log.error("Failed to get CSRF token", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to get CSRF token"));
        }
    }

    /**
     * CSRFトークンを更新（新しいトークンを取得）
     * 
     * @param request HTTPリクエスト
     * @return 更新されたCSRFトークン情報
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshCsrfToken(HttpServletRequest request) {
        try {
            log.info("CSRF token refresh requested");

            // 新しいトークンを取得（Spring Securityが自動的に新しいトークンを生成）
            return getCsrfToken(request);

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
            // Spring SecurityのCSRFトークンを取得
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            boolean hasValidToken = csrfToken != null;

            // リクエストヘッダーからCSRFトークンを確認
            String headerToken = extractCsrfTokenFromHeaders(request);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("csrfProtectionEnabled", true);
            responseBody.put("hasValidToken", hasValidToken);

            if (hasValidToken) {
                responseBody.put("headerName", csrfToken.getHeaderName());
                responseBody.put("parameterName", csrfToken.getParameterName());
                responseBody.put("serverToken",
                        csrfToken.getToken().substring(0, Math.min(10, csrfToken.getToken().length())) + "...");
            }

            responseBody.put("headerToken",
                    headerToken != null ? headerToken.substring(0, Math.min(10, headerToken.length())) + "..." : null);

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