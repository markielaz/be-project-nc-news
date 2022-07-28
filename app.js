const express = require("express");
const app = express();
const cors = require('cors');

const { getTopics, getUsers, getArticles, getArticleById, getCommentsByArticleId, postComment, patchArticle, deleteComment, patchComment } = require("./controllers/controller");

app.use(cors());

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/users", getUsers);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', postComment)

app.patch("/api/comments/:comment_id", patchComment);

app.patch("/api/articles/:article_id", patchArticle)

app.delete('/api/comments/:comment_id', deleteComment);

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
    if (err.code === '23503') {
      res.status(404).send({ msg: 'Resource not found' });
    } else next(err);
});
  
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
});


module.exports = app;