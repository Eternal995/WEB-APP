const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "cztwtzxe",
  "cztwtzxe",
  "hAwBcBVyz0WtVojh5ayjrPWXPvRTgeuA",
  {
    host: "peanut.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
      query: { raw: true },
    },
  }
);

var Student = sequelize.define("student", {
  studentID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  isInternationalStudent: Sequelize.BOOLEAN,
  expectedCredential: Sequelize.STRING,
  status: Sequelize.STRING,
  registrationDate: Sequelize.STRING,
});

var Program = sequelize.define("program", {
  programCode: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  programName: Sequelize.STRING,
});

Program.hasMany(Student, { foreignKey: "program" });

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(resolve("Database Synced."))
      .catch(reject("Unable to sync the database."));
  });
};

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    Sequelize.sync()
      .then(() => {
        resolve(Student.findAll());
      })
      .catch((err) => {
        reject("No results returned.");
      });
  });
};

module.exports.getStudentsByStatus = (status) => {
  return new Promise((resolve, reject) => {
    Sequelize.sync()
      .then(
        resolve(
          Student.findAll({
            where: {
              status: status,
            },
          })
        )
      )
      .catch(reject("No results returned."));
  });
};

module.exports.getStudentsByProgramCode = (program) => {
  return new Promise((resolve, reject) => {
    Sequelize.sync()
      .then(
        resolve(
          Student.findAll({
            where: {
              program: program,
            },
          })
        )
      )
      .catch(reject("No results returned."));
  });
};

module.exports.getStudentsByExpectedCredential = (credential) => {
  return new Promise((resolve, reject) => {
    Sequelize.sync()
      .then(
        resolve(
          Student.findAll({
            where: {
              expectedCredential: credential,
            },
          })
        )
      )
      .catch(reject("No results returned."));
  });
};

module.exports.getStudentById = (id) => {
  return new Promise((resolve, reject) => {
    Sequelize.sync()
      .then(
        resolve(
          Student.findAll({
            where: {
              studentID: id,
            },
          })
        )
      )
      .catch(reject("No results returned."));
  });
};

module.exports.getPrograms = function () {
  return new Promise((resolve, reject) => {
    Sequelize.sync()
      .then(resolve(Program.findAll()))
      .catch(reject("No results returned."));
  });
};

module.exports.addStudent = (studentData) => {
  return new Promise((resolve, reject) => {
    studentData.isInternationalStudent = studentData.isInternationalStudent
      ? true
      : false;
    for (var i in studentData) {
      if (studentData[i] == "") studentData[i] = null;
    }
    Student.create(studentData)
      .then(resolve(Student.findAll()))
      .catch(reject("Unable to create student."));
  });
};

module.exports.updateStudent = (studentData) => {
  return new Promise((resolve, reject) => {
    studentData.isInternationalStudent = studentData.isInternationalStudent
      ? true
      : false;
    for (var i in studentData) {
      if (studentData[i] == "") studentData[i] = null;
    }
    Student.update(studentData, {
      where: {
        studentID: studentData.studentID,
      },
    })
      .then(resolve("Operation was a success."))
      .catch((err) => reject("Unable to update student."));
  });
};

module.exports.deleteStudentById = (id) => {
  return new Promise((resolve, reject) => {
    Student.destroy({
      where: {
        studentID: id,
      },
    })
      .then(resolve("Destroyed."))
      .catch((err) => reject("Unable to delete student."));
  });
};

module.exports.addProgram = (programData) => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        for (var i in programData) {
          if (programData[i] == "") programData[i] = null;
        }
        Program.create(programData)
          .then(resolve(Program.findAll()))
          .catch((err) => reject("Unable to create program."));
      })
      .then((err) => reject("Unable to create program."));
  });
};

module.exports.updateProgram = (programData) => {
  return new Promise((resolve, reject) => {
    for (var i in programData) {
      if (programData[i] == "") programData[i] = null;
    }
    Program.update(programData, {
      where: {
        programCode: programData.programCode,
      },
    })
      .then(resolve("Operation was a success."))
      .catch((err) => reject("Unable to update program."));
  });
};

module.exports.getProgramByCode = (code) => {
  return new Promise((resolve, reject) => {
    Program.findAll({
      where: {
        programCode: code,
      },
    })
      .then((data) => resolve(data[0]))
      .catch((err) => reject("No results returned."));
  });
};

module.exports.deleteProgramByCode = (code) => {
  return new Promise((resolve, reject) => {
    Program.destroy({
      where: {
        programCode: code,
      },
    })
      .then(resolve("Destroyed."))
      .catch((err) => reject(err));
  });
};
