var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var path = require("path");
var app = express();

var dataService = require("./data-service.js");

function onStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/students", (req, res) => {
  dataService
    .getAllStudents()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/intlstudents", (req, res) => {
  dataService
    .getInternationalStudents()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/programs", (req, res) => {
  dataService
    .getPrograms()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.use((req, res, next) => {
  res.status(404).send("404 Page Not Found!");
});

dataService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onStart());
  })
  .catch((message) => {
    console.log(message);
  });
