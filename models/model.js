const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.selectArticleById = (articleID) => {
  return db.query('SELECT * FROM articles WHERE article_id = $1', [articleID]).then((article) => {
    console.log(article.rows[0])  
    return article.rows[0];
  })
};