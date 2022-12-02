const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

var userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://ylong9:Sin90l..@yongdalong.frd4mco.mongodb.net/?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    }

    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(userData.password, salt))
      .then((hash) => {
        userData.password = hash;
        let newUser = new User(userData);
        newUser.save((err) => {
          if (err) {
            if (err.code === 11000) {
              reject("User Name already taken");
            } else {
              reject("There was an error creating the user: " + err);
            }
          }
          resolve();
        });
      })
      .catch((err) => {
        reject("There was an error encrypting the password");
      });
  });
};

module.exports.checkUser = (userData) => {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((user) => {
        bcrypt.compare(userData.password, user[0].password).then((result) => {
          if (!result)
            reject("Incorrect Password for user: " + userData.userName);
        });
        user[0].loginHistory.push({
          dateTime: new Date().toString(),
          userAgent: userData.userAgent,
        });
        User.updateOne(
          { userName: user[0].userName },
          { $set: { loginHistory: user[0].loginHistory } }
        )
          .exec()
          .then(() => {
            resolve(user[0]);
          })
          .catch((err) => {
            reject("There was an error verifying the user: " + err);
          });
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};
