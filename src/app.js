const express = require("express");
const cors = require("cors");
const http = require('http');
const connectDB = require("./config/database");
const { errorConverter, errorHandler } = require("./middleware/error");

require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));

connectDB();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("./routes"));
app.use(errorConverter);
const server = http.createServer(app);
app.use(errorHandler);


module.exports = server;
