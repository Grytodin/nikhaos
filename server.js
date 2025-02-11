const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Dashboard is running!");
});

app.listen(PORT, () => {
    console.log(`Dashboard running on port ${PORT}`);
});