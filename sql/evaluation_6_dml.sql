-- Evaluation component 6: DML operations.
-- Run against dbms_miniproject after importing the schema.
USE dbms_miniproject;

START TRANSACTION;

INSERT INTO app_user (username, email_hash, password_hash, profile_image)
VALUES ('sql_demo_user', SHA2('sql-demo@example.local', 256), SHA2('demo-password', 256), '🦊')
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO subreddit (name, description)
VALUES ('sql-lab', 'Queries and database learning')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO post (title, body, flair, user_id, subreddit_id)
SELECT 'A DML demonstration post', 'This row demonstrates INSERT, UPDATE, and DELETE safely.', 'sql', u.user_id, s.subreddit_id
FROM app_user u CROSS JOIN subreddit s
WHERE u.username = 'sql_demo_user' AND s.name = 'sql-lab'
  AND NOT EXISTS (SELECT 1 FROM post WHERE title = 'A DML demonstration post');

UPDATE post
SET flair = 'sql-demo'
WHERE title = 'A DML demonstration post';

INSERT INTO comment (post_id, user_id, body)
SELECT p.post_id, u.user_id, 'This comment was inserted by the DML evaluation script.'
FROM post p CROSS JOIN app_user u
WHERE p.title = 'A DML demonstration post' AND u.username = 'sql_demo_user'
  AND NOT EXISTS (SELECT 1 FROM comment WHERE body = 'This comment was inserted by the DML evaluation script.');

COMMIT;

-- SELECT verification
SELECT p.post_id, p.title, p.flair, u.username, s.name AS subgetit
FROM post p
JOIN app_user u ON u.user_id = p.user_id
JOIN subreddit s ON s.subreddit_id = p.subreddit_id
WHERE p.title = 'A DML demonstration post';

-- DELETE demonstration: remove only the row created by this script.
DELETE FROM post WHERE title = 'A DML demonstration post';
