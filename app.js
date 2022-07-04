const express = require("express");
const app = express();

const { getTopics } = require("./controllers/controller");

app.get("/api/topics", getTopics);

app.use("*", (req, res) => {
    res.status(404).send({msg: "Invalid Path"});
});

module.exports = app;