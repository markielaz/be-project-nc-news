const express = require("express");
const app = express();

const { getTopics, getUsers, getArticles, getArticleById, patchArticle } = require("./controllers/controller");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/users", getUsers);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticle)

app.use("*", (req, res) => {
    res.status(404).send({msg: "Invalid Path"});
});

module.exports = app;