const joiToSwagger = (schema) => {
    // console.log('✌️schema --->', schema);
    const swaggerSchema = {};

    // Iterate through the schema keys
    for (const key in schema.describe().keys) {
        // console.log('✌️key --->', key);
        const { type, flags, meta } = schema.describe().keys[key];
        // console.log('✌️type, flags, meta --->', type, flags, meta);

        swaggerSchema[key] = {
            type: type === 'string' ? 'string' : type,
            required: flags?.presence === 'required',
        };

        if (meta?.length > 0) {
            swaggerSchema[key].description = meta[0].message;
        }
    }

    return swaggerSchema;
};

const swaggerJoi = (validator) => {
    return (req, res, next) => {
        req.swaggerSchema = joiToSwagger(validator);
        next();
    };
};

module.exports = { swaggerJoi, };