const dotenv = require("dotenv");
dotenv.config();
// require("dotenv").config()
require("express-async-errors");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoose = require("mongoose");
// const { Customer, UserAuth } = require("./Routes");
const Customer = require("./Routes/customerRoute");
const UserAuth = require("./Routes/userAuthRoute");

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
  res.send("Node-Docker Article");
});
app.use("/api/v1/customer", Customer);
app.use("/api/v1/user", UserAuth);

const port = process.env.PORT || 3000;

// use when starting application locally
let mongoUrlLocal = "mongodb://sa:admin1@127.0.0.1:27017";

// use when starting application as docker container
const mongoUrlDocker = "mongodb://sa:admin1@mongodb";

// connect to mongo database using mongoose
const connectToDB = async () => {
  try {
    await mongoose.connect(mongoUrlDocker);
  } catch (err) {
    console.log(`error connecting db : ${err}`);
  }
};

app.listen(port, () => {
  connectToDB();
  console.log(`app listening on port ${port}...`);
});
