-- Safe Docker/demo seed. It is idempotent and uses only clearly named demo rows.
USE dbms_miniproject;

INSERT IGNORE INTO app_user (username, email_hash, password_hash, profile_image)
VALUES
  ('getit_demo', SHA2('getit-demo@example.local', 256), SHA2('demo-password', 256), '🦊'),
  ('getit_helper', SHA2('getit-helper@example.local', 256), SHA2('demo-password', 256), '🐼');

INSERT IGNORE INTO subreddit (name, description)
VALUES
  ('dbms', 'Database systems, SQL, and backend engineering'),
  ('campus-life', 'Questions and conversations about campus life'),
  ('programming-help', 'Ask for help with programming projects');

INSERT INTO post (title, body, flair, user_id, subreddit_id)
SELECT 'What is the best way to learn SQL without memorising everything?', 'Start with the question in plain language, then add one join at a time.', 'discussion', u.user_id, s.subreddit_id
FROM app_user u JOIN subreddit s ON s.name = 'dbms'
WHERE u.username = 'getit_demo' AND NOT EXISTS (SELECT 1 FROM post WHERE title = 'What is the best way to learn SQL without memorising everything?');

INSERT INTO post (title, body, flair, user_id, subreddit_id)
SELECT 'The quietest place to study on campus?', 'Looking for somewhere with sockets, good light, and no loud group calls.', 'campus', u.user_id, s.subreddit_id
FROM app_user u JOIN subreddit s ON s.name = 'campus-life'
WHERE u.username = 'getit_helper' AND NOT EXISTS (SELECT 1 FROM post WHERE title = 'The quietest place to study on campus?');

INSERT INTO comment (post_id, user_id, body)
SELECT p.post_id, u.user_id, 'The library is usually quietest before the afternoon rush.'
FROM post p JOIN app_user u ON u.username = 'getit_helper'
WHERE p.title = 'What is the best way to learn SQL without memorising everything?'
  AND NOT EXISTS (SELECT 1 FROM comment WHERE body = 'The library is usually quietest before the afternoon rush.');

INSERT IGNORE INTO award (name, description, icon_url, cost)
VALUES ('Helpful answer', 'For answers that make a difficult topic clearer.', '💡', 10);

INSERT IGNORE INTO votes_on (user_id, post_id, vote_type)
SELECT u.user_id, p.post_id, 'upvote'
FROM app_user u JOIN post p ON p.title = 'What is the best way to learn SQL without memorising everything?'
WHERE u.username = 'getit_helper';

INSERT INTO private_message (content, sender_id, receiver_id)
SELECT 'Welcome to getit.', sender.user_id, receiver.user_id
FROM app_user sender CROSS JOIN app_user receiver
WHERE sender.username = 'getit_helper' AND receiver.username = 'getit_demo'
  AND NOT EXISTS (SELECT 1 FROM private_message WHERE content = 'Welcome to getit.' AND sender_id = sender.user_id AND receiver_id = receiver.user_id);
