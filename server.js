const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const dotenv = require('dotenv');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome!" });
});

const users = require("./app/routes/user.routes")(app);
const ipfs = require("./app/routes/ipfs.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});  