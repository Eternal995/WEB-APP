/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Yongda Long
 *  Student ID: 172800211
 *  Date: Dec 01, 2022
 *
 *  Online (Cyclic) Link: https://yongdalong.cyclic.app/
 *
 ********************************************************************************/

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");

const dataService = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");

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
  .then(dataServiceAuth.initialize())
  .then(() => {
    app.listen(HTTP_PORT, onStart());
  })
  .catch((message) => {
    console.log("Unable to start server: " + message);
  });

// client-sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "WEB322Assignment6YongdaLong",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  console.log(req.body);
  dataServiceAuth
    .registerUser(req.body)
    .then(() => res.render("register", { successMessage: "User created" }))
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  console.log(req.body);
  dataServiceAuth
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/students");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { user: req.session.user });
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
app.get("/students", ensureLogin, (req, res) => {
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

app.get("/students/add", ensureLogin, (req, res) => {
  dataService
    .getPrograms()
    .then((data) => {
      res.render("addStudent", { programs: data });
    })
    .catch((err) => res.render("addStudent", { programs: [] }));
});

app.post("/students/add", ensureLogin, (req, res) => {
  dataService
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => res.status(500).send("Unable to Add Student"));
});

app.get("/students/delete/:studentID", ensureLogin, (req, res) => {
  dataService
    .deleteStudentById(req.params.studentID)
    .then(res.redirect("/students"))
    .catch(
      res.status(500).send("Unable to Remove Student / Student not found.")
    );
});

// student
app.get("/student/:studentId", ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};

  dataService
    .getStudentById(req.params.studentId)
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(dataService.getPrograms)
    .then((data) => {
      viewData.programs = data; // store program data in the "viewData" object as "programs"

      // loop through viewData.programs and once we have found the programCode that matches
      // the student's "program" value, add a "selected" property to the matching
      // viewData.programs object

      for (let i = 0; i < viewData.programs.length; i++) {
        if (viewData.programs[i].programCode == viewData.student.program) {
          viewData.programs[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.programs = []; // set programs to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData.student[0] }); // render the "student" view
      }
    })
    .catch((err) => {
      res.status(500).send("Unable to Show Students");
    });
});

app.post("/student/update", ensureLogin, (req, res) => {
  dataService.updateStudent(req.body).then(() => {
    res.redirect("/students");
  });
});

// programs
app.get("/programs", ensureLogin, (req, res) => {
  dataService
    .getPrograms()
    .then((data) => {
      res.render("programs", { programs: data });
    })
    .catch((err) => {
      res.render("programs", { message: "no results" });
    });
});

app.get("/programs/add", ensureLogin, (req, res) => {
  res.render(path.join(__dirname, "/views/addProgram.hbs"));
});

app.post("/programs/add", ensureLogin, (req, res) => {
  dataService
    .addProgram(req.body)
    .then(() => {
      res.redirect("/programs");
    })
    .catch((err) => {
      res.status(500).send("Unable to Add Program");
    });
});

app.get("/programs/delete/:value", ensureLogin, (req, res) => {
  dataService
    .deleteProgramByCode(req.params.value)
    .then((data) => {
      res.redirect("/programs");
    })
    .catch((error) => {
      res.status(500).send("Unable to Remove Program / Program not found");
    });
});

// program
app.get("/program/:programCode", ensureLogin, (req, res) => {
  dataService
    .getProgramByCode(req.params.programCode)
    .then((data) => {
      res.render("program", { program: data });
    })
    .catch((error) => {
      res.status(404).send("Program Not Found");
    });
});

app.post("/program/update", ensureLogin, (req, res) => {
  dataService.updateProgram(req.body).then(() => {
    res.redirect("/programs");
  });
});

// image
app.get("/images", ensureLogin, (req, res) => {
  fs.readdir(
    path.join(__dirname, "/public/images/uploaded"),
    function (err, items) {
      res.render("images", { data: items });
    }
  );
});

app.get("/images/add", ensureLogin, (req, res) => {
  res.render(path.join(__dirname, "/views/addImage.hbs"));
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

// 404
app.use((req, res, next) => {
  res.status(404).send("404 Page Not Found!");
});