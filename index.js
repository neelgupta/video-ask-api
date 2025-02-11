const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const errorMiddleware = require("./middleware/Error");
const connectDatabase = require("./config/connect");
const router = require("./routes");
require("./models");

const app = express();

app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      req.rawBody = buf;
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(helmet());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).json({ status: 200, message: "working finely" });
});

app.use("/api/v1", router);

const swaggerFilePath = path.join(__dirname, "swagger_output.json");
if (fs.existsSync(swaggerFilePath)) {
  const swaggerFile = require(swaggerFilePath);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

app.use((req, res, next) => {
  return res
    .status(404)
    .json({ status: 404, message: "Page not found on the server" });
});

app.use(errorMiddleware);

connectDatabase();

const server = app.listen(port, () => {
  try {
    console.log(`Server is listing on Port ${port}`);
  } catch (error) {
    // console.log("app.listen ~ error:", error)
    console.log(`Something is wrong`);
  }
});

process.on("unhandledRejection", (err) => {
  console.log(`Error:${err.message}`);
  console.log(`Shutting down due to unhandled promise rejection ========>`);
});
