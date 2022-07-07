const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.selectArticles = () => {
  const query = `
    SELECT articles.*,
    COUNT (comments.article_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY created_at DESC;
  `
  return db.query(query).then((result) => {
    return result.rows
  })
}

exports.selectArticleById = (articleID) => {
  const commentQuery = `
    SELECT articles.*,
    COUNT (comments.article_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
  `;
  return db.query(commentQuery, [articleID]).then((article) => {
    return(article.rows[0]);
  })
};

exports.updateArticle = (articleID, inc_votes) => {
  const query = 'UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING * ;'
  return db.query(query, [articleID, inc_votes]).then(({rows}) => rows[0])
}

exports.selectUsers = () => {
  return db.query(
    `
    SELECT * FROM users;
    `
    ).then((result) => {
    return result.rows;
  })
}

exports.selectCommentsByArticleId = (articleID) => {
  const query = `
    SELECT * FROM comments WHERE article_id = $1;
  `
  return db.query(query, [articleID]).then((result) => {
    return result.rows
  })
}

exports.addCommentToArticle = (articleID, username, body) => {

  const query = `
  INSERT INTO comments (votes, author, body, article_id) VALUES (0, $1, $2, $3) RETURNING comment_id, votes, created_at, author, body;
  `;
  return db.query(query, [username, body, articleID])
  .then((result) => {
    return result.rows[0];
  })
}