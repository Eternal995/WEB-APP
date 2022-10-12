/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Yongda Long
 *  Student ID: 172800211
 *  Date: Oct 12, 2022
 *
 *  Online (Cyclic) Link: https://fierce-colt-outfit.cyclic.app/
 *
 ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var path = require("path");
var app = express();
var multer = require("multer");
var fs = require("fs");

var dataService = require("./data-service.js");

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

function onStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/students", (req, res) => {
  if (req.query.status) {
    dataService
      .getStudentsByStatus(req.query.status)
      .then((student) => {
        res.json({ student });
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else if (req.query.program) {
    dataService
      .getStudentsByProgramCode(req.query.program)
      .then((student) => {
        res.json({ student });
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else if (req.query.credential) {
    dataService
      .getStudentsByExpectedCredential(req.query.credential)
      .then((student) => {
        res.json({ student });
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else {
    dataService
      .getAllStudents()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  }
});

app.get("/student/:value", (req, res) => {
  dataService
    .getStudentById(req.params.value)
    .then((student) => {
      res.json({ student });
    })
    .catch((error) => {
      res.json({ message: error });
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

app.get("/students/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addStudent.html"));
});

app.get("/images/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.get("/images", (req, res) => {
  fs.readdir(
    path.join(__dirname, "/public/images/uploaded"),
    function (err, items) {
      res.json(items);
    }
  );
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.post("/students/add", (req, res) => {
  dataService.addStudent(req.body).then(() => {
    res.redirect("/students");
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
