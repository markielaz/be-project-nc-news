const express = require("express");
const app = express();

const { getTopics, getUsers, getArticles, getArticleById, getCommentsByArticleId, patchArticle } = require("./controllers/controller");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/users", getUsers);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.patch("/api/articles/:article_id", patchArticle)

app.use("*", (req, res) => {
    res.status(404).send({msg: "Invalid Path"});
});

app.use((err, req, res, next) => {
    if (err.status) {
      res.status(err.status).send({ msg: err.msg });
    } else next(err);
  });
  
  app.use((err, req, res, next) => {
    if (err.code === '22P02') {
      res.status(400).send({ msg: 'Invalid input' });
    } else next(err);
  });

  app.use((err, req, res, next) => {
    if (err.code === '22003') {
      res.status(404).send({ msg: 'Resource not found' });
    } else next(err);
  });
  
  app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' });
  });


module.exports = app;