const express = require('express');
const app = express();

app.use(express.json());


app.get('/debug', (req, res) => {
    res.json({ message: "Debug route is working!" });
});

module.exports = app;