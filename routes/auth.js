const { getData, saveData, generateToken } = require("../utils");

module.exports = (app, models) => {
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const users = getData("./db/users.json");

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const token = generateToken({
        role: user.role,
        email: user.email,
        name: user.lastName,
      });

      res.status(200).json({
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          last_name: user.lastName,
          first_name: user.firstName,
          role: user.role,
          formData: user.formData,
          emissions: user.emissions,
        },
      });
    } else {
      res.status(401).send("Username or password incorrect");
    }
  });

  app.post("/api/auth/register", (req, res) => {
    //get the existing user data
    const existUsers = getData("./db/users.json");

    //get the new user data from post request
    const userData = req.body;
    //check if the userData fields are missing
    if (
      userData.email == null ||
      userData.password == null ||
      userData.firstName == null ||
      userData.lastName == null
    ) {
      return res.status(401).send({ error: true, msg: "User data missing" });
    }

    //check if the email exist already
    const findExist = existUsers.find((user) => user.email === userData.email);
    if (findExist) {
      return res.status(409).send({ error: true, msg: "email already exist" });
    }
    const id = Math.floor(1000000 + Math.random() * 9000000);
    const userForm = {
      stepYear: 0,
      stepCAEN: "",
      stepElectricity: {},
      stepHeating: [],
      stepWaste: [],
      stepRefrigerants: [],
      stepTransportation: [],
    };
    const emissions = {
      electricity: { CO2: 0, CH4: 0, N2O: 0 },
      heating: { CO2: 0, CH4: 0, N2O: 0 },
      waste: { CO2: 0, CH4: 0, N2O: 0 },
      refrigerants: { CO2: 0, CH4: 0, N2O: 0 },
      transportation: { CO2: 0, CH4: 0, N2O: 0 },
    };

    const newUser = {
      id: id,
      ...userData,
      role: "user",
      formData: userForm,
      emissions: emissions,
    };

    //append the user data
    existUsers.push(newUser);
    //save the new user data
    saveData(existUsers, "./db/users.json");
    const token = generateToken({
      role: "user",
      email: userData.email,
      name: userData.lastName,
    });

    res.status(201).json({
      accessToken: token,
      user: {
        id: userData.id,
        email: userData.email,
        last_name: userData.lastName,
        first_name: userData.firstName,
        formData: userForm,
        emissions: emissions,
      },
    });
  });
};
