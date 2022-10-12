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

module.exports.addStudent = (studentData) => {
  return new Promise((resolve, reject) => {
    studentData.isInternationalStudent === undefined
      ? (studentData.isInternationalStudent = false)
      : (studentData.isInternationalStudent = true);
    let maxID = 0;
    let current = 0;
    for (let i = 0; i < students.length; i++) {
      current = parseInt(students[i].studentID);
      if (current > maxID) maxID = current;
    }
    studentData.studentID = (++maxID).toString();
    students.push(studentData);
    if (studentData.studentID === undefined) reject("Something went wrong");
    resolve();
  });
};

module.exports.getStudentsByStatus = (status) => {
  return new Promise((resolve, reject) => {
    let result = students.filter((student) => student.status === status);
    result.length === 0 ? reject("No results returned.") : resolve(result);
  });
};

module.exports.getStudentsByProgramCode = (programCode) => {
  return new Promise((resolve, reject) => {
    let result = students.filter((student) => student.program === programCode);
    result.length === 0 ? reject("No results returned.") : resolve(result);
  });
};

module.exports.getStudentsByExpectedCredential = (credential) => {
  return new Promise((resolve, reject) => {
    let result = students.filter(
      (student) => student.expectedCredential === credential
    );
    result.length === 0 ? reject("No results returned.") : resolve(result);
  });
};

module.exports.getStudentById = (sid) => {
  return new Promise((resolve, reject) => {
    let result = students.find((student) => student.studentID === sid);
    result.length === 0 ? reject("No results returned.") : resolve(result);
  });
};
