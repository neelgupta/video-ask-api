const { response400 } = require("../../lib/response-messages");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return response400(res, error.details[0].message);
        }
        next();
    };
};

module.exports = { validateRequest };
module.exports.userValidation = require("./user.validation");
module.exports.organizationValidation = require("./organization.validation");
module.exports.profileValidation = require("./profile.validation");