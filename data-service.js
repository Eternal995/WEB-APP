var fs = require("fs");

// global arrays
var students = [];
var programs = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/students.json", "utf8", (err, data) => {
      if (err) reject("Unable to read file.");

      students = JSON.parse(data);
    });

    fs.readFile("./data/programs.json", "utf8", (err, data) => {
      if (err) reject("Unable to read file.");

      programs = JSON.parse(data);
    });

    resolve();
  });
};

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    if (students.length == 0) {
      reject("No results returned");
    }
    resolve(students);
  });
};

module.exports.getInternationalStudents = function () {
  return new Promise((resolve, reject) => {
    var intlstudents = students.filter(
      (student) => student.isInternationalStudent
    );
    if (intlstudents.length == 0) {
      reject("No results returned");
    }
    resolve(intlstudents);
  });
};

module.exports.getPrograms = function () {
  return new Promise((resolve, reject) => {
    if (programs.length == 0) {
      reject("No results returned");
    }
    resolve(programs);
  });
};
