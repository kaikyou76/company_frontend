@RestController
@RequestMapping("/api/csrf")
@RequiredArgsConstructor
public class CsrfController {

    private static final Logger log = LoggerFactory.getLogger(CsrfController.class);

    private final CsrfTokenService csrfTokenService;

    /**
     * CSRFトークンを取得
     * 
     * @param request  HTTPリクエスト
     * @param response HTTPレスポンス
     * @return CSRFトークン情報
     */
    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> getCsrfToken(HttpServletRequest request,
            HttpServletResponse response) {
        try {
            // セッションIDの代わりにUUIDを使用
            // 未認証ユーザーでもCSRFトークンを取得可能にする
            String sessionId = generateSessionId(request);

            // CSRFトークンを生成
            String csrfToken = csrfTokenService.generateToken(sessionId);

            // レスポンスヘッダーにトークンを設定
            response.setHeader("X-CSRF-TOKEN", csrfToken);

            // Cookieにもトークンを設定（Double Submit Cookie パターン）
            Cookie csrfCookie = new Cookie("CSRF-TOKEN", csrfToken);
            csrfCookie.setHttpOnly(false); // JavaScriptからアクセス可能にする
            csrfCookie.setSecure(false); // 開発環境ではfalse、本番環境ではtrue
            csrfCookie.setPath("/");
            csrfCookie.setMaxAge(30 * 60); // 30分
            response.addCookie(csrfCookie);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("csrfToken", csrfToken);
            responseBody.put("expiresIn", 30 * 60); // 30分（秒）
            responseBody.put("message", "CSRF token generated successfully");

            log.debug("CSRF token generated for session: {}", sessionId);
            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            log.error("Failed to generate CSRF token", e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to generate CSRF token"));
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
                // ここではトークンの一部をハッシュ化してセッションIDとして使用
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
     * エラーレスポンスを作成
     * 
     * @param message エラーメッセージ
     * @return エラーレスポンス
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        return errorResponse;
    }
}