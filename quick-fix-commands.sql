-- 開発環境での即座の修正コマンド

-- 方法1: シーケンスをリセット（推奨）
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);

-- 方法2: 問題のあるレコードを削除（注意：データが失われます）
-- DELETE FROM users WHERE id = 96;

-- 方法3: テーブルを完全にリセット（注意：全データが失われます）
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- 確認用クエリ
SELECT 
    MAX(id) as max_id,
    (SELECT last_value FROM users_id_seq) as sequence_value,
    (SELECT is_called FROM users_id_seq) as is_called
FROM users;