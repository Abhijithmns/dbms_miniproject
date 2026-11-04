-- Evaluation component 7: joins, nested queries, and recursive comment queries.
USE dbms_miniproject;

-- INNER JOIN: post author and subgetit.
SELECT p.post_id, p.title, u.username AS author, s.name AS subgetit, p.created_at
FROM post p
JOIN app_user u ON u.user_id = p.user_id
JOIN subreddit s ON s.subreddit_id = p.subreddit_id
ORDER BY p.created_at DESC;

-- LEFT JOIN: include posts with zero comments.
SELECT p.post_id, p.title, COUNT(c.comment_id) AS comment_count
FROM post p
LEFT JOIN comment c ON c.post_id = p.post_id
GROUP BY p.post_id, p.title
ORDER BY comment_count DESC, p.post_id;

-- Nested query: users whose karma is above the average user karma.
SELECT user_id, username, karma
FROM app_user
WHERE karma > (SELECT AVG(karma) FROM app_user)
ORDER BY karma DESC;

-- Correlated subquery: highest-karma post in every subgetit.
SELECT p.post_id, p.title, p.karma, s.name AS subgetit
FROM post p
JOIN subreddit s ON s.subreddit_id = p.subreddit_id
WHERE p.karma = (
  SELECT MAX(p2.karma)
  FROM post p2
  WHERE p2.subreddit_id = p.subreddit_id
);

-- Recursive CTE: display nested comment threads with depth.
WITH RECURSIVE comment_tree AS (
  SELECT c.comment_id, c.post_id, c.parent_comment_id, c.body,
         c.user_id, 0 AS depth,
         CAST(c.comment_id AS CHAR(200)) AS path
  FROM comment c
  WHERE c.parent_comment_id IS NULL
  UNION ALL
  SELECT child.comment_id, child.post_id, child.parent_comment_id,
         child.body, child.user_id, parent.depth + 1,
         CONCAT(parent.path, '/', child.comment_id)
  FROM comment child
  JOIN comment_tree parent ON parent.comment_id = child.parent_comment_id
)
SELECT comment_id, post_id, parent_comment_id, depth, path, body
FROM comment_tree
ORDER BY post_id, path;
