const express = require("express");
const app = express();

const { getTopics, getArticleById } = require("./controllers/controller");

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use("*", (req, res) => {
    res.status(404).send({msg: "Invalid Path"});
});

module.exports = app;