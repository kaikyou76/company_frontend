-- PostgreSQLのシーケンスを修正するSQLスクリプト

-- 1. 現在のusersテーブルの最大IDを確認
SELECT MAX(id) FROM users;

-- 2. シーケンスの現在値を確認
SELECT currval('users_id_seq');

-- 3. シーケンスを最大ID+1にリセット
-- 注意: MAX(id)の結果に基づいて数値を調整してください
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);

-- 4. シーケンスの値を確認
SELECT currval('users_id_seq');

-- 5. テスト用の挿入（オプション）
-- INSERT INTO users (username, password_hash, full_name, location_type, department_id, position_id) 
-- VALUES ('test@example.com', 'test', 'Test User', 'office', 1, 1);