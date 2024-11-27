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

const validateFormData = (schema, fileFields = []) => (req, res, next) => {
    const contentType = req.headers['content-type'] || '';

    // Check if the request's content type is multipart/form-data
    if (!contentType.startsWith('multipart/form-data')) {
        return response400(res, 'Invalid request type. Content-Type must be multipart/form-data.');
    }

    for (const field of fileFields) {
        if (!req.files?.[field] && !req.file) {
            return response400(res, `${field} is required.`);
        }
    }
    // Extract the non-file data from req.body
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return response400(res, error?.details?.[0]?.message);
    }

    req.body = value;
    next();
}

module.exports = { validateRequest, validateFormData };
module.exports.adminValidation = require("./admin.validation");
module.exports.userValidation = require("./user.validation");
module.exports.organizationValidation = require("./organization.validation");
module.exports.profileValidation = require("./profile.validation");
module.exports.contactValidation = require("./contact.validation");
module.exports.interactionsValidation = require("./interactions.validation");