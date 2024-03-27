const Model = require("../../../models");
const Op = Model.Sequelize.Op;
const config = require("../../../config/jwt.secret");
const jwt = require("jsonwebtoken");
const Validator = require("fastest-validator");
var bcrypt = require("bcryptjs");
var response = require("../../../middleware/response.middleware");

exports.signUp = (req, res) => {
  Model.User.findOne({ where: { email: req.body.email } })
    .then((result) => {
      if (result) {
        res.json({
          status: 400,
          code: 0,
          message: "Email Id Already Exists ",
          data: "",
        });
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            const user = {
              name: req.body.name,
              email: req.body.email,
              password: hash,
            };

            const schema = {
              name: { type: "string", optional: false, max: "100" },
              email: { type: "string", optional: false, max: "100" },
              password: { type: "string", optional: false, max: "100" },
            };

            const v = new Validator();
            const validatorResponse = v.validate(user, schema);
            if (validatorResponse !== true) {
              res.json({
                status: 400,
                code: 0,
                message: "Validation Failed",
                data: validatorResponse,
              });
              return;
            }

            Model.User.create(user).then((result) => {
              res.json({
                status: 201,
                code: 1,
                message: "User Created",
                data: result,
                // accesstoken: token,
              });
            });
          });
        });
      }
    })
    .catch((err) => {
      res.json({
        status: 500,
        code: 0,
        message: err,
        data: "",
      });
    });
};

exports.login = async (req, res) => {
  try {
    if (!req.body.username) {
      return response.fail(res, "User name is required.", []);
    }
    if (!req.body.password) {
      return response.fail(res, "Password is required.", []);
    }
    const { whereCondition, username, password } = req.body;

    const authenticationResponse = await Model.form_headers.findAll({
      where: whereCondition,
      include: [{ model: Model.form_attributes, as: 'form_attributes', required: false },],
    });
    console.log("authenticationResponse", authenticationResponse);
    if (authenticationResponse.length === 0 || (authenticationResponse.length && authenticationResponse[0]?.form_attributes.length == 0)) {
      return response.fail(res, "Not found any authentication Model.", []);
    }
    const formAttributeDetails = authenticationResponse[0]?.form_attributes || [];

    // find field name
    const userFieldData = {
      password_field_name: formAttributeDetails.find(attribute => attribute.column_name === 'password')?.column_name + "_" + formAttributeDetails.find(attribute => attribute.column_name === 'password')?.id,
      username_field_name: formAttributeDetails.find(attribute => attribute.column_name === 'username')?.column_name + "_" + formAttributeDetails.find(attribute => attribute.column_name === 'username')?.id,
    };

    const { table_name, form_attributes } = authenticationResponse[0];
    const userMasterResponse = await Model[table_name].findOne({ where: { [userFieldData.username_field_name]: username } })

    if (!userMasterResponse) {
      return response.fail(res, "Invalid Credential.", []);
    }

    const passwordMatch = await bcrypt.compare(password, userMasterResponse[userFieldData.password_field_name]);

    if (passwordMatch) {
      const { id } = userMasterResponse.dataValues;
      userMasterResponse.dataValues.accesstoken = jwt.sign({ username, userId: id }, config.secret, { expiresIn: "24h" });
      userMasterResponse.dataValues.userFieldData = userFieldData;
      // authenticated column name 
      userMasterResponse.dataValues.sessionData = form_attributes.filter(item => item.need_to_store_in_session === 1).map(item => item.column_name + "_" + item.id);
      return response.success(res, "Login Successfully.", userMasterResponse);
    } else {
      return response.fail(res, "Invalid Credential.", []);
    }
  } catch (error) {
    console.error("Error during user authentication:", error);
    return response.catchError(res, "Internal Server Error.", []);
  }
};
