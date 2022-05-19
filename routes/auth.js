const { getData, saveData, generateToken } = require("../utils/utils");

module.exports = (app, models) => {
  app.post("/auth/register", async (req, res) => {
    //get the new user data from post request
    const userData = req.body;
    //get the existing user data
    const isExistingUser = await models.User.findOne({
      where: { email: userData.email },
    });

    //check if the userData fields are missing
    if (
      !userData.email ||
      !userData.password ||
      !userData.firstName ||
      !userData.lastName
    ) {
      return res.status(401).send({ error: true, msg: "User data missing" });
    }

    //check if the email exist already
    if (isExistingUser) {
      return res.status(409).send({ error: true, msg: "Email already exists" });
    }
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
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };

    //append the user data
    const user = await models.User.create(newUser);
    const token = generateToken({
      uid: user.id,
    });

    res.status(201).json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        last_name: user.lastName,
        first_name: user.firstName,
        formData: userForm,
        emissions: emissions,
      },
    });
  });

  app.post("/auth/login", async (req, res) => {
    const userData = req.body;

    if (!userData.email || !userData.password) {
      return res.status(403).send({ error: true, msg: "User data missing" });
    }

    const user = await models.User.findOne({
      where: { email: userData.email },
    });

    const isValidPassword = await user.validPassword(userData.password);

    if (isValidPassword) {
      const token = generateToken({
        uid: user.id,
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
      return res
        .status(401)
        .send({ error: true, msg: "Username or password invalid" });
    }
  });
};
