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
      return res
        .status(401)
        .send({ error: true, message: "User data missing" });
    }

    //check if the email exist already
    if (isExistingUser) {
      return res
        .status(409)
        .send({ error: true, message: "Email already exists" });
    }

    if (
      !userData.password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
      )
    ) {
      return res.status(409).send({
        error: true,
        message:
          "Password must contain at least 8 characters, one number and one uppercase letter",
      });
    }
    const userForm = {
      formId: null,
      stepYear: 0,
      stepCAEN: "",
      stepElectricity: {},
      stepHeating: [],
      stepWaste: [],
      stepRefrigerants: [],
      stepTransportation: [],
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
        email: user.email,
        last_name: user.lastName,
        first_name: user.firstName,
      },
      formData: userForm,
    });
  });

  app.post("/auth/login", async (req, res) => {
    const userData = req.body;
    if (!userData.email || !userData.password) {
      return res
        .status(403)
        .send({ error: true, message: "User data missing" });
    }

    const user = await models.User.findOne({
      where: { email: userData.email },
    });
    if (!user) {
      return res.status(403).send({ error: true, message: "User not found" });
    }
    const isValidPassword = await user.validPassword(userData.password);
    const hasForms = await models.Form.findOne({
      where: { userId: user.id },
    });
    if (isValidPassword && hasForms) {
      const token = generateToken({
        uid: user.id,
      });
      let formData = {
        formId: null,
        stepYear: 0,
        stepCAEN: "",
        stepElectricity: {},
        stepHeating: [],
        stepWaste: [],
        stepRefrigerants: [],
        stepTransportation: [],
      };
      //luam ultimul formular creat
      const userForm = await models.Form.findAll({
        limit: 1,
        where: {
          userId: user.id,
        },
        order: [["createdAt", "DESC"]],
      });
      formData.formId = userForm[0].id;
      formData.stepYear = userForm[0].year;
      formData.stepCAEN = userForm[0].CAEN;
      formData.stepElectricity = await models.FormStepElectricity.findOne({
        where: { formId: userForm[0].dataValues.id },
      });
      formData.stepHeating = await models.FormStepHeating.findAll({
        where: { formId: userForm[0].dataValues.id },
      });
      formData.stepWaste = await models.FormStepWaste.findAll({
        where: { formId: userForm[0].dataValues.id },
      });
      formData.stepRefrigerants = await models.FormStepRefrigerants.findAll({
        where: { formId: userForm[0].dataValues.id },
      });
      formData.stepTransportation = await models.FormStepTransportation.findAll(
        {
          where: { formId: userForm[0].dataValues.id },
        }
      );

      const allUserFormsData = await models.Form.findAll({
        where: {
          userId: user.id,
        },
      });

      const allUserFormsYears = allUserFormsData.reduce((acc, curr) => {
        acc.push(curr.year);
        return acc;
      }, []);

      res.status(200).json({
        accessToken: token,
        user: {
          email: user.email,
          last_name: user.lastName,
          first_name: user.firstName,
          userFormYears: allUserFormsYears,
        },
        formData: formData,
      });
    } else if (isValidPassword && !hasForms) {
      const token = generateToken({
        uid: user.id,
      });
      let formData = {
        formId: null,
        stepYear: 0,
        stepCAEN: "",
        stepElectricity: {},
        stepHeating: [],
        stepWaste: [],
        stepRefrigerants: [],
        stepTransportation: [],
      };
      res.status(200).json({
        accessToken: token,
        user: {
          email: user.email,
          last_name: user.lastName,
          first_name: user.firstName,
          userFormYears: [],
        },
        formData: formData,
      });
    } else {
      return res
        .status(409)
        .send({ error: true, message: "Username or password invalid" });
    }
  });
};
