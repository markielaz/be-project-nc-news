const { selectTopics, selectArticles, selectArticleById, updateArticle, selectUsers, selectCommentsByArticleId, addCommentToArticle, checkIfUserExists } = require("../models/model");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  })
  .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  selectArticles( sort_by, order, topic).then((articles) => {
    res.status(200).send( {articles} );
  })
  .catch(next);
}

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id).then((article) => {
    res.status(200).send({article});
  })
  .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const {article_id} = req.params;
  const {inc_votes} = req.body;
  updateArticle(article_id, inc_votes)
  .then((article) => {
    res.status(200).send({article})
  })
  .catch(next);
}

exports.getUsers = (req, res, next) => {
  selectUsers().then((users) => {
    res.status(200).send({users});
  })
  .catch(next);
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