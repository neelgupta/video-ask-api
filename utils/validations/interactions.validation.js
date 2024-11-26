const Joi = require("joi");

const addFolderValidator = Joi.object({
    organization_id: Joi.string().required().messages({
        "*": "Please enter valid organization Id",
    }),
    folder_name: Joi.string().required().messages({
        "*": "Folder name is required",
    }),
});

const updateFolderValidator = Joi.object({
    folder_id: Joi.string().required().messages({
        "*": "Please enter valid folder Id",
    }),
    folder_name: Joi.string().optional(),
});


module.exports = { addFolderValidator, updateFolderValidator }