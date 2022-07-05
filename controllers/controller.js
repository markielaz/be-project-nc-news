const { selectTopics, selectArticleById, updateArticle } = require("../models/model");

exports.getTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

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