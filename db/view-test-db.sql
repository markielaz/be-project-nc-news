\c nc_news_test

-- SELECT * FROM comments;

-- SELECT articles.*, 
-- COUNT (comments.article_id) AS comment_count
-- FROM articles
-- LEFT JOIN comments ON comments.article_id = articles.article_id 
-- GROUP BY articles.article_id;

SELECT * FROM comments WHERE article_id = 1;
