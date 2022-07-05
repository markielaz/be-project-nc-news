const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

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