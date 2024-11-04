const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Node Setup',
        description: 'API documentation',
    },
    host: "localhost:3000",//process.env.HOST || 'localhost:3000',  //api.ppim.ca
    schemes: "http", //[process.env.SCHEME || 'http'],
    basePath: '/api/v1',
    tags: [],
};
const endpointsFiles = ['./routes/index.js'];

const outputFile = './swagger_output.json';

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation generated successfully!');
    // require('./index'); // Your main server file
});