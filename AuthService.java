// AuthServiceでのデータベースエラーハンドリング例

@Service
@Transactional
public class AuthService {

    // ... 他のメソッド

    public User registerUser(User user) {
        try {
            // ユーザー名の重複チェック
            if (userRepository.existsByUsername(user.getUsername())) {
                throw new RuntimeException("ユーザー名は既に使用されています");
            }

            // パスワードのハッシュ化
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

            // デフォルト値の設定
            if (user.getRole() == null) {
                user.setRole("USER");
            }
            if (user.getIsActive() == null) {
                user.setIsActive(true);
            }
            if (user.getSkipLocationCheck() == null) {
                user.setSkipLocationCheck(false);
            }

            // ユーザーを保存
            return userRepository.save(user);

        } catch (DataIntegrityViolationException e) {
            // データベース制約違反の処理
            if (e.getMessage().contains("users_pkey")) {
                throw new RuntimeException("システムエラーが発生しました。しばらく待ってから再試行してください。");
            } else if (e.getMessage().contains("username")) {
                throw new RuntimeException("ユーザー名は既に使用されています");
            } else {
                throw new RuntimeException("データベースエラーが発生しました: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("ユーザー登録中にエラーが発生しました", e);
            throw new RuntimeException("ユーザー登録中にエラーが発生しました");
        }
    }
}