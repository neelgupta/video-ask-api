const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: "Project Name",
        version: '1.0.0',
        description: 'Api documention',
        contact: {
            name: "developer"
        },
        servers: [{
            url: 'http://localhost:3000'
        }]
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
}

const apis = [
    path.resolve(__dirname, "./authDocs.js"),
];

const swaggerDocs = swaggerJSDoc({
    swaggerDefinition,
    apis
});

module.exports = swaggerDocs