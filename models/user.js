"use strict";

const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        required: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        required: true,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
    },
    {}
  );

  function generateHash(user) {
    if (user === null) {
      throw new Error("generateHash -> User not found");
    } else if (!user.changed("password")) return user.password;
    else {
      let salt = bcrypt.genSaltSync();
      return (user.password = bcrypt.hashSync(user.password, salt));
    }
  }

  User.beforeCreate(generateHash);
  User.beforeUpdate(generateHash);

  User.prototype.generatePassChangeHash = function (newPassword) {
    let salt = bcrypt.genSaltSync();
    const newPass = bcrypt.hashSync(newPassword, salt);
    return JSON.stringify(newPass);
  };

  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.correctPassword = function (enteredPassword) {
    return User.encryptPassword(enteredPassword, this.salt) === this.password;
  };

  User.associate = function (models) {
    User.hasMany(models.Form, { foreignKey: "userId" });
  };
  return User;
};
