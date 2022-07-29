const { query } = require("../db/connection");
const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.selectArticles = (sortBy = 'created_at', order = 'DESC', topic) => {

  const validSortOptions = ['title', 'topic', 'author', 'body', 'created_at', 'votes', 'comment_count'];

  const validOrderOptions = ['ASC', 'DESC', 'asc', 'desc'];

  if(!validSortOptions.includes(sortBy)) {
    return Promise.reject({ status: 400, msg: 'Invalid sort_by query'});
  }

  if(!validOrderOptions.includes(order)) {
    return Promise.reject({ status: 400, msg: 'Invalid order query'});
  } 

  const validTopics = [];

  return db.query('SELECT * FROM topics').then((result) => {
    const topicsArray = result.rows;
    topicsArray.forEach((obj) => {
      validTopics.push(obj.slug);
    })
  }).then(() => {
    const queryValues = [];

  let queryStr = `
    SELECT articles.*,
    COUNT (comments.article_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
  `;

  if (topic) {
    queryValues.push(topic);
    queryStr += `WHERE topic = $1`;
  }

   queryStr += `
    GROUP BY articles.article_id
    ORDER BY ${sortBy} ${order};
  `

  return db.query(queryStr, queryValues)
  })

  .then((result) => {
    if(!result.rows.length && !validTopics.includes(topic)) {
      return Promise.reject({ status: 404, msg: 'Topic not found'});
    }else return result.rows
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

exports.updateComment = (commentID, inc_votes) => {
  const query = 'UPDATE comments SET votes = votes + $2 WHERE comment_id = $1 RETURNING * ;'
  return db.query(query, [commentID, inc_votes]).then(({rows}) => rows[0])
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

exports.checkIfArticleExists = (articleID) => {

  let queryStr = `SELECT * FROM articles WHERE article_id = $1`;
  return db.query(queryStr, [articleID])
  .then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return false;
    }
    return true;
  })
}

exports.selectCommentsByArticleId = (articleID) => {

  return this.checkIfArticleExists(articleID).then((boolean)=> {
    if(boolean === false) {
      return Promise.reject({ status: 404, msg: 'Resource not found'});
    };
    const query = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`
  return db.query(query, [articleID])
  .then((result) => {
    return result.rows;
  })
  })
  
}

exports.checkIfUserExists = (username) => {

  let queryStr = `
  SELECT * FROM users WHERE username = $1
  `;

  return db.query(queryStr, [username])
  .then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return false;
    }
    return true;
  })
}

exports.addCommentToArticle = (articleID, username, body) => {

  if(!body || !articleID || !username || typeof username !== 'string' || typeof body !== 'string') {
    return Promise.reject({ status: 400, msg: 'Invalid input'});
  }
  
  return this.checkIfUserExists(username).then((boolean)=> {
    if(boolean === false) {
      return Promise.reject({ status: 404, msg: 'Username not found'});
    };
    const query = `
    INSERT INTO comments (votes, author, body, article_id) VALUES (0, $1, $2, $3) RETURNING comment_id, votes, created_at, author, body;
    `;
    return db.query(query, [username, body, articleID])
  })
  .then((result) => {
    return result.rows[0];
  })

}

exports.removeComment = (commentID) => {
  const query = 'DELETE FROM comments WHERE comment_id = $1;';
  return db.query(query, [commentID]);
}