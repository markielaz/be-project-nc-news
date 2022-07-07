const { selectTopics, selectArticles, selectArticleById, updateArticle, selectUsers, selectCommentsByArticleId, addCommentToArticle, checkIfUserExists } = require("../models/model");

exports.getTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getArticles = (req, res) => {
  selectArticles().then((articles) => {
    res.status(200).send( {articles} );
  })
}

exports.getArticleById = (req, res) => {
  const { article_id } = req.params;
  selectArticleById(article_id).then((article) => {
    res.status(200).send({article});
  });
};

exports.patchArticle = (req, res) => {
  const {article_id} = req.params;
  const {inc_votes} = req.body;
  updateArticle(article_id, inc_votes)
  .then((article) => {
    res.status(200).send({article})
  })
}

exports.getUsers = (req, res) => {
  selectUsers().then((users) => {
    res.status(200).send({users});
  })
}

exports.getCommentsByArticleId = (req, res, next) => {
  const {article_id} = req.params;
  selectCommentsByArticleId(article_id)
  .then((comments) => res.status(200).send({comments}))
  .catch(next);
}

exports.postComment = (req, res, next) => {

    const { article_id } = req.params;
    const { username, body} = req.body;

    addCommentToArticle( article_id, username, body )
      .then((comment) => res.status(201).send({comment}))
      .catch((err) => {
        next(err);
      })
}