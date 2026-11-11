-- Evaluation component 8: procedure, function, trigger, and CTE examples.
USE dbms_miniproject;

DROP FUNCTION IF EXISTS post_comment_count;
DELIMITER //
CREATE FUNCTION post_comment_count(input_post_id BIGINT)
RETURNS INT
READS SQL DATA
BEGIN
  DECLARE total_comments INT DEFAULT 0;
  SELECT COUNT(*) INTO total_comments FROM comment WHERE post_id = input_post_id;
  RETURN total_comments;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS post_summary;
DELIMITER //
CREATE PROCEDURE post_summary(IN input_post_id BIGINT)
BEGIN
  SELECT p.post_id, p.title, p.karma,
         u.username AS author, s.name AS subgetit,
         post_comment_count(p.post_id) AS comment_count
  FROM post p
  JOIN app_user u ON u.user_id = p.user_id
  JOIN subreddit s ON s.subreddit_id = p.subreddit_id
  WHERE p.post_id = input_post_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS comment_after_insert_recalculate_user_karma;
DELIMITER //
CREATE TRIGGER comment_after_insert_recalculate_user_karma
AFTER INSERT ON comment
FOR EACH ROW
BEGIN
  UPDATE app_user
  SET karma = COALESCE((SELECT SUM(karma) FROM post WHERE user_id = NEW.user_id), 0)
            + COALESCE((SELECT SUM(karma) FROM comment WHERE user_id = NEW.user_id), 0)
  WHERE user_id = NEW.user_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS comment_after_update_recalculate_user_karma;
DELIMITER //
CREATE TRIGGER comment_after_update_recalculate_user_karma
AFTER UPDATE ON comment
FOR EACH ROW
BEGIN
  UPDATE app_user
  SET karma = COALESCE((SELECT SUM(karma) FROM post WHERE user_id = NEW.user_id), 0)
            + COALESCE((SELECT SUM(karma) FROM comment WHERE user_id = NEW.user_id), 0)
  WHERE user_id = NEW.user_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS post_after_update_recalculate_user_karma;
DELIMITER //
CREATE TRIGGER post_after_update_recalculate_user_karma
AFTER UPDATE ON post
FOR EACH ROW
BEGIN
  UPDATE app_user
  SET karma = COALESCE((SELECT SUM(karma) FROM post WHERE user_id = NEW.user_id), 0)
            + COALESCE((SELECT SUM(karma) FROM comment WHERE user_id = NEW.user_id), 0)
  WHERE user_id = NEW.user_id;
END//
DELIMITER ;

-- CTE report: rank posts within each subgetit.
WITH ranked_posts AS (
  SELECT p.post_id, p.title, p.karma, s.name AS subgetit,
         ROW_NUMBER() OVER (PARTITION BY p.subreddit_id ORDER BY p.karma DESC, p.created_at DESC) AS rank_in_subgetit
  FROM post p
  JOIN subreddit s ON s.subreddit_id = p.subreddit_id
)
SELECT * FROM ranked_posts WHERE rank_in_subgetit <= 3 ORDER BY subgetit, rank_in_subgetit;

-- Example calls:
-- SELECT post_comment_count(1);
-- CALL post_summary(1);
