const dotenv = require("dotenv");
dotenv.config();
require("express-async-errors");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");

// middlewares
app.set("trust proxy", 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(morgan("tiny")); //only use this in developement
app.use(express.json());
app.use(cors());
app.use(mongoSanitize());
app.use(limiter);
app.use(helmet());
app.use(xss());

// route middleware
app.get("/", (req, res) => {
  res.send("Node-DOcker Article");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`app listening on port ${port}...`);
});
