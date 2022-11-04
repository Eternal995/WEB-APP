/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Yongda Long
 *  Student ID: 172800211
 *  Date: Nov 3, 2022
 *
 *  Online (Cyclic) Link: https://scary-tuna-poncho.cyclic.app/
 *
 ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var path = require("path");
var multer = require("multer");
var fs = require("fs");
var exphbs = require("express-handlebars");

var dataService = require("./data-service.js");

var app = express();

// multer
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// handlebar
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: (url, options) => {
        return (
          "<li " +
          (url == app.locals.activeRoute ? 'class="active"' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: (lvalue, rvalue, options) => {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

// express
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

// on start
function onStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

dataService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onStart());
  })
  .catch((message) => {
    console.log(message);
  });

// home
app.get("/", (req, res) => {
  res.render(path.join(__dirname, "views/home.hbs"));
});

app.get("/home", (req, res) => {
  res.render(path.join(__dirname, "views/home.hbs"));
});

// about
app.get("/about", (req, res) => {
  res.render(path.join(__dirname, "views/about.hbs"));
});

// students
app.get("/students", (req, res) => {
  if (req.query.status) {
    dataService
      .getStudentsByStatus(req.query.status)
      .then((student) => {
        res.render("students", { students: student });
      })
      .catch((error) => {
        res.render("students", { message: "no results" });
      });
  } else if (req.query.program) {
    dataService
      .getStudentsByProgramCode(req.query.program)
      .then((student) => {
        res.render("students", { students: student });
      })
      .catch((error) => {
        res.render("students", { message: "no results" });
      });
  } else if (req.query.credential) {
    dataService
      .getStudentsByExpectedCredential(req.query.credential)
      .then((student) => {
        res.render("students", { students: student });
      })
      .catch((error) => {
        res.render("students", { message: "no results" });
      });
  } else {
    dataService
      .getAllStudents()
      .then((student) => {
        res.render("students", { students: student });
      })
      .catch((error) => {
        res.render("students", { message: "no results" });
      });
  }
});

app.get("/students/add", (req, res) => {
  res.render(path.join(__dirname, "/views/addStudent.hbs"));
});

app.post("/students/add", (req, res) => {
  dataService.addStudent(req.body).then(() => {
    res.redirect("/students");
  });
});

// student
app.get("/student/:value", (req, res) => {
  dataService
    .getStudentById(req.params.value)
    .then((data) => {
      res.render("student", { student: data });
    })
    .catch((error) => {
      res.render("student", { message: "no results" });
    });
});

app.post("/student/update", (req, res) => {
  dataService.updateStudent(req.body).then(() => {
    res.redirect("/students");
  });
});

// program
app.get("/programs", (req, res) => {
  dataService
    .getPrograms()
    .then((data) => {
      res.render("programs", { programs: data });
    })
    .catch((err) => {
      res.render("programs", { message: "no results" });
    });
});

// image
app.get("/images", (req, res) => {
  fs.readdir(
    path.join(__dirname, "/public/images/uploaded"),
    function (err, items) {
      res.render("images", { data: items });
    }
  );
});

app.get("/images/add", (req, res) => {
  res.render(path.join(__dirname, "/views/addImage.hbs"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

// 404
app.use((req, res, next) => {
  res.status(404).send("404 Page Not Found!");
});